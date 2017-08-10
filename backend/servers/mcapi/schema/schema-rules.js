const directories = require('../db/model/directories');
const samples = require('../db/model/samples');
const _ = require('lodash');
const path = require('path');
const model = {
    'directories': directories,
    'samples': samples
}

let propertyTypes = [
    'number',
    'string',
    'histogram',
    'composition'
];

let propertyUnits = [
    'mm',
    'm',
    'c',
    'f'
];

let experimentStatusStrings = [
    'done',
    'on-hold',
    'active',
    'error'
];


////////////////////////////////////////

// mustExist looks up an entry in the named table by id. If
// the entry doesn't exist it returns an error.
function mustExist(what, modelName, done) {
    model[modelName].get(what).then((value) => {
        let error = null;
        if (!value) {
            error = {
                rule: 'mustExist',
                actual: what,
                expected: 'did not find ' + what + ' in model'
            };
        }
        done(error);
    });
}

// mustNotExist looks up an entry in the named table by the named
// index. If the entry exists it returns an error.
function mustNotExist(what, spec, done) {
    let pieces = spec.split(':'),
        modelName = pieces[0],
        modelIndex = pieces[1];
    model[modelName].get(what, modelIndex).then((value) => {
        let error = null;
        if (value) {
            // found a match, when we shouldn't have
            error = {
                rule: 'mustNotExist',
                actual: what,
                expected: `found ${what} in model`
            };
        }
        done(error);
    });
}

// mustNotExistInProject ensures that the item doesn't exist in
// the project.
function mustNotExistInProject(what, spec, done) {
    let pieces = spec.split(':'),
        modelName = pieces[0],
        index = pieces[1];
    let project_id = this.project_id;
    model[modelName].findInProject(this.project_id, index, what)
        .then((matches) => {
            let error = matches.length === 0 ? null : {
                rule: 'mustNotExistInProject',
                actual: what,
                expected: `${index}:${what} should not exist in project ${project_id}`
            };
            done(error);
        });
}

// mustExistInProject ensures that the item exists in the project.
function mustExistInProject(what, modelName, done) {
    let project_id = this.project_id;
    model[modelName].findInProject(this.project_id, 'id', what)
        .then(
            (matches) => {
                let error = matches.length !== 0 ? null : {
                    rules: 'mustExistInProject',
                    actual: what,
                    expected: `${what} should exist in project ${project_id}`
                };
                done(error);
            },
            (err) => {
                let error = {
                    rules: 'mustExistInProject',
                    actual: what,
                    expected: `${what} should exist in project ${project_id} error ${err}`
                };
                done(err);
            });
}

// isValidPropertyType checks the different known types for a property.
function isValidPropertyType(what) {
    let invalid = {
        rule: 'isValidPropertyType',
        actual: what,
        expected: `type to be one of ${propertyTypes}`
    };
    return _.findIndex(propertyTypes, what) === -1 ? invalid : null;
}

// isValidUnit checks the different known types for unit.
function isValidUnit(what) {
    let invalid = {
        rule: 'isValidUnit',
        actual: what,
        expected: `units to be one of ${propertyUnits}`
    };
    return _.findIndex(propertyUnits, what) === -1 ? invalid : null;
}

// isValidExperimentStatus ensures that the status is set to one
// of the valid strings.
function isValidExperimentStatus(what) {
    let invalid = {
        rule: 'isValidExperimentStatus',
        actual: what,
        expected: `status to be one of ${experimentStatusStrings}`
    };

    return _.findIndex(experimentStatusStrings, (s) => s === what) === -1 ? invalid : null;
}

function oneOf(_what, spec) {
    let attrs = spec.split(':');
    for (let i = 0; i < attrs.length; i++) {
        if (_.has(this, attrs[i])) {
            return null;
        }
    }

    return {
        rule: 'oneOf',
        actual: this,
        expected: `one of the following attributes ${attrs}`
    };
}

function mustNotStartWith(what, spec) {
    if (what.startsWith(spec)) {
        return {
            rule: 'mustNotStartWith',
            actual: what,
            expected: '${what} should not start with ${spec}'
        }
    }

    return null;
}

/**
 * Checks that a given attribute_id or attribute_set_id belongs
 * to the sample_id in this.
 * @param {String} id - The id to look up.
 * @param {String} idType - Either 'attribute' or 'attributset'
 * @param {Function} done - Function to call with validation status.
 */
