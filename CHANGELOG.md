# Changelog

All notable changes to this project will be documented in this file.

## v0.3.1 - 2025-12-28

### Added

- **LibreChat Nginx Configuration**: Added reverse proxy support for LibreChat service
  - LibreChat upstream block with proper port mapping (3080)
  - Location block `/librechat` with WebSocket support
  - Full HTTP/1.1 upgrade headers for real-time chat functionality

### Fixed

- **Nginx Startup Reliability**: Resolved container crash loop on service startup
  - Commented out static n8n upstream that caused "host not found" errors
  - Implemented dynamic DNS resolution for n8n service (`set $n8n_backend n8n:5678`)
  - Prevents nginx failures when services start in different order
  - Resolves repeated container restart issues on Synology DiskStation

### Security

- **Template Credential Hardening**: Replaced actual password values with secure placeholders
  - Changed `minioadmin123` to `CHANGE_ME_MinIO_Dev_Password` in env.dev
  - Changed production passwords to `CHANGE_ME_MinIO_Production_Password` in env.host
  - Changed QA passwords to `CHANGE_ME_MinIO_QA_Password` in env.qa
  - Added security warnings for all password fields
  - Resolves GitGuardian security alert for Generic Password exposure

### Notes

- Nginx now uses Docker's embedded DNS resolver (127.0.0.11) for runtime hostname resolution
- All services (pgadmin, minio, n8n, librechat) now use dynamic resolution pattern
- Template files are safe to commit; actual credentials remain in `.env.*` (not tracked)

## v0.3.0 - 2025-12-21

### Added

- **Comprehensive ESLint Configuration**: Enterprise-grade linting infrastructure
  - Security-focused ESLint plugins (eslint-plugin-security, @microsoft/eslint-plugin-sdl)
  - TypeScript strict type checking with @typescript-eslint/eslint-plugin
  - React best practices with eslint-plugin-react and eslint-plugin-react-hooks
  - Accessibility checks with eslint-plugin-jsx-a11y
  - Import organization with eslint-plugin-import
- **Prettier Code Formatting**: Strict code formatting standards
  - Configured Prettier with 100-character line width
  - Single quotes, trailing commas, and semicolons enforced
  - Integration with ESLint via eslint-config-prettier
- **Security Scanning Infrastructure**: KICS and Trivy for comprehensive security analysis
  - KICS Infrastructure-as-Code security scanning
  - Trivy Docker image vulnerability scanning
  - 87.5% reduction in security vulnerabilities (32 → 4 remaining)
- **Git Hooks with Husky**: Automated quality gates
  - Pre-commit hooks for linting and security checks
  - Commit message validation with commitlint
  - Automated code formatting on commit
- **TypeScript Strict Mode**: Enhanced type safety across the codebase
  - Enabled strict mode in tsconfig.base.json
  - Full type checking for all projects

### Changed

- **Pre-Commit Workflow**: All commits must pass linting and security checks
- **Development Standards**: Updated AGENTS.md with pre-commit requirements
- **Contributing Guidelines**: Enhanced with linting and security workflow
- **README**: Added security workflow documentation

### Notes

- All new code must pass ESLint checks before commit
- Security scans are required before creating pull requests
- Git hooks automatically enforce code quality standards
- 4 remaining security issues are false positives or require manual review

## v0.2.0 - 2025-12-20

### Added

- **MinIO Integration**: Added S3-compatible object storage service
  - MinIO service with health checks on ports 9000 (API) and 9001 (Console)
  - Comprehensive MinIO documentation in `config/minio/README.md`
  - MinIO proxy routes in nginx (`/minio/` and `/minio-api/`)
  - MinIO environment variables in all environment templates
- **Security Infrastructure**: Automated security scanning with KICS and Trivy
  - GitHub Actions workflow for weekly and on-demand security scans
  - KICS configuration for Infrastructure-as-Code scanning
  - Trivy integration for Docker image vulnerability scanning
  - Automated PR creation for HIGH/CRITICAL security findings
  - SARIF upload to GitHub Security tab
- **Documentation Consolidation**: Merged all AI agent guidelines into single source of truth
  - Consolidated `.github/copilot-instructions.md` into `AGENTS.md`
  - Added comprehensive table of contents to `AGENTS.md`
  - Added project metadata header with repository info and tech stack
  - Enhanced `AGENTS.md` with 10 comprehensive development rules
- **Enhanced Contributing Guidelines**: Complete rewrite of contribution documentation
  - Comprehensive contribution workflow (fork and direct access)
  - Detailed bug reporting and enhancement suggestion templates
  - Development setup and testing requirements
  - Git hooks, code style, and architecture contribution guidelines
- **Standardized Code of Conduct**: Updated to industry standard
  - Adopted Contributor Covenant v2.1
  - Consistent "community leaders" terminology
  - Four-tier enforcement guidelines
  - Streamlined reporting mechanism

### Changed

- **Docker Configuration**: Fixed all localhost references to use proper container names
  - Changed MinIO healthcheck from `localhost:9000` to `minio:9000`
  - Changed MCPHub healthcheck from `localhost:3000` to `mcphub:3000`
  - Ensures proper Docker networking between services
- **Environment Files**: Synchronized all environment configurations
  - Added MinIO variables to `.env.dev`, `.env.host`, and `.env.qa`
  - Synchronized with templates `env.dev`, `env.host`, and `env.qa`
- **README Enhancement**: Updated with security badges and service documentation
  - Added KICS+Trivy security scanning badge
  - Updated service architecture table with MinIO
  - Enhanced project header with professional formatting

### Removed

- `.github/copilot-instructions.md` (merged into `AGENTS.md`)

### Notes

- All services now properly use Docker container names for inter-service communication
- MinIO provides S3-compatible storage at `https://localhost:10443/minio/`
- Security scanning runs weekly and on every push to main/develop branches
- `AGENTS.md` is now the authoritative reference for all development standards

## v0.1.0 - 2025-11-23

### Changed

- Standardized documentation and contribution workflow.
- Cleaned and consolidated `CONTRIBUTING.md`.
- Fixed `README.md` Quick Start code blocks and unified environment and
  mkcert instructions.
- Standardized issue templates in `.github/ISSUE_TEMPLATE/` for bug reports
  and feature requests.

### Added

- `SECURITY.md` with private reporting instructions, response timelines,
  coordinated disclosure policy, and safe-harbor note.
- Minor editorial and formatting fixes across documentation.

### Notes

- Maintainer contact for confidential reports: `hubertus@hubertusbecker.com`.
- Recommended next step: remove outer code fences from some docs to ensure
  proper Markdown rendering (optional follow-up).
