# self-hosting iine

run **iine** on your own Supabase instance

you can [self-host Supabase itself](https://supabase.com/docs/guides/self-hosting) or use your own PostgreSQL database

## when to self-host

- your site receives significant traffic (>10k button clicks/month)
- you need custom rate limiting or security policies
- you want complete control over your data

## prerequisites

- [Supabase account](https://supabase.com) (or PostgreSQL database)
- basic familiarity with SQL

## step 1: create Supabase project

1. go to [supabase.com](https://supabase.com) and create a new account
2. create a new project
3. note your project url
4. create an anon public key from Project Settings → API Keys → API Keys tab

## step 2: enable required extension

1. in your Supabase dashboard, go to [Database → Extensions](https://supabase.com/dashboard/project/_/database/extensions)
2. search for `pg_cron` and enable it
3. this extension is required for automatic rate limit cleanup

## step 3: set up database schema

1. go to sql editor in your Supabase dashboard
2. copy and paste the entire contents of [`setup.psql`](./setup.psql)
3. click run to execute the script

the script will create:

- `iine` schema with counters and rate limiting tables
- helper functions for domain/slug canonicalization
- public rpc functions for getting and incrementing counts
- row level security policies
- automatic cleanup job for rate limits

you can review the comments in the script for more information

## step 4: configure your client script

1. download [`iine.js`](./iine.js) from this repository
2. edit the configuration at the top:

   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-public-key';
   ```

3. host the modified script on your server
4. update your html to use your hosted script:

   ```html
   <script defer src="https://your-domain.com/path/to/iine.js"></script>
   ```

## step 5: test your setup

1. add a test button to a page:

   ```html
   <button class="iine-button" data-slug="/test"></button>
   ```

2. open the page and click the button
3. check your Supabase dashboard → table editor → `iine.counters`
4. you should see a new row with your domain, `/test` slug, and counter = 1

## self-hosting with plain PostgreSQL (without Supabase)

you can run iine on your own PostgreSQL instance, but there's an important detail to understand first

[PostgREST](https://postgrest.org) is the free, open-source server that turns a PostgreSQL database into the REST API your `iine.js` client already calls (those `/rest/v1/rpc/...` requests). Supabase just bundles it for you; on your own box you run it yourself

the rpc functions read the request's origin, referer, ip, and user-agent from `current_setting('request.headers')`. that setting is populated by **[PostgREST](https://postgrest.org)**, the layer Supabase uses to expose your database over http. a raw `psql` session or a database driver does **not** set it, so `request_origin` comes back null and every `increment_hits` call fails with `Invalid request.`

so a PostgreSQL-only setup still needs PostgREST in front of the database:

1. install and run PostgreSQL, and create the `anon` role the grants target: `create role anon nologin;` (Supabase creates this role for you; plain PostgreSQL doesn't)
2. run [`setup.psql`](./setup.psql). it's standard SQL. the rate-limit cleanup uses `pg_cron`, which you can install on plain PostgreSQL too (add it to `shared_preload_libraries`, then `create extension pg_cron;`); or remove the `cron.schedule(...)` call and run `truncate table iine.rate_limits;` from system cron instead
3. run [PostgREST](https://postgrest.org/en/stable/install.html) pointed at your database with `db-anon-role = anon`, behind a reverse proxy (nginx, Caddy…) for TLS
4. configure your client script as in [step 4](#step-4-configure-your-client-script) above (`SUPABASE_URL` = your proxy url; `SUPABASE_KEY` only matters if you set up PostgREST JWT auth; otherwise requests already map to `anon`)

### rate limiting without Cloudflare

the hosted iine runs behind Cloudflare, so `increment_hits` reads the real client ip from the `cf-connecting-ip` header. on a self-hosted setup that header doesn't exist, so `client_ip` is null, and `check_rate_limit` returns `false` (not rate limited) for a null ip, which means **rate limiting silently does nothing**

if you want rate limiting, point the function at whatever header your reverse proxy sets the real client ip in (commonly `x-forwarded-for`), and only trust it because the request passes through *your* proxy:

```sql
-- in public.increment_hits, change:
client_ip text := request_headers->>'cf-connecting-ip';
-- to (for example):
client_ip text := request_headers->>'x-forwarded-for';
```

make sure your proxy is configured to overwrite `x-forwarded-for` with the real client ip rather than appending to a client-supplied value, otherwise it can be spoofed

## monitoring & maintenance

### view your data

```sql
-- see all counters
SELECT origin_domain, slug, counter, created_ts
FROM iine.counters
ORDER BY counter DESC;

-- check rate limiting status
SELECT COUNT(*) as active_rate_limits
FROM iine.rate_limits;
```

### monitor usage

track your usage in Supabase dashboard:

- Database → Usage — Storage and bandwidth
- API → Logs — Request volume and errors

### rate limiting

the default setup allows 60 requests per hour per ip address. to adjust:

```sql
-- change max_requests in the rate limiting function
CREATE OR REPLACE FUNCTION iine.check_rate_limit(client_ip text)
-- ...
  max_requests int := 120; -- <- set your desired limit per hour
-- ...
```

### cleanup

rate limits are automatically cleaned every hour via `pg_cron`. you can manually clean old data:

```sql
-- remove rate limits
TRUNCATE TABLE iine.rate_limits;
```

## security considerations

- api keys: your Supabase anon key is safe to expose publicly
- row level security: all tables use rls to prevent unauthorized access
- rate limiting: built-in protection against abuse
- input validation: domain and slug inputs are sanitized and validated
- no private information: the system never stores ip addresses, user agents, or timestamps

## troubleshooting

### button not appearing

- check browser console for javascript errors
- verify your Supabase url and api key are correct
- ensure the html has `class="iine-button"`

### rate limiting too aggressive

- increase the limit in `iine.check_rate_limit()` function
- clear current rate limits: `TRUNCATE TABLE iine.rate_limits;`

## migration from public iine

if you're moving from the public hosted iine service:

1. set up your self-hosted instance (steps above)
2. update your script tags to point to your hosted script
3. optionally, export data from the hosted service (send me an email by clicking the email icon in the footer of [my site](https://osc.garden))

note: counters are domain-specific, so migration is only needed if you want to preserve historical counts

## support

having issues with self-hosting?

- check [Supabase documentation](https://supabase.com/docs)
- [report bugs](https://github.com/welpo/iine/issues)
- [ask questions](https://github.com/welpo/iine/discussions)
