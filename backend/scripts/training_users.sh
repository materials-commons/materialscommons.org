#!/bin/sh

mcuser.py --email admin@mc.org --password admin -a

for i in {1..30}
do
    mcuser.py --email temp${i}@mc.org --password temp${i}
done
