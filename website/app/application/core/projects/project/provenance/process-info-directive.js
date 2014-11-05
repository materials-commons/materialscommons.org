Application.Directives.directive('processInfo', processInfoDirective);

function processInfoDirective() {
    return {
        scope: {
            process: "="
        },
        controller: "processInfoController",
        restrict: "A",
        templateUrl: "application/core/projects/project/provenance/process-information.html"
    };
}

Application.Controllers.controller("processInfoController",
    ["$scope", "mcapi", processInfoController]);

function processInfoController($scope, mcapi) {

    $scope.createName = function (name) {
        if (name.length > 25) {
            return name.substring(0, 22) + "...";
        }
        return name;
    };

    $scope.expand = function (df) {
        $scope.flag = false;
        $scope.active = df.id;
        $scope.datafile = df;
    };

    $scope.isActiveList = function (k) {
        return k === $scope.active;
    };

    $scope.showDetails = function (key, values) {
        $scope.flag = true;
        $scope.active = key;
        if (key === 'sample') {
            $scope.settings = [];
            mcapi('/objects/%', values[0].value)
                .success(function (data) {
                    $scope.sample = data.sample;
                }).jsonp();
        } else {
            $scope.key = key;
            $scope.settings = values;
        }
    };
    $scope.showInputsOutputs = true;
}
