const core = require('@actions/core');
const { determineUpdatedProjects } = require('./projects');
const { mapTags } = require('./versioning');

const outputProjects = projects => {
  console.log('The following projects will be updated with the specified versions');
  console.log(projects);

  core.setOutput('version_map', projects);
};

const run = async () => {
  const projects = await determineUpdatedProjects();
  const tagsMap = await mapTags(projects);
  outputProjects(tagsMap);
};

run();
