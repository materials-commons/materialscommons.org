Application.Controllers.controller('toolbarProjectsPageOverviewProvenance',
    ["$scope", "$stateParams", "mcapi", function ($scope, $stateParams,mcapi) {
        $scope.test1 = function(branch){
            mcapi('/objects/%', branch.id)
                .success(function (data) {
                    $scope.details = data;
                }).jsonp();

        }

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