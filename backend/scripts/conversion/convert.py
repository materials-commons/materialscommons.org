#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def remove_nulls_in_setup(conn):
    print "Removing nulls in setup..."
    r.table('setupproperties').filter({'unit': None}).update({'unit': ''}).run(conn)
    r.table('setupproperties').filter({'value': None}).update({'value': ''}).run(conn)
    print "Done."


def remove_duplicates_in_sample2datafile(conn):
    print "Removing duplicate sample2datafile entries..."
    already_seen = {}
    s2df_entries = list(r.table('sample2datafile').run(conn))
    for s2df in s2df_entries:
        if s2df['datafile_id'] not in already_seen:
            already_seen[s2df['datafile_id']] = True
        else:
            print "Deleting duplicate sample2datafile entry"
            r.table('sample2datafile').get(s2df['id']).delete().run(conn)
    print "Done."


def change_processes_field_to_description(conn):
    """ Combine the process what and why fields into a single description field
    and then delete the what and why fields. Users are confused by the two
    fields.
    :param conn: connection to the database
    """
    print "Combining what/why field in processes into description..."
    print "Done."


def convert_setup_selections_to_name_value(conn):
    """ Selections display the external name rather than value field. This
    would allow users to search on those fields without having to know the
    internal name.
    :param conn: connect to the database
    """
    print "Converting setup selections to name/value pair"
    print "Done."


def add_as_received_processes(conn):
    print "Setting process name for all processes with type 'as_received'..."
    r.table('processes').filter({'process_type': 'as_received'}).update({'process_name': 'As Received'}).run(conn)
    print "Done."


def set_specific_process_names(conn):
    print "Setting process names for certain ids"
    r.table('processes').get('d297b7d9-a568-4980-8af1-4f0bafa251f7').update({'process_name': 'TEM'}).run(conn)
    r.table('processes').get('d86edee0-c659-4105-8b07-8ee1b278bf41').update({'process_name': 'Heat Treatment'}).run(conn)
    r.table('processes').get('92a44e96-ae9b-476b-a777-94e8fe443596').update({'process_name': 'TEM'}).run(conn)
    r.table('processes').get('d6d19225-2f82-426b-8e2d-2961924c6fcc').update({'process_name': 'Heat Treatment'}).run(conn)
    r.table('processes').get('65348deb-d25c-46e8-83a8-179c61e2ab01').update({'process_name': 'Heat Treatment'}).run(conn)
    r.table('processes').get('3f16c122-7683-4a2f-9d94-92bc82765fe2').update({'process_name': 'TEM'}).run(conn)
    print "Done."


def set_sample_direction_for_non_transform_processes(conn):
    print "Setting sample direction for non transform processes..."
    processes = list(r.table('processes').filter({'does_transform': False}).run(conn))
    for process in processes:
        r.table('process2sample').get_all(process['id'], index='process_id').update({'direction': 'in'}).run(conn)
    print "Done."


def fix_transform_process_directions(conn):
    print "Fixing transform process directions..."
    p2s = list(r.table('processes').filter({'does_transform': True})
               .eq_join('id', r.table('process2sample'), index='process_id').zip()
               .pluck('name', 'process_id', 'property_set_id', 'sample_id', 'direction', 'id')
               .filter({'direction': ''}).run(conn))
    for p2s_entry in p2s:
        r.table('process2sample').get(p2s_entry['id']).update({'direction': 'in'}).run(conn)
        r.table('propertysets').get(p2s_entry['property_set_id']).update({'current': False}).run(conn)
        inserted = r.table('propertysets').insert({'current': True, 'parent_id': p2s_entry['property_set_id']}).run(conn)
        inserted_id = inserted['generated_keys'][0]
        r.table('process2sample').insert({
            'direction': 'out',
            'property_set_id': inserted_id,
            'process_id': p2s_entry['process_id'],
            'sample_id': p2s_entry['sample_id']
        }).run(conn)
    print "Done."


def fix_samples_from_create_samples(conn):
    print "Fixing samples that came from create samples template..."
    processes = list(r.table('processes').get_all('global_Create Samples', index='template_id').run(conn))
    for process in processes:
        r.table('process2sample').get_all(process['id'], index='process_id').update({'direction': 'out'}).run(conn)
    r.table('processes').get_all('global_Create Samples', index='template_id').update({'does_transform': True}).run(conn)
    print "Done."


def set_processes_destructive_flag(conn):
    print "Adding destructive flag to processes"
    r.table('processes').update({'destructive': False}).run(conn)
    print "Done."


