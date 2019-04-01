const r = require('@lib/test-utils/r');
const tutil = require('@lib/test-utils')(r);
const samples = require('@dal/samples')(r);

describe('Test createSampleInProcess', () => {
    let project;
    beforeAll(async() => {
        project = await tutil.createTestProject();
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should create a valid sample and correctly set up join tables', async() => {
        // For this test we can make up the processId
        let processId = await r.uuid();

        // cs = created sample
        let cs = await samples.createSampleInProcess('s1', '', 'test@test.mc', processId, project.id);

        let s = await r.table('samples').get(cs.id);
        expect(s.name).toBe(cs.name);

        // Sample should be associated with the propertyset
        let matches = await r.table('sample2propertyset').getAll([cs.id, cs.property_set_id], {index: 'sample_property_set'});
        expect(matches).toHaveLength(1);

        // Sample should be associated with the process
        matches = await r.table('process2sample').getAll([processId, cs.id], {index: 'process_sample'});
        expect(matches).toHaveLength(1);
        expect(matches[0].direction).toBe('out');

        // Sample should be associated with the project
        matches = await r.table('project2sample').getAll([project.id, cs.id], {index: 'project_sample'});
        expect(matches).toHaveLength(1);
    });
});

describe('Test addSampleToProcess', () => {
    let project, sample, processId;
    beforeAll(async() => {
        project = await tutil.createTestProject();
        processId = await r.uuid();
        sample = await samples.createSampleInProcess('s1', '', 'test@test.mc', processId, project.id);
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it adds the sample to the process with direction in when not transformed', async() => {
        // create fake process id to add sample to
        let processToAddTo = await r.uuid();

        await samples.addSampleToProcess(sample.id, sample.property_set_id, processToAddTo, false);

        let matches = await r.table('process2sample').getAll([processToAddTo, sample.id], {index: 'process_sample'});
        expect(matches).toHaveLength(1);
        let m = matches[0];
        expect(m.sample_id).toBe(sample.id);
        expect(m.property_set_id).toBe(sample.property_set_id);
        expect(m.process_id).toBe(processToAddTo);
        expect(m.direction).toBe('in');
    });

    test('it adds the sample with in and out direction and new property_set_id when transformed', async() => {
        // create fake process id to add sample to
        let processToAddTo = await r.uuid();
        let createdPSId; // property set id created from transform

        await samples.addSampleToProcess(sample.id, sample.property_set_id, processToAddTo, true);

        let matches = await r.table('process2sample').getAll([processToAddTo, sample.id], {index: 'process_sample'});
        expect(matches).toHaveLength(2);
        for (let m of matches) {
            if (m.direction === 'in') {
                expect(m.sample_id).toBe(sample.id);
                expect(m.property_set_id).toBe(sample.property_set_id);
                expect(m.process_id).toBe(processToAddTo);
                expect(m.direction).toBe('in');
            } else {
                expect(m.sample_id).toBe(sample.id);
                expect(m.property_set_id).not.toBe(sample.property_set_id);
                // make sure property_set_id is not blank
                expect(m.property_set_id).toBeTruthy();
                createdPSId = m.property_set_id;

                expect(m.process_id).toBe(processToAddTo);
                expect(m.direction).toBe('out');
            }
        }

        // Make sure sample2propertyset has 2 entries for the sample, one for each of the
        // property sets.
        matches = await r.table('sample2propertyset').getAll(sample.id, {index: 'sample_id'});
        expect(matches).toHaveLength(2);
        let sawOriginalPSId = false,
            sawCreatedPSId = false;
        for (let entry of matches) {
            if (entry.property_set_id === sample.property_set_id) {
                sawOriginalPSId = true;
            } else if (entry.property_set_id === createdPSId) {
                sawCreatedPSId = true;
            }
        }

        expect(sawOriginalPSId).toBeTruthy();
        expect(sawCreatedPSId).toBeTruthy();
    });
});

