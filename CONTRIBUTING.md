# Contributing to ChatSuite

First off, thank you for considering contributing to ChatSuite!
This project is released under the MIT License, which means your contributions
will also be covered under the same permissive license.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Guidelines for Non-Code Contributions](#guidelines-for-non-code-contributions)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Process](#development-process)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Git Hooks (pre-commit)](#git-hooks-pre-commit)
- [License](#license)

## Code of Conduct

We have adopted a Code of Conduct that we expect project participants to adhere
to. Please read [the full text](CODE_OF_CONDUCT.md) so that you can understand
what actions will and will not be tolerated.

If you experience harassment or need to report a sensitive incident, open a
GitHub issue with the `code-of-conduct` label or email the maintainers at
`hubertus@hubertusbecker.com` for confidential reports.

## Getting Started

### Fork-based workflow (recommended as a playground)

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/chatsuite.git
   ```
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

### Direct repository workflow (for contributors)

1. Clone the repository directly:
   ```bash
   git clone https://github.com/hubertusgbecker/chatsuite.git
   ```
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Push to the repository: `git push origin feature/your-feature-name`
5. Open a Pull Request

If you're interested in becoming a contributor with direct push access, please
reach out to the maintainers after making a few successful contributions via
issues and pull requests.

## How to Contribute

### Guidelines for Non-Code Contributions

We appreciate your attention to detail. However, minor fixes like typos or
grammar corrections should not be submitted individually. Instead, create an
issue noting these corrections, and we'll batch them into larger updates.

### Reporting Bugs

We use GitHub issues to track bugs. Before creating a bug report:

- Search existing [Issues](https://github.com/hubertusgbecker/chatsuite/issues)
  to ensure it hasn't already been reported
- If you find a closed issue that seems to address your problem, open a new
  issue and include a link to the original

When submitting a bug report, please use our bug report template
(`.github/ISSUE_TEMPLATE/bug_report.md`) and include as much detail as possible:

- Environment details (OS, Node version, pnpm version, Docker version)
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Service logs if applicable
- Screenshots or error messages

### Suggesting Enhancements

Enhancement suggestions are tracked through GitHub issues. Please use our
feature request template (`.github/ISSUE_TEMPLATE/feature_request.md`) when
suggesting enhancements. Include:

- Clear description of the proposed feature
- Motivation and use cases
- Possible implementation approach
- Alternative solutions you've considered

### Pull Requests

- Follow our pull request template
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow our coding conventions and style guidelines (see [AGENTS.md](AGENTS.md))
- Write meaningful commit messages following conventional commits format
- Update documentation as needed (README.md, AGENTS.md, service-specific docs)
- Add tests for new features
- Pull requests undergo automated checks, including build, lint, and security scans

## Development Process

### Test-Driven Development (TDD)

ChatSuite strictly follows Test-Driven Development for all contributions:

**The Red-Green-Refactor Cycle:**

1. 🔴 **RED**: Write a failing test first
   - Define what you want to build
   - Test fails because feature doesn't exist yet
   - Clarifies requirements before coding

2. 🟢 **GREEN**: Write minimal code to pass the test
   - Focus on making it work
   - Don't optimize prematurely
   - Keep it simple

3. 🔵 **REFACTOR**: Improve code quality
   - Clean up implementation
   - Remove duplication
   - Keep all tests green

**Example TDD Workflow:**
```bash
# 1. Write failing test
pnpm nx test my-app --watch
# Write test, see it fail (RED)

# 2. Implement feature
# Write code to make test pass (GREEN)

# 3. Refactor if needed
# Clean up code, tests stay green (REFACTOR)

# 4. Commit increment
git add .
git commit -m "test: add user creation validation"
git commit -m "feat: implement user creation (step 1/5)"
```

### Incremental Development

**Break work into small, achievable steps (15-30 minutes each):**

✅ **GOOD Example**: "Add User Authentication"
1. Create user model with tests (20 min)
2. Add password hashing with tests (15 min)
3. Implement login endpoint with tests (25 min)
4. Add JWT generation with tests (20 min)
5. Create auth middleware with tests (15 min)

Result: 5 small commits, fully tested, easy to review

❌ **BAD Example**: "Add User Authentication"
1. Implement entire auth system (4 hours)
2. Write tests at the end
3. One massive commit

Result: Hard to review, likely has bugs, difficult to debug

### Contribution Workflow

1. **Pick an issue** to work on or create a new one
2. **Comment on the issue** to let others know you're working on it
3. **Break down the work** into 5-10 small incremental steps
   - Each step should take 15-30 minutes
   - Each step should include tests
4. **Create a branch** with a descriptive name:
   - Feature: `feature/your-feature-name`
   - Bug fix: `fix/bug-description`
   - Documentation: `docs/what-you-are-documenting`
5. **Follow TDD cycle for each step**:
   - Write test first (RED)
   - Make it pass (GREEN)
   - Refactor (REFACTOR)
   - Commit the increment
6. **Write your code** following our style guidelines in [AGENTS.md](AGENTS.md)
7. **Add tests** for new functionality (tests come FIRST, not after)
8. **Update documentation** as needed
9. **Run local checks** before submitting:
   ```bash
   pnpm lint
   pnpm nx:test
   pnpm nx:integration
   pnpm nx:build
   ```
10. **Submit a pull request** with clear description
11. **Respond to code review feedback**

## Development Setup

### Prerequisites

1. **Install NVM (Node Version Manager):**

   - [NVM Installation Guide](https://github.com/nvm-sh/nvm#installing-and-updating)
   - In the project root, run:
     ```bash
     nvm use
     ```
     If this fails, check the required Node version in `.nvmrc` and run:
     ```bash
     nvm install $(cat .nvmrc)
     nvm use
     ```

2. **Install Docker:**

   - [Docker Installation Guide](https://docs.docker.com/engine/install/)
   - Verify installation:
     ```bash
     docker --version && docker-compose --version
     ```

3. **Install pnpm:**
   - This repo uses pnpm for efficient dependency management:
     ```bash
     npm install -g pnpm
     ```

### Initial Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Generate environment files:**

   ```bash
   cp config/env/env.dev config/env/.env.dev
   cp config/env/env.host config/env/.env.host
   cp config/env/env.qa config/env/.env.qa
   ```

3. **SSL Setup (Recommended for HTTPS):**

   ```bash
   brew install mkcert
   mkcert -install
   cd config/certificates
   mkcert -key-file localhost-key.pem -cert-file localhost-crt.pem localhost 127.0.0.1 ::1
   ```

4. **MCPHub Configuration:**

   ```bash
   cp config/mcphub/mcp_settings.json.example config/mcphub/mcp_settings.json
   ```

5. **Start the platform:**
   ```bash
   pnpm start
   ```

### Development Commands

```bash
# Core operations
pnpm start              # Launch all services
pnpm stop               # Graceful shutdown
pnpm rebuild            # Complete system rebuild

# Development
pnpm nx:start           # Start without Docker
pnpm start:client:dev   # Client app with DEV API
pnpm start:workspace:dev # Development environment

# Code quality
pnpm lint               # Run linters
pnpm nx:test            # Run all tests
pnpm nx:test:affected   # Test only changed code
pnpm nx:build           # Build for production

# Health & monitoring
pnpm check              # Verify dependencies
pnpm env:show           # Display current environment
pnpm test               # Comprehensive health checks
```

## Testing

### Writing Tests

- Place unit tests next to the code they test
- Place integration tests in `tests/integration/` within each project
- Follow existing test patterns and conventions
- Aim for high test coverage, especially for business logic

### Running Tests

```bash
# Run all tests
pnpm nx:test

# Run tests for a specific project
pnpm nx test api-customer-service

# Run tests for changed code only
pnpm nx:test:affected

# Run integration tests
pnpm nx run-many --target=integration --all
```

### Test Requirements

- All new features must include appropriate tests
- Bug fixes should include regression tests
- Update existing tests when modifying functionality
- Ensure all tests pass before submitting a PR

## Git Hooks (pre-commit)

To keep the codebase lint-clean, we provide Git pre-commit hooks that run
linting and formatting checks before committing. Install the hooks by running
from the repository root:

```bash
# Install hooks (if script exists in tools/dev-scripts/)
./tools/dev-scripts/cmd-install-git-hooks.sh

# Or manually copy hooks
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

The pre-commit hook will:

- Run `pnpm lint` to check code style
- Ensure code formatting is consistent
- Prevent commits with linting errors

If pnpm is not available on your PATH, the hook will warn and skip the check.

## Code Style Guidelines

- Follow the standards defined in [AGENTS.md](AGENTS.md)
- Use TypeScript with strict mode enabled
- Follow Nx monorepo conventions
- Write self-documenting code with clear variable names
- Add comments only when necessary to explain "why," not "what"
- Use meaningful commit messages following conventional commits:
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `chore: maintenance tasks`
  - `refactor: code improvements`
  - `test: add or update tests`

## Architecture Contributions

When contributing to the architecture:

- Maintain clear separation between apps and libs
- Follow the code sharing strategy in [AGENTS.md](AGENTS.md)
- Respect architectural boundaries
- Extract reusable code into appropriate library categories:
  - `libs/ui/` - Reusable UI components
  - `libs/features/` - Complete features
  - `libs/core/` - Business logic
  - `libs/data/` - Data access
  - `libs/utils/` - Pure utility functions

## Documentation

- Update README.md for user-facing changes
- Update AGENTS.md for developer-facing changes
- Add or update service-specific documentation in `config/*/README.md`
- Include JSDoc comments for public APIs
- Update environment templates when adding new configuration

## Security

- For security vulnerabilities, prefer confidential reporting via email to
  `hubertus@hubertusbecker.com` rather than public issues
- Never commit sensitive data (passwords, tokens, API keys)
- Follow security best practices outlined in [AGENTS.md](AGENTS.md)
- Run security scans locally before submitting PRs

## Design Discussions

For larger changes:

1. Open an issue to discuss the proposal before implementing
2. Tag it with `discussion` or `design` label
3. Wait for maintainer feedback
4. Proceed with implementation once approach is agreed upon

## Questions?

If you're unsure about anything, open an issue and ask — maintainers will be
happy to help. You can also reach out via email at `hubertus@hubertusbecker.com`.

## License

By contributing to ChatSuite, you agree that your contributions will be
licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Thank you for contributing to ChatSuite! Your efforts help make this platform
better for everyone.

Built with ❤️ by the ChatSuite community
