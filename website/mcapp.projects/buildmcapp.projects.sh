#!/bin/sh

if [[ ! $PWD =~ .materialscommons.org/website$ ]];
then
    echo "Not in materialscommons.org/website"
    exit 1
fi

rm -rf dist mcapp mcapp.tar.gz
gulp build
mv dist mcapp
rm -rf mcapp/app/external/js/ckeditor
cp -r src/app/external/js/ckeditor mcapp/app/external/js/ckeditor
tar zcf mcapp.tar.gz mcapp
