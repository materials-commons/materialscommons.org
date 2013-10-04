#!/bin/sh
while [ 1 ]
do
    curl -XGET http://localhost:5000/v1.0/user/mcfada@umich.edu/datagroups > /dev/null 2>&1
done
