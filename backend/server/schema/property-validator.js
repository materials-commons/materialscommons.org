const _ = require('lodash');

function isValidSetupProperty(template, property) {
    let setupAttr = _.find(template.setup, {attribute: property.setup_attribute});
    if (!setupAttr) {
        return false;
    }

    let templateProperty = _.find(setupAttr.properties, (p) => p.property.attribute === property.attribute);
    if (!templateProperty) {
        return false;
    }
    templateProperty = templateProperty.property;

    if (templateProperty._type !== property._type) {
        return false;
    }

    if (!isValidUnit(templateProperty.unit, templateProperty.units, property.unit)) {
        return false;
    }

    return isValidValue(property._type, templateProperty.choices, property.value);
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

module.exports.isValidSetupProperty = isValidSetupProperty;