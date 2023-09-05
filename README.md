# Omni Repo - .Net Core Project Version Map

Github Action for determining version bumps for .Net Core projects. It looks under the `src` folder for any sub folders. The sub folder names are expected to follow the pattern `<Project Name>.<Project Type>`, e.g. `MyProject.Bff` or `MyProject.Api`. This Action then determines if changes have been made to items in those folders and if so, maps the folder name to an object containing the new version and a name for the tag. See [the Output section below for more details](#output).

The version format is `{Major}-{Minor}-{Patch}`, with an appended branch name when run on feature branches. Only the Patch number is incremented automatically.

## Index <!-- omit in toc -->

- [Omni Repo - .Net Core Project Version Map](#omni-repo---net-core-project-version-map)
  - [Inputs](#inputs)
  - [Output](#output)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
    - [Incrementing the Version](#incrementing-the-version)
    - [Source Code Changes](#source-code-changes)
    - [Recompiling Manually](#recompiling-manually)
    - [Updating the README.md](#updating-the-readmemd)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)
  
## Inputs

| Parameter                | Description                                                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `shared_project`         | The name of a project that should result in all projects being updated. All projects are versioned independently by default. |
| `include_shared_project` | Selectively include the specified shared project from the version_map output. The shared project is excluded by default.     |

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

## Usage Examples

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
        uses: actions/checkout@v3
      
      - name: Map versions
        id: map-versions
        # You may also reference the major or major.minor version
        uses: im-open/omni-repo-version-map-action@v1.1.2
        with:
          shared_project: MyProject_Shared
          include_shared_project: true

      - name: Tag Project Versions
        uses: im-open/omni-repo-git-tag-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          version_map: ${{ steps.map-versions.outputs.version_map }}
```

## Contributing

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
|----------------|---------------------------------------------|
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.  

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2023, Extend Health, LLC. Code released under the [MIT license](LICENSE).

<!-- Links -->
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[Updating the README.md]: #updating-the-readmemd
[source code]: #source-code-changes
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
