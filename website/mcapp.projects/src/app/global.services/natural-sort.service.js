function naturalSortService() {
    // amount of extra zeros to padd for sorting
    const padding = function(value) {
            return "00000000000000000000".slice(value.length);
        },        // Converts a value to a string.  Null and undefined are converted to ''
        toString = function(value) {
            if (value === null || angular.isUndefined(value)) {
                return '';
            }
            return '' + value;
        },        // Fix numbers to be correctly padded
        naturalValue = function(value) {
            // First, look for anything in the form of d.d or d.d.d...
            return toString(value).replace(/(\d+)((\.\d+)+)?/g, function($0, integer, decimal, $3) {
                // If there's more than 2 sets of numbers...
                if (decimal !== $3) {
                    // treat as a series of integers, like versioning,
                    // rather than a decimal
                    return $0.replace(/(\d+)/g, function($d) {
                        return padding($d) + $d;
                    });
                } else {
                    // add a decimal if necessary to ensure decimal sorting
                    decimal = decimal || ".0";
                    return padding(integer) + integer + decimal + padding(decimal);
                }
            });
        };

    return {
        naturalValue: naturalValue,
        naturalSort: function(a, b) {
            a = naturalValue(a);
            b = naturalValue(b);
            return (a < b) ? -1 : ((a > b) ? 1 : 0);
        },
        naturalOnField: function(field) {
            return function(item) {
                return naturalValue(item[field]);
            }
        }
    }
}

angular.module('materialscommons').factory('naturalSortService', naturalSortService);
