Application.Directives.directive('actionProjectProvenance', actionProjectProvenanceDirective);

function actionProjectProvenanceDirective() {
    return {
        controller: "actionProjectProvenanceController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-project-provenance.html"
    };
}

Application.Controllers.controller('actionProjectProvenanceController',
                                   ["$scope", "$stateParams", "mcapi", "$filter", actionProjectProvenanceController]);

function actionProjectProvenanceController ($scope, $stateParams,mcapi, $filter) {
    $scope.sampleDetails = function(branch){
        mcapi('/objects/%', branch.id)
            .success(function (data) {
                $scope.details = data;
            }).jsonp();

        mcapi('/processes/sample/%', branch.id)
            .success(function (data) {
                $scope.processes = data;
            }).jsonp();

    };

    $scope.processDetails = function(p_id){
        mcapi('/processes/%', p_id)
            .success(function (data) {
                $scope.process = [];
                $scope.process.push(data);
            })
            .error(function(e){
            }).jsonp();
    };

    function init() {
        $scope.project_id = $stateParams.id;
        $scope.my_tree =  {};
        mcapi('/samples/%/tree', $scope.project_id)
            .success(function (data) {
                // Partial fix to sorting the samples. This only sorts the top level.
                $scope.tree_data = $filter('orderBy')(data, 'name');
                $scope.col_defs = [
                    { field: "path"},
                    { field: "owner"},
                    { field: "level"}
                ];
            }).jsonp();
    }
    init();
}
