#!/usr/bin/env node

/**
 * Environment Resolution Helper for ChatSuite
 *
 * This script ensures proper environment variable handling across all pnpm commands.
 * It reads from ./.env and provides the correct NX_APP_ENV value.
 *
 * Usage:
 *   node tools/dev-scripts/cmd-resolve-env.js [fallback]
 *
 * Returns the resolved NX_APP_ENV value, with optional fallback.
 */

const fs = require('fs');
const path = require('path');

// Find project root (where package.json exists)
function findProjectRoot(currentDir = __dirname) {
  const packageJsonPath = path.join(currentDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    return currentDir;
  }

  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) {
    throw new Error('Could not find package.json - are you in the project directory?');
  }

  return findProjectRoot(parentDir);
}

// Parse .env file
function parseEnvFile(envPath) {
  const envVars = {};

  if (!fs.existsSync(envPath)) {
    return envVars;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Parse KEY=VALUE
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex !== -1) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      envVars[key] = value;
    }
  }

  return envVars;
}

// Resolve NX_APP_ENV with priority order
function resolveNxAppEnv(fallback = 'dev') {
  // Priority order:
  // 1. Process environment variable (if explicitly set by cross-env or similar)
  // 2. .env file in project root
  // 3. Fallback value

  const projectRoot = findProjectRoot();
  const envPath = path.join(projectRoot, '.env');

  // Check .env file first so an explicit project file always wins. This avoids
  // situations where a system or sudo environment variable (e.g. NX_APP_ENV)
  // inadvertently overrides the intended project configuration.
  const envVars = parseEnvFile(envPath);
  if (envVars.NX_APP_ENV) {
    return envVars.NX_APP_ENV;
  }

  // Fall back to process environment (used for explicit overrides like
  // cross-env during local development).
  if (process.env.NX_APP_ENV) {
    return process.env.NX_APP_ENV;
  }

  // Use fallback
  return fallback;
}

// Main execution
function main() {
  try {
    const fallback = process.argv[2] || 'dev';
    const resolvedEnv = resolveNxAppEnv(fallback);

    // Output just the value for script usage
    console.log(resolvedEnv);

  } catch (error) {
    console.error('Error resolving environment:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { resolveNxAppEnv, parseEnvFile, findProjectRoot };
