/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

var materialsdirective = angular.module("materialsdirective", []);

materialsdirective.directive("jqueryTable", function() {
    return {
        restrict: 'A',
        link: function(scope,element, attrs){
            console.log("directive called");
            $('#myTable').tablesorter();
        }

    };
})