function mustBeForSample(id, idType, done) {
    if (!id) {
        // Rule can be called because we couldn't specify
        // the id as optionally nullable. So even if the
        // attribute doesn't exist this rule is called.
        // This check just returns no error when that occurs.
        done(null);
        return;
    }


    let sample_id = this.sample_id;
    if (idType === 'attribute') {
        samples.validateAttribute(sample_id, id).then(checkMatch);
    } else if (idType === 'attributeset') {
        samples.validateAttributeSet(sample_id, id).then(checkMatch);
    } else {
        done({
            rule: 'mustBeForSample',
            actual: idType,
            expected: `${idType} to be either 'attribute' or 'attributeset'`
        });
    }

    //////////////////

    /**
     * Checks if there were any matches. If not generates an error.
     * @param {Array} matches - A list of matching items.
     */
    function checkMatch(matches) {
        if (matches.length !== 0) {
            done(null);
        } else {
            let error = {
                rule: 'mustBeForSample',
                actual: id,
                expected: `${id} to belong to sample ${sample_id}`
            };
            done(error);
        }
    }

}

/**
 * Ensures that the measurement ids are valid. It does this by making sure
 * all the measurements came from this sample, and that the measurements
 * all have the same type.
 * @param {Array} measurements - List of measurement ids.
 * @param {bool} _ignore - Ignored (parameter in schema definition)
 * @param {Function} done - Callback to signal success or failure
 */
function mustBeValidMeasurements(measurements, _ignore, done) {
    let measurementType = this.otype;
    let sampleID = this.sample_id;
    if (measurements.length === 0) {
        done(null);
    } else {
        model.sample.getMeasurements(sampleID, measurements).then(checkMeasures);
    }

    //////////////////

    function checkMeasures(measures) {
        let error = {
            rule: 'mustBeValidMeasurements',
            actual: measures,
            expected: null
        };
        if (measures.length !== measurements.length) {
            // One or more measurements were not associated with the given
            // sample id.
            error.expected = `measurements to all be for sample ${sampleID}`;
        } else {
            let index = _.findIndex(measures, function(m) {
                return m.otype !== measurementType;
            });
            if (index !== -1) {
                // found a measurement with the wrong type.
                error.expected = `all measurement to have type ${measurementType}`;
            }
        }
        // if error.expected was set then return an error, otherwise
        // signal success by calling done with null.
        done(error.expected ? error : null);
    }
}

function mustBeForAttributeSet(attributes, _ignore, done) {
    if (!attributes) {
        done(null);
        return;
    }
    let asetID = this.attribute_set_id;
    let error = {
        rule: 'mustBeForAttributeSet',
        actual: attributes,
        expected: `all attributes to belong to attribute set ${asetID}`
    };
    model.sample.getAttributesFromAS(asetID, attributes)
        .then((attrs) => {
            done(attrs.length !== attributes.length ? error : null);
        });
}

function mustNotExistInDirectory(dirName, key, done) {
    let dirIDToCheckIn = this[key];
    directories.subdirExists(dirIDToCheckIn, dirName).then(function(dirs) {
        let error = dirs.length === 0 ? null : {
            rule: 'mustNotExistInDirectory',
            actual: dirName,
            expected: `No child directory with name ${dirName}`
        };
        done(error);
    }, function(err) {
        let error = {
            rule: 'mustNotExistInDirectory',
            actual: dirName,
            expected: `No child directory with name ${dirName}, got error: ${err}`
        };
        done(error);
    });
}

function mustNotExistInParentDirectory(name, idKey, done) {
    let dirID = this[idKey];
    let error = null;
    // Get directory
    directories.peerDirectories(dirID).then(
        (dir) => {
            if (dir.peer_directories.length) {
                let parentDirName = path.dirname(dir.name);
                let index = _.findIndex(dir.peer_directories, {name: `${parentDirName}/${name}`});
                if (index !== -1) {
                    error = {
                        rule: 'mustNotExistInParentDirectory',
                        actual: 'name',
                        expected: `${name} not to exist in directory`
                    };
                }
                done(error);
            }
        },
        (e) => {
            error = {
                rule: 'mustNotExistInParentDirectory',
                actual: 'name',
                expected: `${name} not to exist in directory with error ${e}`
            };
            done(error);
        });
}

module.exports = {
    mustExist,
    mustNotExist,
    mustNotExistInProject,
    mustExistInProject,
    isValidPropertyType,
    isValidUnit,
    isValidExperimentStatus,
    oneOf,
    mustBeForSample,
    mustBeValidMeasurements,
    mustBeForAttributeSet,
    mustNotStartWith,
    mustNotExistInDirectory,
    mustNotExistInParentDirectory
};
