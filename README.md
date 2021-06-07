# Omni Repo - .Net Core Project Version Map

Github Action for determining version bumps for .Net Core projects. It looks under the `src` folder for any sub folders. The sub folder names are expected to follow the pattern `<Project Name>.<Project Type>`, e.g. `MyProject.Bff` or `MyProject.Api`. This Action then determines if changes have been made to items in those folders and if so, maps the folder name to an object containing the new version and a name for the tag. See [the Output section below for more details](#output).

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
    "tag": "The version prepended with the project type",
    "version": "The generated semver version"
  }
}
```

For example:
```json
{
  "MyProject.Bff": {
    "tag": "Bff-0.0.1",
    "version": "0.0.1"
  },
  "MyProject.Api": {
    "tag": "Api-1.0.2",
    "version": "1.0.2"
  }
}
```

## Example

This example uses the outputted `version_map` as input into another action, [omni-repo-git-tag-action](https://github.com/im-open/omni-repo-git-tag-action). That action will create a new Tag for each item in the map.

```yml
name: Map project versions
on: workflow_dispatch
jobs:
  map-some-version:
    runs-on: ubuntu-20.04
    outputs:
      env: ${{ steps.map-versions.outputs.version_map }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Map versions
        id: map-versions
        uses: im-open/omni-repo-version-map-action@v1
        with:
          shared_project: MyProject_Shared
          include_shared_project: true
      - name: Tag Project Versions
        uses: im-open/omni-repo-git-tag-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          version_map: ${{ steps.map-versions.outputs.version_map }}
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
