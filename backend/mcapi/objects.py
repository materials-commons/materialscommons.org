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
    print s
    sys.stdout.flush()


@app.route('/sample/measurements/<sample_id>/<property_set_id>')
@jsonp
def get_sample_measurements(sample_id, property_set_id):
    measurements = list(
        r.table('propertyset2property').get_all(property_set_id,
                                                index='property_set_id') \
        .eq_join('property_id', r.table('properties')).zip() \
        .order_by('name')\
        .merge(lambda property:
               {
                   'best_measure':
                       r.table('best_measure_history').get_all(
                           property['best_measure_id'])
               .eq_join('measurement_id', r.table('measurements')).zip()
               .coerce_to('array'),
                   'measurements':
                       r.table('property2measurement')
               .get_all(property['id'], index="property_id")
               .eq_join('measurement_id', r.table('measurements')).zip()
               .merge(lambda measurement:
                      {
                          'process':
                              r.table('process2measurement')
                      .get_all(measurement['id'], index="measurement_id")
                      .eq_join('process_id', r.table('processes')).zip()
                      .pluck('id', 'name')
                      .coerce_to('array')
                      })
               .coerce_to('array')
               }).run(g.conn, time_format="raw"))
    return resp.to_json(measurements)


@app.route('/sample/propertysets/<sample_id>', methods=['GET'])
@jsonp
def get_propertysets(sample_id):
    psets = r.table('sample2propertyset') \
        .get_all(sample_id, index='sample_id') \
        .eq_join('property_set_id', r.table('process2sample'),
                 index='property_set_id').zip() \
        .group('property_set_id').pluck('process_id', 'direction') \
        .eq_join('process_id', r.table('processes')).zip() \
        .pluck('process_id', 'name', 'does_transform', 'process_type', 'direction')\
        .run(g.conn, time_format="raw")
    return resp.to_json(psets)


@app.route('/best_measure', methods=['POST'])
@apikey
@eventlog
def create_best_measure_history():
    j = request.get_json()
    best_measure_history = dict()
    best_measure_history['property_id'] = dmutil.get_required('property_id', j)
    best_measure_history['measurement_id'] = dmutil.get_required(
        'measurement_id', j)
    best_measure_history['_type'] = 'best_measure_history'
    best_measure_history['when'] = r.now()
    history = dmutil.insert_entry('best_measure_history', best_measure_history,
                                  return_created=True)
    if history:
        rv = r.table('properties').get(best_measure_history['property_id']) \
            .update({'best_measure_id': history['id']}).run(g.conn)
    return jsonify(history)


@app.route('/sample/property_set/<sample_id>', methods=['GET'])
@jsonp
def get_current_propertyset(sample_id):
    sample2property_set = list(r.table('sample2propertyset').get_all(sample_id,
                                                index='sample_id').filter(
        {'current': True}).run(g.conn, time_format="raw"))
    return args.json_as_format_arg(sample2property_set)


@app.route('/sample/datafile/<sample_id>', methods=['GET'])
@jsonp
def get_sample2files(sample_id):
    files = list(
        r.table('samples').get_all(sample_id).
        eq_join('id', r.table('sample2datafile'), index='sample_id').zip().
        eq_join('datafile_id', r.table('datafiles')).zip().
        merge(lambda df: {
            'processes': r.table('process2file').get_all(df['datafile_id'],
                    index='datafile_id').eq_join('process_id',
                    r.table('processes')).zip().coerce_to('ARRAY')
        }).run(g.conn, time_format="raw")
    )
    return resp.to_json(files)


class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


@app.route('/objects/elements', methods=['GET'])
@jsonp
def get_all_elements():
    rr = r.table('elements').order_by('name')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


# get_process_details: will get the process information, samples associated and
#  their best measures and linked_files
@app.route('/process/details/<process_id>', methods=['GET'])
@apikey
@jsonp
def get_process_details(process_id):
    p = list(r.table('processes').get_all(process_id, index='id')
        .merge( lambda process:
            {
                'setup': r.table('process2setup')
                .get_all(process['id'], index='process_id')
                .eq_join("setup_id", r.table("setups")).zip()
                .merge(lambda setup: {
                        'properties':
                        r.table('setupproperties')
                        .get_all(setup['setup_id'], index="setup_id")
                        .coerce_to('array')
                })
                .coerce_to('array'),

                'input_samples': r.table('process2sample')
                .get_all(process['id'], index='process_id')
                .eq_join('sample_id', r.table("samples"))
                .without({"right": {"_type": True}})
                .zip()
                .order_by('name')
                .merge(lambda sample: {
                    'properties': r.table('propertyset2property')
                    .get_all(sample['property_set_id'], index= 'property_set_id')
                    .eq_join('property_id', r.table('properties')).zip()
                    .order_by('name').merge(lambda property: {
                        'best_measure': r.table('best_measure_history')\
                        .get_all(property['best_measure_id'])
                                            .eq_join('measurement_id',
                        r.table('measurements')).zip().coerce_to('array')
                    }),
                    'linked_files': r.table('sample2datafile')
                       .get_all(sample['id'],
                    index='sample_id').eq_join('datafile_id',
                    r.table('datafiles')).zip().pluck('id', 'name', 'mediatype')
                    .coerce_to('array')
                })
                .coerce_to('array'),

                'input_files': r.table('process2file')
                .get_all(process['id'],
                index='process_id').filter({
                'direction': "in"})
                .eq_join('datafile_id', r.table('datafiles'))
                .zip()
                .coerce_to('array'),
                'output_files': r.table('process2file')
                .get_all(process['id'],
                index='process_id').filter({
                'direction': "out"})
                .eq_join('datafile_id', r.table('datafiles'))
                .zip()
                .coerce_to('array')
        }).run(g.conn, time_format="raw"))
    return resp.to_json(p[0])


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