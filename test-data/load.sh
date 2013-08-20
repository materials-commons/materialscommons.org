#!/bin/sh
rethinkdb import --file news.json --table materialscommons.news
rethinkdb import --file reviews.json --table materialscommons.reviews
rethinkdb import --file udqueue.json --table materialscommons.udqueue
