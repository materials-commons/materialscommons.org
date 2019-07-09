#!/bin/sh
. ~/.bashrc
cd ~/workspace/src/github.com/materials-commons/materialscommons.org/backend
git pull > /tmp/git.out.mc 2>&1
grep "origin/master" /tmp/git.out.mc > /dev/null
if [ $? -eq 0 ]; then
   mcservers deploy -p -y --no-backup
fi
rm /tmp/git.out.mc
