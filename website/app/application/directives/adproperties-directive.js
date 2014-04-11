Application.Controllers.controller('AddPropertyController',
    ["$scope", function ($scope) {
        $scope.addAdditionalProperty = function () {
            $scope.doc.added_properties.push(JSON.parse($scope.bk.additional_property));
        };

        $scope.addCustomProperty = function () {
            $scope.doc.added_properties.push({'name': $scope.bk.customPropertyName, 'value': $scope.bk.customPropertyValue, "type": "text", 'unit': '', 'value_choice': [], 'unit_choice': [], 'required': false});
        };

    }]);

Application.Directives.directive('adProperties',
    function () {
        return {
            restrict: "A",
            controller: "AddPropertyController",
            scope: {
                edit: "=",
                doc: '=',
                bk: "="
            },
            templateUrl: 'application/directives/added-properties.html'
        };
    });