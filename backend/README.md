Materials Commons Backend
=========================

This is the root of three servers that constitute the backend (e.g. server-side) of
the various materials commons sites. The three major parts of this are

1. backend/mcapi - a python-based set of backend API methods and their supporting
functions; currently these focus on featurs of the API that are not suitable 
supported in node js.
2. backend/servers/mcapi - the js-based server for the project-centered 
web application that supports the materials commons main user site
3. mackend/servers/mcpub - the js-based server for the public data review
site (were published datasets appear)

Also of note:
* backend/test - integration test, tests that span more then one portion of
the backend, usually involking the database directly instead of mocking the calls
* backend/config - moddel configuration files, see the README.md file in that
directory of details

