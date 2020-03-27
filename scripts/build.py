import functools
import json
import os
import re
import semver
import subprocess as sp

DEST_ENV = 'TOUR_DESTINATION'
BASE_URL_ENV = 'TOUR_BASE_URL'

def exec(*argv):
    print("$>"," ".join(argv))
    res = sp.run(argv, capture_output=True)
    if not res.returncode == 0:
        print('Error running', argv)
        print('StdOut:\n', res.stdout)
        print('StdErr:\n', res.stderr)
        raise Exception('Failed to exec ' + " ".join(argv))
    return res

def getBaseUrl(outSuffix=""):
    baseUrl = "https://tour.dgraph.io/"
    if BASE_URL_ENV in os.environ:
        baseUrl = os.environ[BASE_URL_ENV]
        if baseUrl[-1] != '/':
            baseUrl += '/'
    baseUrl += outSuffix
    return baseUrl

def runHugo(outSuffix=""):
    baseUrl = getBaseUrl(outSuffix)

    destination = 'public/'
    if DEST_ENV in os.environ:
        destination = os.environ[DEST_ENV]
        if destination[-1] != '/':
            destination += '/'
    destination += outSuffix

    return exec(
        "hugo",
        "--destination",
        destination,
        "--baseURL",
        baseUrl,
        "--config",
        "config.toml,releases.json",
        )


def getReleases():
    gitBranches = exec("git", "branch")
    branches = gitBranches.stdout.decode('utf8')
    branches = branches.split('\n')
    res = []
    for b in branches:
        match = re.compile(r"[ *]+dgraph-([0-9.]+)").match(b)
        if match:
            res.append(match.group(1))
    print('Found release versions', res)

    res.sort(key=functools.cmp_to_key(semver.compare), reverse=True)

    res = ["master"] + res
    print('Order on the webpage: ', res)
    return res

def buildBranch(branch, dest, jsonData):
    print("Building", branch, "to public/" + dest)
    res = exec("git", "checkout", branch)

    with open('releases.json', 'w') as f:
        f.write(json.dumps(jsonData))

    runHugo(dest)

def buildAll(releases):
    # TODO: once 1.1.0 is released remove the line below
    #       and uncomment one after it
    latestRelease = "1.0.16"
    # latestRelease = releases[1]
    print('Latest Release (recommended to users): ', latestRelease)
    def jsonFor(version, latestRelease, releases):
        return {
            "params": {
                "latestRelease": latestRelease,
                "tourReleases": releases,
                "thisRelease": version,
                "home": getBaseUrl()
            },
        }

    buildBranch(
        "dgraph-" + latestRelease,
        "",
        jsonFor(latestRelease, latestRelease, releases))

    for r in releases:
        path = r if r == "master" else "dgraph-" + r
        buildBranch(path, path, jsonFor(r, latestRelease, releases))


def main():
    releases = getReleases()
    publicDir = os.environ.get(DEST_ENV) or 'public'
    exec("rm", "-rf", publicDir)
    exec("mkdir", publicDir)

    buildAll(releases)

    exec("git", "checkout", "master")

    exec("rm", "-rf", "published")
    exec("mv", publicDir, "published")
    exec("git", "add", "published")
    exec("git", "commit", "-m", "Hugo rebuild all branches")

main()
