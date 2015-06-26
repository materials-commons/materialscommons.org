module.exports = function(r) {
    'use strict';

    let db = require('./db')(r);

    ///////////////////////////////////////

    function Sample(name, description, owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.birthtime = r.now();
        this.mtime = this.birthtime;
        this._type = "sample";
    }

    function Process(name, owner, ptype, what, how) {
        this.name = name;
        this.owner = owner;
        this.what = what;
        this.how = how;
        this.process_type = ptype;
        this.birthtime = r.now();
        this.mtime = this.birthtime;
        this._type = "process";
    }

    function Process2Setup(processID, setupID) {
        this.setup_id = setupID;
        this.process_id = processID;
    }

    function Process2Measurement(processID, mID) {
        this.measurement_id = mID;
        this.process_id = processID;
    }

    function Process2Sample(sampleID, processID, asetID, _type) {
        this.sample_id = sampleID;
        this.process_id = processID;
        this.attribute_set_id = asetID;
        this._type = _type;
    }

    function Process2Setupfile(processID, fileID) {
        this.process_id = processID;
        this.datafile_id = fileID;
    }

    function Process2File(processID, fileID) {
        this.process_id = processID;
        this.datafile_id = fileID;
    }

    function Setups(name, attribute) {
        this.name = name;
        this.attribute = attribute;
        this.birthtime = r.now();
        this._type = "settings";
    }

    function SetupProperty(setupID, name, description, attribute, _type, value, unit) {
        this.setup_id = setupID;
        this.name = name;
        this.description = description;
        this.attribute = attribute;
        this._type = _type;
        this.value = value;
        this.units = unit;
    }

    function Measurement(name, attribute, sampleID) {
        this.name = name;
        this.attribute = attribute;
        this.sample_id = sampleID;
        this._type = "measurement";
        this.file = {};
        this.measurements = [];
    }

    Measurement.prototype.setValue = function(value, units, _type, nvalue, nunits) {
        this.value = value;
        this._type = _type;
        this.units = units;
        this.nvalue = nvalue ? nvalue : value;
        this.nunits = nunits ? nunits : units;
    };

    Measurement.prototype.setFile = function(f) {
        this.file = f;
    };

    Measurement.prototype.setMeasurements = function(measurements) {
        this.measurements = measurements;
    };

    function Property(name, attribute) {
        this.parent_id = '';
        this.birthtime = r.now();
        this._type = 'attribute';
        this.name = name;
        this.attribute = attribute;
        this.best_measure_id = '';
    }

    function PropertySet(current, parent_id) {
        this.current = current ? current : false;
        this.parent_id = parent_id ? parent_id : '';
    }

    function Property2Measurement(attrID, measurementID) {
        this.attribute_id = attrID;
        this.measurement_id = measurementID;
    }

    function Property2Process(attrID, processID) {
        this.attribute_id = attrID;
        this.process_id = processID;
    }

    function Project2Process(projectID, processID) {
        this.project_id = projectID;
        this.process_id = processID;
    }

    function Project2Sample(projectID, sampleID) {
        this.project_id = projectID;
        this.sample_id = sampleID;
    }

    function Sample2AttributeSet(sampleID, asetID, current) {
        this.attribute_set_id = asetID;
        this.sample_id = sampleID;
        this.version  = version;
        this.current = current;
    }

    function PropertySet2Property(asetID, attrID) {
        this.attribute_set_id = asetID;
        this.attribute_id = attrID;
    }

    function BestMeasureHistory(attrID, mID) {
        this.attribute_id = attrID;
        this.measurement_id = mID;
        this.when = r.now();
        this._type = 'best_measure_history';
    }

    function *addMeasurement(name, prop, attrID, processID, sampleID) {
        'use strict';
        let m = new Measurement(name, processID, sampleID);
        let rv = yield db.insert('measurements', m);
        let mid = rv.id;
        let a2m = new Property2Measurement(attrID, mid);
        yield db.insert('attribute2measurement', a2m);
        return mid;
    }

    function *addAttributeSet(processID, sampleID, attrSet, direction) {
        'use strict';
        let aset = db.insert('attributesets', attrSet);
        let s2as = new Sample2AttributeSet(aset.id, sampleID, 0, true);
        yield db.insert('sample2attributeset', s2as);
        let p2s = new Process2Sample(sampleID, processID, aset.id, direction);
        yield db.insert('process2sample', p2s);
        return aset.id;
    }

    function *addAttributeSetID(processID, sampleID, asetID, direction) {
        'use strict';
        let p2s = new Process2Sample(processID, sampleID, asetID, direction);
        yield db.insert('process2sample', p2s);
    }

    function *addAttribute(asetID, attr) {
        'use strict';
        let newAttr = yield db.insert('attributes', attr);
        let as2a = new PropertySet2Property(asetID, newAttr.id);
        yield db.insert('attributeset2attribute', as2a);
        return as2a.id;
    }

    function *addAttributeID(asetID, attrID) {
        'use strict';
        let as2a = new PropertySet2Property(asetID, attrID);
        yield db.insert('attributeset2attribute', as2a);
    }

    function *addBestMeasure(attrID, mID) {
        'use strict';
        yield db.update('attributes', attr_id, {best_measure_id: mID});
        let bmHistory = new BestMeasureHistory(attrID, mID);
        yield db.insert('best_measure_history', bmHistory);
    }

    //////////////////////////////// moved into specific model //////////////

    function *addProcess(projectID, process) {
        'use strict';
        let proc = yield db.insert('processes', process);
        let p2proc = new Project2Process(projectID, proc.id);
        yield db.insert('project2process', p2proc);
        return p2proc.id;
    }

    function *addSettings(processID, settings, direction) {
        'use strict';
        let setting = yield db.insert('settings', settings);
        let p2s = new Process2Setting(processID, setting.id, direction);
        yield db.insert('process2setting', p2s);
    }

    return {
        Sample: Sample,
        Process: Process,
        Process2Setup: Process2Setup,
        Process2Measurement: Process2Measurement,
        Process2Sample: Process2Sample,
        Process2Setupfile: Process2Setupfile,
        Process2File: Process2File,
        Setups: Setups,
        SetupProperty: SetupProperty,
        Measurement: Measurement,
        Property: Property,
        Property2Process: Property2Process,
        Property2Measurement: Property2Measurement,
        PropertySet: PropertySet,
        PropertySet2Property: PropertySet2Property,
        Project2Process: Project2Process,
        Project2Sample: Project2Sample,
        Sample2PropertySet: Sample2AttributeSet,
        BestMeasureHistory: BestMeasureHistory
    };
};
