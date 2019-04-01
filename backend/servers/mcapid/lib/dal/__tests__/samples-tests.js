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

        await samples.addSampleToProcess(sample.id, sample.property_set_id, processToAddTo, true);

        let matches = await r.table('process2sample').getAll([processToAddTo, sample.id], {index: 'process_sample'});
        expect(matches).toHaveLength(2);
        for (let m of matches) {
            if (m.direction === 'in') {
                expect(m.sample_id).toBe(sample.id);
                expect(m.property_set_id).toBe(sample.property_set_id);
                expect(m.process_id).toBe(processToAddTo);
                expect(m.direction).toBe('in');
            }
        }
    });
});

describe('Test addMeasurementsToSampleInProcess', () => {
    test('addMeasurementsToSampleInProcess', async() => {

    });
});

describe('Test addAttributesToSampleInProcess', async() => {
    test('addAttributesToSampleInProcess', async() => {

    });
});