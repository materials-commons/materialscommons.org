const _ = require('lodash');

function removeExistingItemsIn(items, matchingEntries, property) {
    if (items.length) {
        let matchingEntriesByProperty = _.keyBy(matchingEntries, property);
        return items.filter(item => (!(item[property] in matchingEntriesByProperty)));
    }
    return items;
}

function nameToAttr(name) {
    return name.trim().replace(/\s+/g, '_').replace(/\//g, '_').replace(/-/g, '_').toLowerCase();
}

module.exports = {
    removeExistingItemsIn,
    nameToAttr,
};
