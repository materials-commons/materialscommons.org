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

    function Process(name, owner, templateID, what, how) {
        this.name = name;
        this.owner = owner;
        this.what = what;
        this.how = how;
        this.template_id = templateID;
        this.birthtime = r.now();
        this.mtime = this.birthtime;
        this._type = "process";
    }

    function Process2Setting(processID, settingID) {
        this.setting_id = settingID;
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

    function Settings(name, attribute) {
        this.name = name;
        this.attribute = attribute;
        this.birthtime = r.now();
        this._type = "settings";
    }

    function SettingProperty(settingID, name, attribute, _type, value, units) {
        this.setting_id = settingID;
        this.name = name;
        this.attribute = attribute;
        this._type = _type;
        this.value = value;
        this.units = units;
    }

    function Property(_type, value, units, nvalue, nunits) {
        this._type = _type;
        this.value = value;
        this.units = units;
        this.nvalue = nvalue;
        this.nunits = nunits;
    }

    function addProperty(name, val) {
        this.properties[name] = val;
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

    function Attribute(name, attribute) {
        this.parent_id = '';
        this.birthtime = r.now();
        this._type = 'attribute';
        this.name = name;
        this.attribute = attribute;
        this.best_measure_id = '';
    }

    function AttributeSet(current, parent_id) {
        this.current = current ? current : false;
        this.parent_id = parent_id ? parent_id : '';
    }

    function Attribute2Measurement(attrID, measurementID) {
        this.attribute_id = attrID;
        this.measurement_id = measurementID;
    }

    function Attribute2Process(attrID, processID) {
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

    function AttributeSet2Attribute(asetID, attrID) {
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
        let a2m = new Attribute2Measurement(attrID, mid);
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
        let as2a = new AttributeSet2Attribute(asetID, newAttr.id);
        yield db.insert('attributeset2attribute', as2a);
        return as2a.id;
    }

    function *addAttributeID(asetID, attrID) {
        'use strict';
        let as2a = new AttributeSet2Attribute(asetID, attrID);
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
        Process2Setting: Process2Setting,
        Process2Measurement: Process2Measurement,
        Process2Sample: Process2Sample,
        Settings: Settings,
        SettingProperty: SettingProperty,
        Property: Property,
        Measurement: Measurement,
        Attribute: Attribute,
        Attribute2Process: Attribute2Process,
        Attribute2Measurement: Attribute2Measurement,
        AttributeSet: AttributeSet,
        AttributeSet2Attribute: AttributeSet2Attribute,
        Project2Process: Project2Process,
        Project2Sample: Project2Sample,
        Sample2AttributeSet: Sample2AttributeSet,
        BestMeasureHistory: BestMeasureHistory
    };
};
