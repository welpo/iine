# contributing to iine

thanks for contributing to [iine](https://github.com/welpo/iine). before implementing new features and changes, please [submit an issue](https://github.com/welpo/iine/issues/new) so that we can discuss it.

we welcome contributions in many forms, including:

- bug reports
- feature requests
- code patches
- documentation improvements
- self-hosting improvements

if you're not sure how to contribute or need help with something, please don't hesitate to reach out via the [issue tracker](https://github.com/welpo/iine/issues) or [mail](mailto:iine@osc.garden?subject=[github]%20iine).

## pull requests

working on your first pull request? you can learn how from this free video series:

[**how to contribute to an open source project on github**](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

please make sure the following is done when submitting a pull request:

1. **keep your pr small**. small pull requests are much easier to review and more likely to get merged. make sure the pr does only one thing, otherwise please split it.
2. **use descriptive titles**. it is recommended to follow this [commit message style](#conventional-commit-messages-with-gitmoji).
3. **test your changes**. make sure to test different configurations that might affect your changes.
4. **fill the pr template**. the template will guide you through the process of submitting a pr.

### conventional commit messages with gitmoji

format: `<gitmoji> <type>(<scope>): <description>`

`<gitmoji>` is an emoji from the [gitmoji](https://gitmoji.dev/) list. it makes it easier to visually scan the commit history and quickly grasp the purpose of changes.

`<scope>` is optional. if your change affects a specific part of the codebase, consider adding the scope. scopes should be brief but recognizable, e.g. `client`, `database`, or `docs`.

the various types of commits:

- `feat`: a new api or behaviour **for the end user**.
- `fix`: a bug fix **for the end user**.
- `docs`: a change to the website or other markdown documents.
- `refactor`: a change to code that doesn't change behaviour, e.g. splitting files, renaming internal variables, improving code style…
- `chore`: upgrading dependencies, releasing new versions… chores that are **regularly done** for maintenance purposes.
- `misc`: anything else that doesn't change production code, yet is not `chore`. e.g. updating github actions workflow.

the commits within your pr don't need to follow this convention (we'll [squash them](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests)). however, the pr title should be in this format. if you're not sure about the title, don't worry, we'll help you fix it. your code is more important than conventions!

example:

```text
🐛 fix(client): handle network timeout gracefully
^  ^-^^-----^   ^-------------------------------^
|  |  |         |
|  |  |         +-> description in imperative and lowercase.
|  |  |
|  |  +-> the scope of the change.
|  |
|  +-------> type: see above for the list we use.
|
+----------> a valid gitmoji.
```

## coding style guidelines

while we don't enforce a strict coding style, we appreciate it when contributions follow the existing code style of the project. this makes the codebase easier to read and maintain. if you are making significant changes or additions, please try to maintain consistency with the current coding patterns and idioms.

key style preferences:

- minimal comments (code should be self-documenting)
- simple, readable code over clever solutions

## code of conduct

we expect all contributors to follow our [code of conduct](./CODE_OF_CONDUCT.md). please be respectful and professional when interacting with other contributors

## license

the code is available under the [agpl license](./COPYING).

thank you for your contributions!
