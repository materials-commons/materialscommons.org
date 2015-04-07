module.exports = function(r) {
    'use strict';

    let util = require('util');
    let _ = require('lodash');
    let model = require('./model')(r);
    let db = require('./db')(r);

    return {
        create: create
    };

    /////////////////////////////////////

    function *create(process) {
        let p = new model.Process(process.name, process.owner,
                                  process.template_id, process.what, process.how);
        let proc = yield addProcess(process.project_id, p);
        let settings = yield addSettings(proc.id, process.settings);
        let measurements = yield addMeasurements(proc.id, process.measurements_created);
        proc.settings = settings;
        proc.measurements = measurements;
        console.log(util.inspect(proc, {showHidden: false, depth: null}));
        return proc;
    }

    //////////////////////////////////////

    function *addProcess(projectID, process) {
        let p = yield db.insert('processes', process);
        let p2proc = new model.Project2Process(projectID, p.id);
        yield db.insert('project2process', p2proc);
        return p;
    }

    // Optimize this method like we did addSettings
    function *addSettings(processID, settings) {
        let created = [];
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];
            let s = new model.Settings(current.name, current.attribute);
            let setting = yield db.insert('settings', s);
            setting.properties = [];
            let p2s = new model.Process2Setting(processID, setting.id);
            yield db.insert('process2setting', p2s);

            for (let j = 0; j < current.properties.length; j++) {
                let p = current.properties[j];
                let prop = new model.SettingProperty(setting.id, p.name, p.attribute,
                                                     p._type, p.value, p.units);
                let sprop = yield db.insert('setting_properties', prop);
                setting.properties.push(sprop);
            }
            created.push(setting);
        }
        return created;
    }

    function *addMeasurements(processID, measurements) {
        let toCreate = [];
        for (let i = 0; i < measurements.length; i++) {
            let current = measurements[i];
            let m = new model.Measurement(current.name, current.attribute, current.sample_id);
            m.setValue(current.value, current.units, current._type,
                       current.nvalue, current.nunits);

            if (_.has(current, 'from_file')) {
                m.setFile(current.from_file);
            } else if (_.has(current, 'from_measurements')) {
                m.setMeasurements(current.from_measurements);
            }
            toCreate.push(m);
        }
        let created = yield db.insert('measurements', toCreate, {toArray: true});
        let p2ms = [];
        created.forEach(function(m) {
            let p2m = new model.Process2Measurement(processID, m.id);
            p2ms.push(p2m);
        });
        yield db.insert('process2measurement', p2ms);
        return created;
    }
};
