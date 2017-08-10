const _ = require('lodash');

module.exports.removeExistingItemsIn = function removeExistingItemsIn(items, matchingEntries, property) {
    if (items.length) {
        let matchingEntriesByProperty = _.keyBy(matchingEntries, property);
        return items.filter(item => (!(item[property] in matchingEntriesByProperty)));
    }
    return items;
};
