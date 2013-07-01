/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

var Filter = angular.module('Filter', []);

Filter.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

Filter.filter('matchDates', function() {
    return function( search_results, start_end_dates ) {
        var arrayToReturn = [];
        utc_start_date =  Date.parse(start_end_dates[0])/1000;
        utc_end_date =  Date.parse(start_end_dates[1])/1000;
            for (var i=0; i< search_results.length; i++){
            if ( (search_results[i].key[0] == start_end_dates[2]) && (search_results[i].key[1] > utc_start_date) && (search_results[i].key[1] < utc_end_date)) {
                arrayToReturn.push(search_results[i]);
            }
        }

        return arrayToReturn;

    };
});

