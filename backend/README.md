Materials Commons Backend
=========================

This is the root of three servers that constitute the backend (e.g. server-side) of
the various materials commons sites. The three major parts of this are

1. backend/servers/mcapi - the js-based server for the project-centered 
web application that supports the materials commons main user site
2. mackend/servers/mcpub - the js-based server for the public data review
site (were published datasets appear)

Also of note:
* See the website portion of this repository for for the Web UI to
Materials Commons. A [Python API](https://github.com/materials-commons/mcapi/tree/master/python)
is also available.
* backend/test - integration test, tests that span more then one portion of
the backend, usually involking the database directly instead of mocking the calls
* backend/config - moddel configuration files, see the README.md file in that
directory of details

Additional documentation can be found on the [the wiki site](https://github.com/materials-commons/materialscommons.org/wiki).
