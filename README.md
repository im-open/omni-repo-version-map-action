# Omni Repo - .Net Core Project Version Map

Github Action for determining version bumps for .Net Core projects. It looks under the `src` folder for any sub folders. The sub folder names are expected to follow the pattern `<Project Name>.<Project Type>`, e.g. `MyProject.Bff` or `MyProject.Api`. This Action then determines if changes have been made to items in those folders and if so, maps the folder name to an object containing the new version and a name for the tag. See [the Output section below for more details](#output).

The version format is `{Major}-{Minor}-{Patch}`, with an appended branch name when run on feature branches. Only the Patch number is incremented automatically.
    
## Index 

- [Inputs](#inputs)
- [Output](#output)
- [Example](#example)
- [Contributing](#contributing)
  - [Recompiling](#recompiling)
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
        uses: actions/checkout@v2
      - name: Map versions
        id: map-versions
        uses: im-open/omni-repo-version-map-action@v1.0.4
        with:
          shared_project: MyProject_Shared
          include_shared_project: true
      - name: Tag Project Versions
        uses: im-open/omni-repo-git-tag-action@v1.0.5
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          version_map: ${{ steps.map-versions.outputs.version_map }}
```

## Contributing

When creating new PRs please ensure:
1. The action has been recompiled.  See the [Recompiling](#recompiling) section below for more details.
2. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
3. The `README.md` example has been updated with the new version.  See [Incrementing the Version](#incrementing-the-version).
4. The action code does not contain sensitive information.

### Recompiling

If changes are made to the action's code in this repository, or its dependencies, you will need to re-compile the action.

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

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
