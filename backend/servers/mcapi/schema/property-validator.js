const _ = require('lodash');

function isValidSetupProperty(template, property) {
    let setupAttr = _.find(template.setup, {attribute: property.setup_attribute});
    if (!setupAttr) {
        return false;
    }

    let templateProperty = _.find(setupAttr.properties, (p) => p.attribute === property.attribute);
    if (!templateProperty) {
        return false;
    }
    //templateProperty = templateProperty.property;

    if (templateProperty.otype !== property.otype) {
        return false;
    }

    if (!isValidUnit(templateProperty.unit, templateProperty.units, property.unit)) {
        return false;
    }

    return isValidValue(property.otype, templateProperty.choices, property.value);
}

function isValidUnit(templateUnit, templateAllowedUnits, unit) {
    if (templateUnit !== "" && templateUnit === unit) {
        return true;
    } else if (unit === "" && templateAllowedUnits.length) {
        return false;
    } else if (unit === "" && !templateAllowedUnits.length) {
        return true;
    } else {
        return _.findIndex(templateAllowedUnits, (u) => u === unit) !== -1;
    }
}

function isValidValue(propertyType, choices, value) {
    switch (propertyType) {
        case "selection":
            return isValidSelectionValue(choices, value);
        case "number":
            return isValidNumber(value);
        case "string":
            return isValidString(value);
        case "date":
            return isValidDate(value);
        default:
            return false;
    }
}

function isValidSelectionValue(choices, value) {
    let hasOther = false;
    let index = _.findIndex(choices, (c) => {
        if (c.value === 'other') {
            hasOther = true;
        }
        return c.value == value.value && c.name === value.name;
    });

    // If a selection has Other as a name then allow any value for
    // its value field so that users can specify custom value if
    // one of the existing choices doesn't work.
    if (hasOther && value.name === 'Other') {
        return true;
    } else {
        return index !== -1;
    }
}

function isValidNumber(value) {
    return _.isNumber(value);
}

function isValidString(value) {
    return _.isString(value);
}

// isValidDate will validate a date if it's not more than 1 year in the past
// and isn't in the future.
function isValidDate(value) {
    let today = Date.now();
    let oneYearAgo = getOneYearAgo();
    if (_.isNumber(value) && (value >= oneYearAgo && value <= today)) {
        return true;
    }

    return false;
}

function getOneYearAgo() {
    let today = Date.now();
    today.setFullYear(today.getFullYear() - 1);
    return today;
}

module.exports.isValidSetupProperty = isValidSetupProperty;
