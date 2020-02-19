# A Tour of Dgraph

A step by step introductory tutorial of Dgraph. Built with [Hugo](https://gohugo.io/).

Visit https://tour.dgraph.io/ for the running instance.

## Developing

The tutorial can be run locally by cloning this repo and running `scripts/local.sh`.
The tour has been tested with hugo `v0.37`.

To develop and test version redirects locally run the build script:
`TOUR_BASE_URL=http://localhost:8000 python3 scripts/build.py`

This will recompile `master` and all `dgraph-<version>` branches and store the static site content in the `published/` folder

## Dgraph Release Process

Structure of the tour releases/version switcher must mirror the structure of the Dgraph Docs releases/versions. (Starting from Dgraph 1.0.16 onwards).

### Where to make changes

- All changes/updates reflecting the changes in Dgraph master should be committed into the `master` branch of this repository (`dgraph-io/tutorial`).
- Fixes and changes for older versions of the tour should be committed into relevant `dgraph-$version` branch.
- As part of the release process for Dgraph a new branch `dgraph-$version` must be cut here (`git checkout master; git checkout -b dgraph-<NEW_SEMVER>`).

## Deploying to Live Site

Run the build script:
`python3 scripts/build.py`

Once it finishes without errors it will commit all static content
into the `published/` folder.

After that you can `git push` and the server will pick up the changes.

## Server config

File `nginx/tour.conf` is symlinked to Nginx's `sites-available`
when you edit it you must ssh and run `nginx -s reload`.

Cron task

```sh
*/2 *    *   *   *   cd /home/ubuntu/dgraph-tour && git pull
```

Pulls new commits from git.
