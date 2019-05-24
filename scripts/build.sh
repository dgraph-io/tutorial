#!/bin/bash
# This script runs in a loop. It checks for updates to the tutorials, and rebuilds
# the tutorial if there has been any change.
# Warning - Changes should not be made on the server on which this script is running
# becauses this script does git checkout and merge.

set -e

GREEN='\033[32;1m'
RESET='\033[0m'
HOST=https://tour.dgraph.io


rebuild() {
	echo -e "$(date) $GREEN Updating tutorial.$RESET"
	# Generate new after merging.

	# In Unix environments, env variables should also be exported to be seen by Hugo
	# hugo\
	# 	--destination=public\
	# 	--baseURL="$HOST" 1> /dev/null
  # Perform webpack and hugo builds.
  npm build 1> /dev/null
}

branchUpdated()
{
	local branch="$1"
	git checkout -q "$1"
	UPSTREAM=$(git rev-parse "@{u}")
	LOCAL=$(git rev-parse "@")

	if [ "$LOCAL" != "$UPSTREAM" ] ; then
		git merge -q origin/"$branch"
		return 0
	else
		return 1
	fi
}

checkAndUpdate()
{
	local branch="$1"
	local tag="$2"

	if branchUpdated "$branch" ; then
		git merge -q origin/"$branch"
		rebuild "$branch" "$tag"
	fi
}

while true; do
	# Lets move to the dgraph-tour directory.
	pushd /home/ubuntu/dgraph-tour > /dev/null

	# Now lets check the theme.
	echo -e "$(date)  Starting to check branches."
	git remote update > /dev/null
	checkAndUpdate "master" "master"
	echo -e "$(date)  Done checking branches.\n"

	popd > /dev/null

	sleep 60
done
