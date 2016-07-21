/* jshint expr: true */

describe('Processes', function() {
    'use strict';
    let atf = require('../../specs/atf');
    let should = require('should');
    let ropts = {
        db: 'mctest',
        port: 30815
    };

    let r = require('rethinkdbdash')(ropts);
    let p = require('./processes')(r);

    describe('#create', function() {
        before(function(done) {
            this.timeout(3000);
            atf(function *() {
                yield r.table('processes').delete();
                yield r.table('project2process').delete();
                yield r.table('setups').delete();
                yield r.table('process2setup').delete();
                yield r.table('measurements').delete();
                yield r.table('process2measurement').delete();
                yield r.table('setup_properties').delete();
                yield r.table('attributes').delete();
                yield r.table('attribute2measurement').delete();
                yield r.table('attributeset2attribute').delete();
                yield r.table('attribute2process').delete();
                yield r.table('samples').delete();
                yield r.table('attributeset').delete();
                yield r.table('sample2attributeset').delete();
                yield r.table('process2sample').delete();
                yield r.table('project2sample').delete();
                yield r.table('best_measure_history').delete();
                yield r.table('process2setupfile').delete();
                yield r.table('process2outputfile').delete();
            }, done);
        });

        it('should create a process', function(done) {
            function validate(err) {
                should(err).not.exist;
                done(err);
            }
            atf(function *() {
                let process = {
                    name: 'SEM EBSD',
                    owner: 'test@mc.org',
                    template_id: 'sem_ebsd',
                    what : 'I measured the composition and area fraction for my samples',
                    how: 'I ran the SEM with the voltage set to max (4ev) so the back scatter array could maximize its detection ratios',
                    project_id: 'abc123',
                    setup: {
                        settings: [
                            {
                                display_name: 'SEM Settings',
                                name: 'sem_settings',
                                properties: [
                                    {
                                        display_name: 'Volts',
                                        name: 'volts',
                                        _type: 'number',
                                        value: 4,
                                        units: 'ev'
                                    }
                                ]
                            }
                        ],
                        files: []
                    },
                    measurements_taken: [
                        {
                            name: 'Area fraction',
                            attribute: 'area_fraction',
                            _type: 'number',
                            units: 'fraction',
                            value: 0.5,
                            sample_id: 'sample_1_id',
                            attribute_id: 'attribute_id_1',
                            from_measurements: ['measure1', 'measure2']
                        },
                        {
                            name: 'Composition',
                            attribute: 'composition',
                            _type: 'composition',
                            value: {
                                mg: 10,
                                zn: 5
                            },
                            units: 'at%',
                            sample_id: 'sample_2_id',
                            attribute_set_id: 'attribute_set_id_1',
                            from_file: {
                                datafile_id: 'file_id_1',
                                grid: {
                                    row_start: 1,
                                    row_end: 3,
                                    column_start: 1,
                                    column_end: 3
                                }
                            }
                        }
                    ],
                    samples_created: [
                        {
                            name: 'new sample 1',
                            description: 'my sample'
                        }
                    ],
                    samples_transformed: [
                    ],
                    files_created: []
                };
                yield p.create(process);
            }, validate);
        });
    });
});
