#!/bin/sh
ADDRESS=${ADDRESS:-192.168.1.51}
(
    cd $(dirname $0)
    npm run-script build
    echo "Installing on ${ADDRESS}"
    scp -r dist/extensions/rptasklist root@${ADDRESS}:/mnt/us/extensions/
)