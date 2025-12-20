//@INFO: Ref:  https://www.javierbrea.com/blog/pnpm-nx-monorepo-03/

const path = require('node:path');

const spawn = require('cross-spawn');

const processArguments = process.argv.slice(2);

const ALL_FLAG = '--all';
const TASK_NAME = processArguments[0];
const BASE_BRANCH_NAME = processArguments[1];
const ROOT_PATH = path.resolve(__dirname, '../..');
const ENCODING_TYPE = 'utf8';
const NEW_LINE_CHAR = '\n';

class CliLogs {
  constructor() {
    this._logs = [];
    this.log = this.log.bind(this);
  }

  log(log) {
    const cleanLog = log.trim();
    if (cleanLog.length) {
      this._logs.push(cleanLog);
    }
  }

  get logs() {
    return this._logs;
  }

  get joinedLogs() {
    return this.logs.join(NEW_LINE_CHAR);
  }
}

function pnpmRun(...args) {
  const logData = new CliLogs();
  let pnpmProcess;
  return new Promise((resolve, reject) => {
    const processOptions = {
      cwd: ROOT_PATH,
      env: process.env,
    };

    pnpmProcess = spawn('pnpm', args, processOptions);

    pnpmProcess.stdin.setEncoding(ENCODING_TYPE);
    pnpmProcess.stdout.setEncoding(ENCODING_TYPE);
    pnpmProcess.stderr.setEncoding(ENCODING_TYPE);
    pnpmProcess.stdout.on('data', logData.log);
    pnpmProcess.stderr.on('data', logData.log);

    pnpmProcess.on('close', (code) => {
      if (code !== 0) {
        reject(logData.joinedLogs);
      } else {
        resolve(logData.joinedLogs);
      }
    });
  });
}

function commaSeparatedListToArray(str) {
  return str
    .trim()
    .split(',')
    .map((element) => element.trim())
    .filter((element) => !!element.length);
}

function getAffectedCommandResult(str) {
  const outputLines = str.trim().split(/\r?\n/);
  if (outputLines.length > 2) {
    return outputLines.slice(-1)[0];
  }
  return '';
}

async function affectedProjectsContainingTask(taskName, baseBranch) {
  // First get affected projects
  const affectedArgs = [
    'nx',
    'show',
    'projects',
    '--affected',
    baseBranch ? '--base' : undefined,
    baseBranch || undefined,
  ].filter(Boolean);

  const affectedProjectsStr = await pnpmRun(...affectedArgs);
  const affectedProjects = affectedProjectsStr
    .trim()
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('>'))
    .map((line) => line.trim());

  // Then get projects with the target
  const withTargetArgs = ['nx', 'show', 'projects', '--with-target', taskName];

  const projectsWithTargetStr = await pnpmRun(...withTargetArgs);
  const projectsWithTarget = projectsWithTargetStr
    .trim()
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('>'))
    .map((line) => line.trim());

  // Return intersection of affected projects and projects with target
  return affectedProjects.filter((project) =>
    projectsWithTarget.includes(project)
  );
}

async function allProjectsContainingTask(taskName) {
  // pnpm nx show projects --with-target=[task]
  const args = ['nx', 'show', 'projects', '--with-target', taskName];

  const projectsStr = await pnpmRun(...args);
  // Filter out pnpm command output lines and empty lines
  return projectsStr
    .trim()
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('>'))
    .map((line) => line.trim());
}

async function printAffectedProjectsContainingTask() {
  const projects =
    BASE_BRANCH_NAME === ALL_FLAG
      ? await allProjectsContainingTask(TASK_NAME)
      : await affectedProjectsContainingTask(TASK_NAME, BASE_BRANCH_NAME);
  console.log(JSON.stringify(projects));
}

printAffectedProjectsContainingTask().catch((error) => {
  console.error(error);
  process.exit(1);
});
