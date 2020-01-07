#!/bin/bash

set -e

GREEN='\033[32;1m'
RESET='\033[0m'

if [[ $1 == "-p" || $1 == "--preview" ]]; then
    echo -e "$(date) $GREEN  Generating tutorial static pages in the public folder. $RESET"
    hugo \
      --destination=public \
      --config config.toml,releases.json 1> /dev/null
    echo -e "$(date) $GREEN  Done building. $RESET"
else
    hugo server -w --baseURL=http://localhost:1313 --config config.toml,releases.json
fi
