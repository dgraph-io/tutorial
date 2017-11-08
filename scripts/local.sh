#!/bin/bash

# The tour only works with hugo 0.19 for now. Get the binary from
# https://github.com/gohugoio/hugo/releases/tag/v0.19
hugo_0.19_linux_amd64 server -w --baseURL=http://localhost:1313
