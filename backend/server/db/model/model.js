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

    function Process2Sample(processID, sampleID, asetID, _type) {
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
