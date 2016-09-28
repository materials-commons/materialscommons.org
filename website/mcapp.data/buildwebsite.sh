#!/bin/sh

if [[ ! $PWD =~ .mc-publish$ ]];
then
    echo "Not in mc-publish"
    exit 1
fi

rm -rf dist mcpub mcpub.tar.gz
gulp build
mv dist mcpub
tar zcf mcpub.tar.gz mcpub
