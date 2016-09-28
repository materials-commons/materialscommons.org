#!/bin/sh

if [[ ! $PWD =~ .mcapp.data$ ]];
then
    echo "Not in mcapp.data"
    exit 1
fi

rm -rf dist mcpub mcpub.tar.gz
gulp build
mv dist mcpub
tar zcf mcpub.tar.gz mcpub
