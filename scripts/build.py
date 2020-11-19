import functools
import json
import os
import re
import subprocess as sp

DEST_ENV = 'TOUR_DESTINATION'
BASE_URL_ENV = 'TOUR_BASE_URL'

def exec(*argv):
    print("$>", " ".join(argv))
    res = sp.run(argv, stdout=sp.PIPE, stderr=sp.PIPE)
    if not res.returncode == 0:
        print('Error running', argv)
        print('StdOut:\n', res.stdout)
        print('StdErr:\n', res.stderr)
        raise Exception('Failed to exec ' + " ".join(argv))
    return res

def getBaseUrl(outSuffix=""):
    baseUrl = "https://dgraph.io/tour/"
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

def compareVersions(a, b):
    a = [int(x) for x in a.split('.')]
    b = [int(x) for x in b.split('.')]
    if a < b:
        return -1
    if a > b:
        return 1
    return 0


def getReleases():
    gitBranches = exec("git", "branch", "-a")
    branches = gitBranches.stdout.decode('utf8')
    branches = branches.split('\n')
    res = []
    for b in branches:
        match = re.compile(r"[ *]+remotes/origin/dgraph-([0-9.]+)").match(b)
        if match:
            res.append(match.group(1))
    print('Found release versions', res)

    res.sort(key=functools.cmp_to_key(compareVersions), reverse=True)

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
    # Latest release is one after master
    latestRelease = releases[1]
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
    os.environ["CANONICAL_PATH"] = "https://dgraph.io/tour"
    publicDir = os.environ.get(DEST_ENV) or 'public'
    exec("./scripts/delete-all-local-dgraph-branches")
    exec("rm", "-rf", publicDir)
    exec("mkdir", publicDir)

    buildAll(releases)

    exec("git", "checkout", "-b", "newRelease")

    exec("rm", "-rf", "published")
    exec("mv", publicDir, "published")
    exec("git", "add", "published")
    exec("git", "commit", "-m", "Hugo rebuild all branches")

main()
