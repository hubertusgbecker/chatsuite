const util = require('node:util');
const childProcess = require('node:child_process');
const execPromise = util.promisify(childProcess.exec);

// Projects to exclude from CI build/push operations
const PROJECTS_EXCLUDED = [];
const DOCKER_REGISTRY_NAME = 'registry';
const DOCKER_REGISTRY_PORT = 5020;
const DOCKER_REGISTRY_VERSION = 2;
const ZOT_OCI_REPOSITORY_PORT = 5000;

const runCmd = (cmd) => {
  const cleanCmd = cmd.replace(/\n/g, '');
  console.log(`$ ${cleanCmd}`);
  return execPromise(cleanCmd);
};

module.exports = {
  DOCKER_REGISTRY_NAME,
  DOCKER_REGISTRY_PORT,
  DOCKER_REGISTRY_VERSION,
  ZOT_OCI_REPOSITORY_PORT,
  PROJECTS_EXCLUDED,
  runCmd,
};