def set_process_type(conn):
    print "Adding process_type field for processes..."
    processes_no_template = list(r.table('processes').filter(~r.row.has_fields('template_id')).run(conn))
    for p in processes_no_template:
        if p['process_name'] == 'Annealing':
            p['template_id'] = 'global_Heat Treatment'
        elif p['process_name'] == 'As Received':
            p['template_id'] = 'global_Create Samples'
        else:
            p['template_id'] = 'global_' + p['process_name']
        r.table('processes').get(p['id']).update({'template_id': p['template_id']}).run(conn)

    all_processes = list(r.table('processes').run(conn))
    for p in all_processes:
        template = r.table('templates').get(p['template_id']).run(conn)
        r.table('processes').get(p['id']).update({'process_type': template['process_type']}).run(conn)
    print "Done."


def add_dataset_processes_to_experiments(conn):
    print "Adding missing processes to experiments (that are in datasets)"
    datasets = list(r.table('datasets').merge(lambda dataset: {
        'processes': r.table('dataset2process').get_all(dataset['id'], index='dataset_id').eq_join('process_id', r.table('processes')).zip().coerce_to('array'),
        'experiments': r.table('experiment2dataset').get_all(dataset['id'], index='dataset_id').coerce_to('array')
    }).run(conn))
    for dataset in datasets:
        for experiment in dataset['experiments']:
            for dprocess in dataset['processes']:
                p = list(r.table('experiment2process').get_all([experiment['experiment_id'], dprocess['id']], index='experiment_process').run(conn))
                if len(p) == 0:
                    print "Adding process to experiment %s/%s" % (experiment['experiment_id'], dprocess['id'])
                    r.table('experiment2process').insert({'experiment_id': experiment['experiment_id'], 'process_id': dprocess['id']}).run(conn)
    print "Done."


def fix_as_received_process_name(conn):
    r.table('processes').filter({'process_name': 'As Received'}).update({'process_name': 'Create Samples'}).run(conn)


def rename_to_otype(table, conn):
    print "   Converting table %s" % table
    r.table(table).filter(r.row.has_fields('_type')).replace(lambda doc: doc.merge({'otype': doc['_type']}).without('_type')).run(conn)
    print "   Done."


def fix_template_name(conn):
    print "Fixing template names..."
    processes = list(r.table('processes').run(conn, ))
    for proc in processes:
        if 'template_name' not in proc:
            if proc['process_name'] == 'Annealing':
                proc['template_name'] = 'Heat Treatment'
            else:
                proc['template_name'] = proc['process_name']
            r.table('processes').get(proc['id']).update({'template_name': proc['template_name']}).run(conn)
    print "Done."


def convert_to_otype(conn):
    print "Convert to otype..."
    rename_to_otype('datadirs', conn)
    rename_to_otype('datafiles', conn)
    rename_to_otype('experiments', conn)
    rename_to_otype('experimenttasks', conn)
    rename_to_otype('measurements', conn)
    rename_to_otype('processes', conn)
    rename_to_otype('projects', conn)
    rename_to_otype('properties', conn)
    rename_to_otype('samples', conn)
    rename_to_otype('setupproperties', conn)
    rename_to_otype('setups', conn)
    print "Done."


def fix_missing_processes_for_measurements(conn):
    measurements = list(r.table('measurements').filter({'otype': 'composition'}).run(conn))
    for m in measurements:
        p2m = list(r.table('process2measurement').get_all(m['id'], index='measurement_id').run(conn))
        if not p2m:
            print "\nCould not find process for measurement %s" % m['id']
            p = list(r.table('property2measurement').get_all(m['id'], index='measurement_id').run(conn))
            p_id = p[0]['property_id']
            ps = list(r.table('propertyset2property').get_all(p_id, index='property_id').run(conn))
            ps_id = ps[0]['property_set_id']
            s2ps = list(r.table('sample2propertyset').get_all(ps_id, index='property_set_id').run(conn))
            s_id = s2ps[0]['sample_id']
            processes = list(r.table('process2sample').get_all(s_id, index='sample_id')
                             .eq_join('process_id', r.table('processes')).zip().run(conn))
            for proc in processes:
                if 'template_name' in proc and proc['template_name'] == 'Create Samples':
                    r.table('process2measurement').insert({
                        'process_id': proc['process_id'],
                        'measurement_id': m['id']
                    }).run(conn)


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    # remove_nulls_in_setup(conn)
    # remove_duplicates_in_sample2datafile(conn)
    # add_as_received_processes(conn)
    # set_specific_process_names(conn)
    # set_sample_direction_for_non_transform_processes(conn)
    # fix_transform_process_directions(conn)
    # fix_samples_from_create_samples(conn)
    # set_processes_destructive_flag(conn)
    # set_process_type(conn)
    #
    # add_dataset_processes_to_experiments(conn)
    # fix_as_received_process_name(conn)

    convert_to_otype(conn)
    fix_template_name(conn)
    fix_missing_processes_for_measurements(conn)

    # Not sure of these steps:
    # change_processes_field_to_description(conn)
    # convert_setup_selections_to_name_value(conn)

if __name__ == "__main__":
    main()
