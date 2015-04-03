module.exports = function(r) {
    'use strict';

    let db = require('./db')(r);

    return {
        Sample: Sample,
        Process: Process,
        Settings: Settings,
        Property: Property,
        Measurement: Measurement,
        Attribute2Measurement: Attribute2Measurement,
        Project2Process: Project2Process,
        Project2Sample: Project2Sample,
        AttributeSet2Attribute: AttributeSet2Attribute,
        BestMeasureHistory: BestMeasureHistory,
        addMeasurement: addMeasurement,
        addProcess: addProcess,
        addAttributeSet: addAttributeSet,
        addAttributeSetID: addAttributeSetID,
        addAttribute: addAttribute,
        addAttributeID: addAttributeID,
        addBestMeasure: addBestMeasure,
        addSettings: addSettings
    };

    ///////////////////////////////////////

    function Sample(name, description, owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.birthtime = r.now();
        this.mtime = this.birthtime;
        this._type = "sample";
    }

    function Process(name, owner, templateID, description) {
        this.name = name;
        this.owner = owner;
        this.description = description;
        this.template_id = templateID;
        this.birthtime = r.now();
        this.mtime = this.birthtime;
        this._type = "process";
    }

    function Settings(name) {
        this.name = name;
        this.birthtime = r.now();
        this._type = "settings";
        this.settings = {};
    }

    Settings.prototype.addSetting = function(name, _type, value, units, nvalue, nunits) {
        let p = new Property(_type, value, units ? units : "", nvalue ? nvalue : value, nunits ? nunits : units);
        this.settings[name] = p;
    };

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

    function Measurement(processID) {
        this.process_id = processID;
        this._type = "measurement";
        this.properties = {};
    }

    Measurement.prototype.addProperty = addProperty;

    function Attribute2Measurement(attrID, measurementID) {
        this.attribute_id = attrID;
        this.measurement_id = measurementID;
    }

    function Project2Process(projectID, processID) {
        this.project_id = projectID;
        this.process_id = processID;
    }

    function Project2Sample(projectID, sampleID) {
        this.project_id = projectID;
        this.sample_id = sampleID;
    }

    function Sample2AttributeSet(asetID, sampleID, version, current) {
        this.attribute_set_id = asetID;
        this.sample_id = sampleID;
        this.version  = version;
        this.current = current;
    }

    function Process2Sample(sampleID, processID, asetID, _type) {
        this.sample_id = sampleID;
        this.process_id = processID;
        this.attribute_set_id = asetID;
        this._type = _type;
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

    function *addMeasurement(name, prop, attrID, processID) {
        let m = new Measurement(processID);
        m.addProperty(name, prop);
        let rv = yield db.insert('measurements', m);
        let mid = rv.id;
        let a2m = new Attribute2Measurement(attrID, mid);
        yield db.insert('attribute2measurement', a2m);
        return mid;
    }

    function *addProcess(projectID, process) {
        let proc = yield db.insert('processes', process);
        let p2proc = new Project2Process(projectID, proc.id);
        yield db.insert('project2process', p2proc);
        return p2proc.id;
    }

    function *addAttributeSet(processID, sampleID, attrSet, direction) {
        let aset = db.insert('attributesets', attrSet);
        let s2as = new Sample2AttributeSet(aset.id, sampleID, 0, true);
        yield db.insert('sample2attributeset', s2as);
        let p2s = new Process2Sample(sampleID, processID, aset.id, direction);
        yield db.insert('process2sample', p2s);
        return aset.id;
    }

    function *addAttributeSetID(processID, sampleID, asetID, direction) {
        let p2s = new Process2Sample(processID, sampleID, asetID, direction);
        yield db.insert('process2sample', p2s);
    }

    function *addAttribute(asetID, attr) {
        let newAttr = yield db.insert('attributes', attr);
        let as2a = new AttributeSet2Attribute(asetID, newAttr.id);
        yield db.insert('attributeset2attribute', as2a);
        return as2a.id;
    }

    function *addAttributeID(asetID, attrID) {
        let as2a = new AttributeSet2Attribute(asetID, attrID);
        yield db.insert('attributeset2attribute', as2a);
    }

    function *addBestMeasure(attrID, mID) {
        yield db.update('attributes', attr_id, {best_measure_id: mID});
        let bmHistory = new BestMeasureHistory(attrID, mID);
        yield db.insert('best_measure_history', bmHistory);
    }

    function *addSettings(processID, settings, _type) {
        let setting = yield db.insert('settings', settings);
        p2s = new Process2Setting(processID, setting.id, _type);
        yield db.insert('process2setting', p2s);
    }

};
