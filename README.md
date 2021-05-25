# Omni Repo - .Net Core Project Version Map

Github Action for determining version bumps for .Net Core projects. It looks under the `src` folder for any sub folders and provides a map of those projects to either the current tag versions or incremented versions, depending on whether or not there have been any changes to the contents of the sub folders.

The version format is `{Major}-{Minor}-{Patch}`, with an appended branch name when run on feature branches. Only the Patch number is incremented automatically.

## Inputs

| Parameter                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared_project`                 | The name of a project that should result in all projects being updated. All projects are versioned independently by default.                                                                                           |
| `include_shared_project`               |  Selectively include the specified shared project from the version_map output. The shared project is excluded by default.                                             |  

## Output

A JSON object called `version_map` that maps the projects that need to be updated (based on their name) and their new version. It has the following schema:

```json
{
  "Project Name": {
    "tag": "expected git tag",
    "version": "expected semver version"
  }
}
```

## Example

```yml
name: Map project versions
on: workflow_dispatch
jobs:
  map-some-version:
    runs-on: ubuntu-20.04
    outputs:
      env: ${{ steps.map-versions.outputs.version_map }}
    steps:
      - name: Map versions
        id: map-versions
        uses: im-open/omni-repo-version-map-action@v1
        with:
          shared_project: MyProject_Shared
          include_shared_project: true
```

## Recompiling

If changes are made to the action's code in this repository, or its dependencies, you will need to re-compile the action. 

```
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and its dependencies into a single file located in the `dist` folder.
