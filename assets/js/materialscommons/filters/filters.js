/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('Filter', [])
    .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});