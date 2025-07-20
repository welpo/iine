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
