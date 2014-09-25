Application.Controllers.controller("projectSampleView",
    ["$scope", "model.projects", "$stateParams", "mcapi","$filter","pubsub", projectSampleView]);

function projectSampleView($scope, Projects,$stateParams, mcapi, $filter, pubsub) {

    $scope.sampleDetails = function(branch){
        mcapi('/objects/%', branch.id)
            .success(function (data) {
                $scope.details = data;
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

    function init(){
        $scope.details = '';
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            $scope.my_tree =  {};
            mcapi('/samples/%/tree', $scope.project.id)
                .success(function (data) {
                    // Partial fix to sorting the samples. This only sorts the top level.
                    $scope.tree_data = $filter('orderBy')(data, 'name');
                    $scope.col_defs = [
                        { field: "path"},
                        { field: "owner"},
                        { field: "level"}
                    ];
                }).jsonp();
        });

    }
    init();


}