describe('Test addMeasurementsToSampleInProcess', () => {
    let project, processId;
    beforeAll(async() => {
        project = await tutil.createTestProject();
        processId = await r.uuid();
    });

    afterAll(async() => {
        await tutil.deleteProject(project.id);
    });

    test('it should add new attributes with measurements', async() => {
        let sample = await samples.createSampleInProcess('s1', '', 'test@test.mc', processId, project.id);
        let attributes = [
            {
                name: 'attr1',
                measurements: [
                    {
                        value: 1,
                        unit: 'mm',
                        otype: 'integer',
                        is_best_measure: true,
                    }
                ]
            }
        ];

        await samples.addMeasurementsToSampleInProcess(attributes, sample.id, sample.property_set_id, processId);

        let matches = await r.table('propertyset2property').getAll(sample.property_set_id, {index: 'property_set_id'});
        expect(matches).toHaveLength(1);
        let m = matches[0];

        let prop = await r.table('properties').get(m.property_id);
        expect(prop.name).toBe('attr1');
        expect(prop.otype).toBe('property');
        expect(prop.best_measure_id).toBeTruthy();

        matches = await r.table('property2measurement').getAll(prop.id, {index: 'property_id'});
        expect(matches).toHaveLength(1);

        let measurement = await r.table('measurements').get(matches[0].measurement_id);
        expect(measurement.unit).toBe('mm');
        expect(measurement.otype).toBe('integer');
        expect(measurement.value).toBe(1);

        // Make sure the best measure id is equal to this measurement. This wil be in the best_measure_history table
        matches = await r.table('best_measure_history').getAll(prop.id, {index: 'property_id'});
        expect(matches).toHaveLength(1);
        expect(matches[0].measurement_id).toBe(measurement.id);
    });

    test('it should add measurements to existing attributes', async() => {
        // Create a new sample
        let sample = await samples.createSampleInProcess('s2', '', 'test@test.mc', processId, project.id);

        // First setup sample with a single measurement
        let attributes = [
            {
                name: 'attr1',
                measurements: [
                    {
                        value: 1,
                        unit: 'mm',
                        otype: 'integer',
                        is_best_measure: true,
                    }
                ]
            }
        ];

        await samples.addMeasurementsToSampleInProcess(attributes, sample.id, sample.property_set_id, processId);

        let matches = await r.table('propertyset2property').getAll(sample.property_set_id, {index: 'property_set_id'});
        expect(matches).toHaveLength(1);
        let m = matches[0];

        console.log('m =', m);
        // now take that property and add a new measurement to it
        let toAdd = [
            {
                name: 'attr1',
                id: m.property_id,
                measurements: [
                    {
                        value: 2,
                        unit: 'cm', // set a different unit so we can tell measurements apart for our tests
                        otype: 'integer',
                        is_best_measure: true,
                    }
                ]
            }
        ];
        await samples.addMeasurementsToSampleInProcess(toAdd, sample.id, sample.property_set_id, processId);
        matches = await r.table('propertyset2property').getAll(sample.property_set_id, {index: 'property_set_id'});
        expect(matches).toHaveLength(1);

        let prop = await r.table('properties').get(m.property_id);
        expect(prop.name).toBe('attr1');
        expect(prop.otype).toBe('property');
        expect(prop.best_measure_id).toBeTruthy();

        matches = await r.table('property2measurement').getAll(prop.id, {index: 'property_id'});
        expect(matches).toHaveLength(2);

        let expectedBestMeasureId;
        for (let match of matches) {
            let measurement = await r.table('measurements').get(match.measurement_id);
            if (measurement.unit === 'mm') {
                expect(measurement.otype).toBe('integer');
                expect(measurement.value).toBe(1);
            } else if (measurement.unit === 'cm') {
                expect(measurement.otype).toBe('integer');
                expect(measurement.value).toBe(2);
                expectedBestMeasureId = measurement.id;
            }
        }

        // Make sure the best measure id is equal to this measurement. This wil be in the best_measure_history table
        matches = await r.table('best_measure_history').getAll(prop.id, {index: 'property_id'});
        expect(matches).toHaveLength(1);
        expect(matches[0].measurement_id).toBe(expectedBestMeasureId);
    });

    // test('it should handle adding measurements for new attributes and existing attributes', async() => {
    //     let sample = await samples.createSampleInProcess('s3', '', 'test@test.mc', processId, project.id);
    //
    // });
});

describe('Test addAttributesToSampleInProcess', async() => {
    test('addAttributesToSampleInProcess', async() => {

    });
});