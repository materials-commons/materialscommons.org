#!/usr/bin/env python

import rethinkdb as r

conn = r.connect('localhost', 30815, db='materialscommons')

if __name__ == "__main__":
    selection = list(r.table('project2datadir')
                     .get_all("34520277-4a0d-4f79-a30c-b63886f003c4",
                              index='project_id')
                     .eq_join("datadir_id", r.table('datadirs_denorm'))
                     .zip().order_by('name').run(conn))
