const exec = require('./_exec');

const isMain = async () => {
  let { stdout: branchName } = await exec('git rev-parse --abbrev-ref HEAD');
  branchName = branchName.trim();

  return branchName === 'main' || branchName === 'master';
};

module.exports = isMain;
