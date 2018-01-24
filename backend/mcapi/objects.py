from mcapp import app
from decorators import apikey, jsonp, eventlog
from flask import request, g, jsonify
import rethinkdb as r
import dmutil
import args
import json
import resp
import sys


def msg(s):
    print(s)
    sys.stdout.flush()


class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


@app.route('/sample/details/<sample_id>', methods=['GET'])
@apikey
@jsonp
def get_sample_details(sample_id):
    s = list(r.table('samples').get_all(sample_id, index='id')
        .merge(lambda sample:
            {
                'property_sets': r.table('sample2propertyset')
                    .get_all(sample_id, index='sample_id')
                    .merge(lambda row: {
                        'processes': (
                            r.table('process2sample')
                            .get_all(row['property_set_id'], index='property_set_id')
                            .eq_join('process_id', r.table('processes')).zip()
                            .pluck('process_id', 'name', 'does_transform','process_type', 'direction')
                            .filter({'direction': 'out'})
                            .merge(lambda process: {
                                'measurements': r.table('process2measurement')
                                    .get_all(process['process_id'], index="process_id")
                                    .eq_join('measurement_id', r.table('measurements')).zip()
                                    .coerce_to('array')
                            }).coerce_to('array')),

                        'properties':
                            r.table('propertyset2property').get_all(row['property_set_id'], index='property_set_id')
                            .eq_join('property_id', r.table('properties')).zip()
                            .order_by('name')
                            .merge(lambda property: {
                                'best_measure': (
                                    r.table('best_measure_history')
                                    .get_all(property['best_measure_id'])
                                    .eq_join('measurement_id', r.table('measurements')).zip().coerce_to('array')),
                                'measurements': (
                                    r.table('property2measurement')
                                    .get_all(property['id'], index="property_id")
                                    .eq_join('measurement_id', r.table('measurements')).zip().coerce_to('array'))
                            }).coerce_to('array')
                    }).coerce_to('array'),

                'linked_files': (
                    r.table('sample2datafile')
                    .get_all(sample_id,index='sample_id')
                    .eq_join('datafile_id', r.table('datafiles')).zip().coerce_to('array')),

                'processes': (
                    r.table('process2sample')
                    .get_all(sample_id, index='sample_id').pluck('process_id', 'sample_id', 'property_set_id')
                    .distinct()
                    .eq_join('process_id', r.table('processes')).zip()
                    .merge(lambda process: {
                        'setup': (
                            r.table('process2setup')
                            .get_all(process['id'], index='process_id')
                            .eq_join("setup_id", r.table("setups")).zip()
                            .merge(lambda setup: {
                                'properties':
                                    r.table('setupproperties')
                                    .get_all(setup['setup_id'], index="setup_id")
                                    .coerce_to('array')
                            }).coerce_to('array'))
                    }).coerce_to('array'))
            }).run(g.conn, time_format="raw"))
    return resp.to_json(s)