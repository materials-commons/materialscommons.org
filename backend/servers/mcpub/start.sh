#!/bin/sh
node --harmony app.js > /tmp/public.out.test 2>&1&
disown -a
