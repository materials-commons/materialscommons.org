#!/usr/bin/env bash

##
#  Note: Normally this file would be 'sourced' by the script setting up the
#  execution environment for the Materials Commons backend.
#  It will also have to be sourced in any environment where the test are run.
##

# the URL of the DOI service
export DOISERVICEURL='https://ezid.lib.purdue.edu/'

# the label for the publisher (to DOI)
export DOIPUBLISHER='Materials Commons'

# the URL of the Materials-Commons-related publication site
export DOIPUBLICATIONBASE='http://mcpub.localhost/'

# for production use of DOI API
export DOINAMESPACE='doi:10.5072/FK2'
export DOIUSER=apitest
export DOIPW=apitest

# for test use of DOI API
export DOITESTNAMESPACE='doi:10.5072/FK2'
export DOITESTUSER=apitest
export DOITESTPW=apitest
