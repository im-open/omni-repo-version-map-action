const exec = require('../util/_exec');
const isMainBranch = require('../util/_isMainBranch');

const getTagPrefix = project => project.match(/\w+\.(\w+)/)[1];

const getLatestTagForProject = async tagPrefix => {
  let { stdout: matchingTags } = await exec(`git tag --list ${tagPrefix}-* --sort=-creatordate`);

  if (matchingTags) return matchingTags.trim().split('\n')[0];

  // fallback to 0.0.* for the Bff
  if (tagPrefix === 'Bff') {
    console.log('falling back to 0.0.* versioning');
    ({ stdout: matchingTags } = await exec(`git tag --list 0.0.* --sort=-creatordate`));
  }

  const version = matchingTags ? matchingTags.trim().split('\n')[0] : '0.0.0';

  return `${tagPrefix}-${version}`;
};

const bumpVersion = tag => {
  const [, major, minor, patch] = tag.match(/(\d+)\.(\d+)\.(\d+)/);
  return `${major}.${minor}.${Number(patch) + 1}`;
};

const getBranchName = async () => {
  const { stdout: branchName } = await exec('git rev-parse --abbrev-ref HEAD');
  return branchName.trim();
};

const getPreReleaseSuffix = async () => {
  if (await isMainBranch()) return '';

  const branchName = await getBranchName();

  const { stdout: shortSha } = await exec('git rev-parse --short HEAD');
  return `-${branchName}-${shortSha.trim()}`;
};

const determineVersion = async project => {
  const tagPrefix = getTagPrefix(project);
  const latestTag = await getLatestTagForProject(tagPrefix);
  const nextVersion = bumpVersion(latestTag);
  const preReleaseSuffix = await getPreReleaseSuffix();
  return {
    version: `${nextVersion}${preReleaseSuffix}`,
    tag: `${tagPrefix}-${nextVersion}${preReleaseSuffix}`,
  };
};

const mapTags = async projects => {
  const versionMap = {};
  for (const project of projects) {
    versionMap[project] = await determineVersion(project);
  }
  return versionMap;
};

module.exports = { mapTags };
