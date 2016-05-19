const _ = require('lodash');

function isValidSetupProperty(template, property) {
    let setupAttr = _.find(template.setup, {attribute: property.setup_attribute});
    if (!setupAttr) {
        return false;
    }

    let templateProperty = _.find(setupAttr.properties, {attribute: property.attribute});
    if (!templateProperty) {
        return false;
    }

    if (templateProperty._type !== property._type) {
        return false;
    }

    if (!isValidUnit(templateProperty.units, property.unit)) {
        return false;
    }

    return isValidValue(property._type, templateProperty.choices, property.value);
}

function isValidUnit(allowedUnits, unit) {
    if (unit === "" && allowedUnits.length) {
        return false;
    } else if (unit === "" && !allowedUnits.length) {
        return true;
    } else {
        return _.findIndex(allowedUnits, unit) !== -1;
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
    }
}

function isValidSelectionValue(choices, value) {
    return _.findIndex(choices, {value: value}) !== -1;
}

function isValidNumber(value) {
    return _.isNumber(value);
}

function isValidString(value) {
    return _.isString(value);
}

module.exports = isValidSetupProperty;