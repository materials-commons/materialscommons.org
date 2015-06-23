var _ = require('lodash');
var serror = require('./schema-error');
var dataType = exports;

// Validates a measurement type. A measurement has 4 fields
//   _type: The type of value
//   _attribute: The attribute being measured. The attribute
//               defines the list of valid values and units.
//   value: The value of the measurement (as defined by _type)
//   units: Not currently validated
dataType.measurement = function(dt) {
    'use strict';
    let expectedProperties = [
        '_type',
        '_attribute',
        'value',
        'units'
    ];
    let check = hasExpectedProperties(dt, expectedProperties);
    if (check !== null) {
        return check;
    }

    check = validateValueForType(dt);

    return null;
};

function hasExpectedProperties(dt, props) {
    'use strict';
    for (let i = 0; i < props.length; i++) {
        if (!(props[i] in dt)) {
            return {
                rule: 'type',
                actual: dt,
                expected: `${props[i]} in type`
            };
        }
    }

    return null;
}

function validateValueForType(dt) {
    'use strict';

    let e = serror().from({rule: 'type', actual: dt.value});
    switch(dt._type) {
    case "number":
        return validateNumber(dt, e);
    case "string":
        return validateString(dt, e);
    case "histogram":
        return validateHistogram(dt, e);
    case "composition":
        return validateComposition(dt, e);
    default:
        return e.actual(dt._type).expected(`unknown _type ${dt._type}`).done();
    }
}

function validateNumber(dt, e) {
    if (_.isNumber(dt.value)) {
        return null;
    }
    return e.expected('type number').done();
}

function validateString(dt, e) {
    if (_.isString(dt.value)) {
        return null;
    }
    return e.expected('type string').done();
}

function validateHistogram(dt, e) {
    return null;
}

function validateComposition(dt, e) {
    return null;
}
