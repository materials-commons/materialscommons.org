module.exports = function(r) {
    'use strict';

    let _ = require('lodash');
    let model = require('./model')(r);
    let db = require('./db')(r);

    return {
        create: create
    };

    /////////////////////////////////////

    function *create(process) {
        let p = new model.Process(process.name, process.owner,
                            process.template_id, process.description);
        let proc = yield addProcess(process.project_id, p);
        yield addSettings(proc.id, process.settings);
        yield addMeasurements(proc.id, process.measurements);
    }

    //////////////////////////////////////

    function *addProcess(projectID, process) {
        let p = yield db.insert('processes', process);
        let p2proc = new model.Project2Process(projectID, p.id);
        yield db.insert('project2process', p2proc);
        return p;
    }

    function *addSettings(processID, settings) {
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];
            let s = new model.Settings(current.name);
            for (let j = 0; j < current.properties.length; j++) {
                let p = current.properties[j];
                s.addProperty(p.name, p._type, p.value, p.units);
            }
            let setting = yield db.insert('settings', s);
            let p2s = new model.Process2Setting(processID, setting.id);
            yield db.insert('process2setting', p2s);
        }
    }

    function *addMeasurements(processID, measurements) {
        for (let i = 0; i < measurements.length; i++) {
            let current = measurements[i];
            let m = new model.Measurement(current.name, current.sample_id);
            m.addValue(current.value, current.units, current.nvalue, current.nunits);
            let rv = yield db.insert('measurements', m);
            let mid = rv.id;
            let p2m = new model.Process2Measurement(processID, mid);
            yield db.insert('process2measurement', p2m);
            if (_.has(current, 'file')) {
                let location = current.file.grid ? current.file.grid : current.file.offset;
                let m2f = new model.Measurement2DataFile(mid, current.file.file_id, location);
                yield db.insert('measurement2datafile', m2f);
            }
        }
    }
};
