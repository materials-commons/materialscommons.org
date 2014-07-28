Application.Controllers.controller('projectsOverviewProvenance',
    ["$scope", "$stateParams", "mcapi", function ($scope, $stateParams,mcapi) {
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
                    $scope.tree_data = data;
                    $scope.col_defs = [
                        { field: "path"},
                        { field: "owner"},
                        {field: "level"}
                    ];
                }).jsonp();
        }
        init();
    }]);
