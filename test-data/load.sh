#!/bin/sh
rethinkdb import --file news.json --table materialscommons.news --force
rethinkdb import --file reviews.json --table materialscommons.reviews --force
rethinkdb import --file udqueue.json --table materialscommons.udqueue --force
