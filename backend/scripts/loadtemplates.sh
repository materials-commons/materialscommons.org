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

find templates -name '*.json' | while read line
do
    echo "Loading template: $line"
    python mktemplate.py --port $PORT --file "$line"
done
