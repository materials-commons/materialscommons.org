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
}) ;


materialsdirective.directive('datepicker', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.datepicker();
            element.bind('changeDate', function(){
                scope.$apply(function(){
                    scope[attrs.ngModel] = element.val()
                });
            })


        }
    };
});



