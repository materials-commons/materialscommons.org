Testing Resources
-----------------

In order to test Resources some setup of RethinkDB is necessary. These
note cover that setup.

Use the test files, one needs to reset the Rethink database to the 
test database as given in this directory: **rethinkdb-test.dump.tar.gz**
That is: export MCDB_FILE to have the full path of that tar.gz file
and restart the database server with:
`cd [base]/src/github.com/materials-commons/materialscommons.org/backend
mcservers stop
MCDB_FILE='' mcservers start -t -r
mcservers stop
mcservers start -t`

