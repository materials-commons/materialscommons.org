#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser

import sys

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-p", "--project", dest="project_id", type="string", help="project id")
    parser.add_option("-d", "--dataset", dest="dataset_id", type="string", help="dataset id")
    parser.add_option("-e", "--experiment", dest="experiment_id", type="string", help="experiment id")

    (options, args) = parser.parse_args()

    if options.project_id is None:
        print "You must supply a project id"
        sys.exit(1)

    if options.dataset_id is None:
        print "You must supply a dataset id"
        sys.exit(1)

    if options.experiment_id is None:
        print "You must supply an experiment id"
        sys.exit(1)

    if options.port is None:
        options.port = 30815

    conn = r.connect('localhost', options.port, db='materialscommons')

    process_ids = list(r.table('project2experiment').get_all(options.project_id, index="project_id")
                       .eq_join('experiment_id', r.table('experiment2process'), index='experiment_id').zip()
                       .run(conn))

    print "Deleting existing process entries in dataset..."
    r.table('dataset2process').get_all(options.dataset_id, index='dataset_id').delete().run(conn)
    print "Done."

    print "Adding processes to experiment..."
    experiment_processes = list(r.table('experiment2process')
                                .get_all(options.experiment_id, index="experiment_id")
                                .run(conn))
    ep_map = {}
    for ep in experiment_processes:
        ep_map[ep['process_id']] = ep

    ep_processes_to_add = []
    for p in process_ids:
        if p['process_id'] not in ep_map:
            ep_processes_to_add.append(p['process_id'])

    for p in ep_processes_to_add:
        r.table('experiment2process').insert({
            'experiment_id': options.experiment_id,
            'process_id': p
        }).run(conn)
    print "Done."

    print "Insert all project processes into dataset..."
    for pentry in process_ids:
        r.table('dataset2process').insert({
            'dataset_id': options.dataset_id,
            'process_id': pentry['process_id']
        }).run(conn)

    print "Done."
