# A Tour of Dgraph

A step by step introductory tutorial of Dgraph. Built with [Hugo](https://gohugo.io/).

Visit https://tour.dgraph.io/ for the running instance.

The tutorial can also be run locally by cloning this repo and running `scripts/local.sh`. The tour
has been tested with hugo `v0.37`.

## Deploying

Run `./scripts/build.sh` in a tmux window. The script polls `dgraph-io/tutorial` every one minute
and pulls any new changes that have been merged to master. It also rebuilds the site if there are
any changes.
