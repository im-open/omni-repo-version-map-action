const core = require('@actions/core');
const { determineUpdatedProjects } = require('./projects');
const { mapTags } = require('./versioning');

const outputProjects = projects => {
  core.info('The following projects will be updated with the specified versions');
  core.info(projects);

  core.setOutput('version_map', projects);
};

const run = async () => {
  const projects = await determineUpdatedProjects();
  const tagsMap = await mapTags(projects);
  outputProjects(tagsMap);
};

run();
