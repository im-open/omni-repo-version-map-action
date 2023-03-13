# Omni Repo - .Net Core Project Version Map

Github Action for determining version bumps for .Net Core projects. It looks under the `src` folder for any sub folders. The sub folder names are expected to follow the pattern `<Project Name>.<Project Type>`, e.g. `MyProject.Bff` or `MyProject.Api`. This Action then determines if changes have been made to items in those folders and if so, maps the folder name to an object containing the new version and a name for the tag. See [the Output section below for more details](#output).

The version format is `{Major}-{Minor}-{Patch}`, with an appended branch name when run on feature branches. Only the Patch number is incremented automatically.

## Index

- [Inputs](#inputs)
- [Output](#output)
- [Example](#example)
- [Contributing](#contributing)
  - [Recompiling](#recompiling-manually)
  - [Incrementing the Version](#incrementing-the-version)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
  
## Inputs

| Parameter                | Description                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
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

When creating new PRs please ensure:

1. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
1. The action code does not contain sensitive information.

When a pull request is created and there are changes to code-specific files and folders, the build workflow will run and it will recompile the action and push a commit to the branch if the PR author has not done so. The usage examples in the README.md will also be updated with the next version if they have not been updated manually. The following files and folders contain action code and will trigger the automatic updates:

- action.yml
- package.json
- package-lock.json
- src/\*\*
- dist/\*\*

There may be some instances where the bot does not have permission to push changes back to the branch though so these steps should be done manually for those branches. See [Recompiling Manually](#recompiling-manually) and [Incrementing the Version](#incrementing-the-version) for more details.

### Recompiling Manually

If changes are made to the action's code in this repository, or its dependencies, the action can be re-compiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

Both the build and PR merge workflows will use the strategies below to determine what the next version will be.  If the build workflow was not able to automatically update the README.md action examples with the next version, the README.md should be updated manually as part of the PR using that calculated version.

This action uses [git-version-lite] to examine commit messages to determine whether to perform a major, minor or patch increment on merge.  The following table provides the fragment that should be included in a commit message to active different increment strategies.
| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2021, Extend Health, LLC. Code released under the [MIT license](LICENSE).

[git-version-lite]: https://github.com/im-open/git-version-lite
