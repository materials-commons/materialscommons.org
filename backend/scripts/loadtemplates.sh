#!/bin/sh

OPTIND=1
PORT=30815

while getopts "p:" opt
do
    case "$opt" in
        p)
            PORT=$OPTARG
            break
            ;;
    esac
done
shift $((OPTIND-1))

ls templates | while read line
do
    echo "Loading template: $line"
    mktemplate.py -p $PORT -f "templates/$line"
done

