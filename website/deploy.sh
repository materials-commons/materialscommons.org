#!/bin/sh

rm -rf mcpub mcapp
echo
echo Building mcapp.projects
echo
cd mcapp.projects
./buildmcapp.projects.sh
mv mcapp ..
echo
echo Done.

