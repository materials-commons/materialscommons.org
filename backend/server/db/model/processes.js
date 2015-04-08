/**
 * Processes module. This module implement the CRUD model for processes.
 * @module db/model/processes
 */

/**
 * Sets up the CRUD methods for processes. Saves the rethinkdbdash parameter
 * for access by exported methods.
 *
 * @param {Object} r - The rethinkdbdash instance.
 */
module.exports = function(r) {
    'use strict';

    let _ = require('lodash');
    let model = require('./model')(r);
    let db = require('./db')(r);

    return {
        create: create
    };

    ///////////////// Module public methods /////////////////

    /**
     * Creates a new process from the passed in process definition. This
     * method assumes that the process passed in is valid. Validation of
     * the process must be done outside of this method.
     *
     * @param {Object} process - The process definition to create the new
     *                           process from.
     * @returns {Object} - The new process created from the definition.
     */
    function *create(process) {
        let p = new model.Process(process.name, process.owner,
                                  process.template_id, process.what, process.how);
        let proc = yield addProcess(process.project_id, p);
        let settings = yield addSettings(proc.id, process.settings);
        let measurements = yield addMeasurements(proc.id, process.measurements_created);
        let samples_created = yield addCreatedSamples(process.samples_created,
                                                      process.project_id, proc.id, process.owner);
        let samples_transformed = yield addTransformedSamples(process.samples_transformed,
                                                              proc.id);
        // Construct the process just created. The process definition for creation
        // is different from the actual instantiated process model.
        proc.settings = settings;
        proc.measurements = measurements;

        return proc;
    }

    ///////////////// Module private methods /////////////////

    /**
     * Creates a new process and adds it to the given project.
     *
     * @param {String} projectID - The projectID this process belongs to.
     * @param {Object} process - The process definition from create.
     *
     * @returns {Object} - The process inserted into the database.
     */
    function *addProcess(projectID, process) {
        let p = yield db.insert('processes', process);
        let p2proc = new model.Project2Process(projectID, p.id);
        yield db.insert('project2process', p2proc);
        return p;
    }

    /**
     * Creates the settings for the process and inserts it into the database.
     *
     * @param {String} processID - The database id for the created process.
     * @param {Arrays} settings - The settings to create.
     *
     * @returns {Object} - The settings object inserted into the database.
     */
    function *addSettings(processID, settings) {
        let created = [];
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];

            // Create the setting
            let s = new model.Settings(current.name, current.attribute);
            let setting = yield db.insert('settings', s);

            // Associate it with the process
            let p2s = new model.Process2Setting(processID, setting.id);
            yield db.insert('process2setting', p2s);

            // Create each property for the setting. Add these to the
            // setting variable so we can return a setting object with
            // all of its properties.
            setting.properties = [];
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

    /**
     * Adds all the measurements to the attributes. Creates a new attribute if
     * the measurement is for an attribute that isn't currently in the sample.
     * The method determines that an attribute is a new attribute if no
     * attribute_id is included in the measurement, but an attribute_set_id is
     * included. The attribute_set_id is required so that the new attribute can
     * be attached to the proper version of the sample, since a sample and
     * attribute set uniquely define a sample version.
     *
     * @param {String} processID - The process these measurements came from.
     * @param {Array} measurements - An array of measurement definitions.
     *
     * @returns {Array} - A list of the measurements that were inserted into the database.
     */
    function *addMeasurements(processID, measurements) {
        let created = [];
        for (let i = 0; i < measurements.length; i++) {
            let current = measurements[i];
            let m = createMeasurementModel(current);
            let measurement = yield db.insert('measurements', m);

            if (_.has(current, 'attribute_id')) {
                // measurement on an existing attribute
                yield addMeasurementToAttribute(current.attribute_id, measurement.id);
            } else if (_.has(current, 'attribute_set_id')) {
                // new attribute being measured
                yield addNewAttribute(measurement, current.attribute_set_id, processID);
            }
            created.push(measurement);
        }
        // TODO: Add the measurements to the attribute and return the
        // attributes, rather than just a list of created measurements.
        yield addMeasurementsToProcess(processID, created);
        return created;
    }

    /**
     * creates a new measurement from the measurement definition. Handles
     * book keeping tasks such as where the measurement was derived from
     * such as a file, or from another set of measurements.
     *
     * @param {Object} from - The measurement definition to create the model from.
     *
     * @returns {Object} - The new measurement model.
     */
    function createMeasurementModel(from) {
        let m = new model.Measurement(from.name, from.attribute, from.sample_id);
        m.setValue(from.value, from.units, from._type,
                   from.nvalue, from.nunits);

        if (_.has(from, 'from_file')) {
            m.setFile(from.from_file);
        } else if (_.has(from, 'from_measurements')) {
            m.setMeasurements(from.from_measurements);
        }
        return m;
    }

    /**
     * Takes a measurement and associates it with the given attribute.
     *
     * @param {String} attrID - The attribute the measurement is for.
     * @param {String} mID - The measurement
     */
    function *addMeasurementToAttribute(attrID, mID) {
        let a2m = new model.Attribute2Measurement(attrID, mID);
        yield db.insert('attribute2measurement', a2m);
    }

    /**
     * Creates a new attribute and adds it to the given attribute set. Associates
     * the given measurement with that attribute.
     *
     * @param {Object} m - The measurement for the attribute.
     * @param {String} attrSetID - The attribute set the new attribute belongs to.
     * @param {String} processID - The process that created this attribute.
     *
     */
    function *addNewAttribute(m, attrSetID, processID) {
        let attr = new model.Attribute(m.name, m.attribute);
        let createdAttr = yield db.insert('attributes', attr);

        let a2m = new model.Attribute2Measurement(createdAttr.id, m.id);
        yield db.insert('attribute2measurement', a2m);

        let as2a = new model.AttributeSet2Attribute(attrSetID, createdAttr.id);
        yield db.insert('attributeset2attribute', as2a);

        let a2p = new model.Attribute2Process(createdAttr.id, processID);
        yield db.insert('attribute2process', a2p);
    }

    /**
     * Adds measurements to the given process. This allows for tracking
     * which processes took which measurements.
     *
     * @param {String} processID - The process to associate the measurements with.
     * @param {Array} measurements - The measurements taken by this process.
     *
     */
    function *addMeasurementsToProcess(processID, measurements) {
        let p2ms = [];
        measurements.forEach(function(m) {
            let p2m = new model.Process2Measurement(processID, m.id);
            p2ms.push(p2m);
        });
        yield db.insert('process2measurement', p2ms);
    }

    /**
     * Inserts into the database the samples this process created. Updates dependencies such
     * as the project.
     * @param {Array} samples - Samples to create.
     * @param {String} projectID - The project the samples are being added.
     * @param {String} processID - The process that created the samples.
     * @param {String} owner - Owner of samples.
     * @returns {Array} - The created samples.
     */
    function *addCreatedSamples(samples, projectID, processID, owner) {
        let created = [];
        for (let i = 0; i < samples.length; i++) {
            let current = samples[i];
            let s = yield addNewSample(current.name, current.description, owner);
            yield addSampleAssociations(s.sample.id, s.asetID, projectID, processID);
            created.push(s.sample);
        }
        return created;
    }

    /**
     * Adds a new sample to the database and updates/creates all relationships.
     * @param {String} name - The name of the sample.
     * @param {String} description - Description of the sample.
     * @param {String} owner - Sample owner.
     * @returns {Object}  - The created sample.
     */
    function *addNewSample(name, description, owner) {
        let s = new model.Sample(name, description, owner);
        let sample = yield db.insert('samples', s);
        let aset = new model.AttributeSet();
        let createdASet = yield db.insert('attributeset', aset);
        let s2as = new model.Sample2AttributeSet(sample.id, createdASet.id, true);
        yield db.insert('sample2attributeset', s2as);
        return {
            sample: sample,
            asetID: createdASet.id
        };
    }

    /**
     * Creates all the other associations for a sample including mapping the sample
     * to the project it is in, and the process that created it.
     * @param {String} sampleID - The id of the created sample.
     * @param {String} asetID - The attribute set for the sample.
     * @param {String} projectID - The project to add sample id.
     * @param {String} processID - The process that created the sample.
     *
     */
    function *addSampleAssociations(sampleID, asetID, projectID, processID) {
        let proc2sample = new model.Process2Sample(processID, sampleID, asetID, 'out');
        let proj2sample = new model.Project2Sample(projectID, sampleID);
        yield db.insert('process2sample', proc2sample);
        yield db.insert('project2sample', proj2sample);
    }

    /**
     * Updates the database with transformed samples. A transformed sample is
     * one which has undergone a change such that some properties change their
     * values and must be re-measured.
     * @param {Array} samples - The samples that were transformed.
     * @param {String} processID - The process that performed the transformation.
     *
     */
    function *addTransformedSamples(samples, processID) {
        for (let i = 0; i < samples.length; i++) {
            let current = samples[i];
            let aset = new model.AttributeSet(true, current.attribute_set_id);
            let asetCreated = yield db.insert('attributeset', aset);
            let s2as = new model.Sample2AttributeSet(current.sample_id, createdASet.id, true);
            yield db.insert('sample2attributeset', s2as);
            let oldASetID = current.attribute_set_id;
            yield r.table('sample2attributeset')
                .getAll(oldASetID, {index: 'attribute_set_id'})
                .update({current: false});
            yield fillAttributeSet(asetCreated.id, current.shares,
                                   current.uses, processID);
        }
    }

    /**
     *
     * @param {String} asetID - Attribute set to fill in.
     * @param {Array} shares - A list of attribute ids this attribute set shares.
     * @param {Array} uses - A list of attribute ids to use to create new attributes.
     */
    function *fillAttributeSet(asetID, shares, uses, processID) {
        yield fillFromShares(asetID, shares);
        yield fillFromUses(asetID, uses, processID);
    }

    /**
     * Create shared attributes. This method copies associates those
     * attributes with the given attribute set.
     * @param {String} asetID - The attribute set to add attributes to
     * @param {Array} shares - A list of attribute ids to associate with the attributeset.
     */
    function *fillFromShares(asetID, shares) {
        for (let i = 0; i < shares.length; i++) {
            let as2a = new model.AttributeSet2Attribute(asetID, shares[i]);
            yield db.insert('attributeset2attribute', as2a);
        }
    }

    /**
     * Create new attributes by using the given attributes as models.
     * @param {String} asetID - The attribute set to update
     * @param {Array} uses - A list of attributes to create new attributes from
     */
    function *fillFromUses(asetID, uses, processID) {
        for (let i = 0; i < uses.length; i++) {
            let attrID = uses[i];

            // Get the attribute we are going to copy
            let attr = yield r.table('attributes').get(attrID);

            // Save this attributes id for later use.
            let origID = attr.id;

            // Use as template for new attribute
            attr.id = '';
            attr.birthtime = r.now();
            attr.mtime = attr.birthtime;

            // Now insert new attribute
            let newAttr = yield db.insert('attributes', attr);

            // Attach all dependent tables and joins.
            yield attachDependencies(newAttr.id, origID);

            // Add new attribute to process that measured the
            // attribute? Need to talk with Brian about this one.
            // TODO: Talk to Brian about above.

            // Add to attribute set
            let as2a = new model.AttributeSet2Attribute(asetID, newAttr.id);
            yield db.insert('attributeset2attribute', as2a);
        }
    }

    /**
     * Creates and attaches the new measurements and best measure history
     * for the new attribute by copying over from the original attribute.
     * @param {String} newAttrID - The new attribute
     * @param {String} fromAttrID - The attribute the new one came from
     */
    function *attachDependencies(newAttrID, fromAttrID) {
        yield attachMeasurements(newAttrID, fromAttrID);
        yield attachBestMeasureHistory(newAttrID, fromAttrID);
    }

    /**
     * Creates a new set of measurements for the new attribute by
     * copying over the original attributes measurements, changing the
     * attribute_id to the new attributes id, and inserting.
     * @param {String} newAttrID - The new attribute
     * @param {String} fromAttrID - The attribute the new one came from
     */
    function *attachMeasurements(newAttrID, fromAttrID) {
        // Get original attributes measurements
        let rql = r.table('attribute2measurement')
                .getAll(fromAttrID, {index: 'attribute_id'});
        let original = yield rql;
        // Change id to newAttrID and insert into table
        original.forEach(function(m) {
            m.attribute_id = newAttrID;
        });
        yield db.insert('attribute2measurement', original);
    }

    /**
     * Creates a new best measure history for the new attribute by
     * copying over the original attributes history, changing the
     * attribute_id to the new attributes id, and inserting.
     * @param {String} newAttrID - The new attribute
     * @param {String} fromAttrID - The attribute the new one came from
     */
    function *attachBestMeasureHistory(newAttrID, fromAttrID) {
        // Get original attributes best measure history
        let rql = r.table('best_measure_history')
                .getAll(fromAttrID, {index: 'attribute_id'});
        let original = yield rql;

        // Change to newAttrID and insert
        original.forEach(function(entry) {
            entry.attribute_id = newAttrID;
        });
        yield db.insert('best_measure_history', original);
    }
};
