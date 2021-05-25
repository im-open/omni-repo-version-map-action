const actionsCore = require('@actions/core');
const exec = require('../util/_exec');

const getUpdatedProjects = files =>
  files.reduce((projects, file) => {
    const match = file.match(/src\/(\w+\.\w+)\//);

    if (!match) return projects;

    const project = match[1];
    return projects.includes(project) ? projects : [...projects, project];
  }, []);

const getAllProjects = async (sharedProject, includeSharedProject) => {
  const { stdout } = await exec('ls src');
  const projects = stdout.trim().split('\n');
  return includeSharedProject ? projects : projects.filter(project => project !== sharedProject);
};

const determineUpdatedProjects = async () => {
  const sharedProject = actionsCore.getInput('shared_project');
  const includeSharedProject = Boolean(actionsCore.getInput('include_shared_project'));

  const { stdout: tag } = await exec('git describe --tags --abbrev=0');
  const { stdout: files } = await exec(`git diff --name-only HEAD ${tag}`);

  let projects = getUpdatedProjects(files.trim().split('\n'));
  if (projects.includes(sharedProject)) {
    projects = getAllProjects(sharedProject, includeSharedProject);
  }

  return projects;
};

module.exports = { determineUpdatedProjects };
