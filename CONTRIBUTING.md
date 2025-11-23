# Contributing to ChatSuite

Thank you for your interest in contributing to ChatSuite — we appreciate it.

Please read the following guidelines before opening issues or pull requests.

## 1. Code of Conduct

- By participating you agree to follow our `CODE_OF_CONDUCT.md`.
- If you experience harassment or need to report a sensitive incident, open a
  GitHub issue with the `code-of-conduct` label or email the maintainers at
  `hubertus@hubertusbecker.com` for confidential reports.

## 2. Filing issues

- Use the templates in `.github/ISSUE_TEMPLATE/`:
  - `bug_report.md` for bugs
  - `feature_request.md` for improvement ideas
- Fill the templates thoroughly: include environment, steps to reproduce, and
  expected behavior for bugs; include motivation and alternatives for features.

## 3. Pull requests

- Fork the repository and work on a feature branch with a descriptive name.
- Keep changes focused and small — one concern per PR.
- Include tests for new behavior and update existing tests when necessary.
- Run lint and tests locally before opening a PR:

```bash
pnpm install
pnpm lint
pnpm test
```

## 4. Review process

- We use GitHub PR reviews. Please respond to review comments and iterate as
  needed.
- Maintainers may request changes or run additional CI checks before merging.

## 5. Tests & style

- The workspace uses `pnpm` and standard linting/configuration. Ensure code
  follows existing project style and run `pnpm lint` locally.

## 6. Security

- For security vulnerabilities, prefer confidential reporting (email
  `hubertus@hubertusbecker.com`) rather than public issues. See the Reporting
  section above for Code of Conduct incidents.

## 7. Design discussions

- For larger changes, open an issue to discuss the proposal before
  implementing.

If you're unsure about anything, open an issue and ask — maintainers will be
happy to help.

