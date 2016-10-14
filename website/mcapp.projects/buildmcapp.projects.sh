#!/bin/sh

if [[ ! $PWD =~ .mcapp.projects$ ]];
then
    echo "Not in mcapp.projects"
    exit 1
fi

rm -rf dist mcapp mcapp.tar.gz
gulp build
mv dist mcapp
rm -rf mcapp/app/external/js/ckeditor
cp -r src/app/external/js/ckeditor mcapp/app/external/js/ckeditor
tar zcf mcapp.tar.gz mcapp
