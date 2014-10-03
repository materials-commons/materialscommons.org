Application.Controllers.controller("projectSampleView",
    ["$scope", "model.projects", "$stateParams", "mcapi","$filter","pubsub", projectSampleView]);

function projectSampleView($scope, Projects,$stateParams, mcapi, $filter, pubsub) {

    pubsub.waitOn($scope, 'update-tab-count.change', function () {
        $scope.loadSampleTree();
    });
    $scope.sampleDetails = function(branch){
        mcapi('/objects/%', branch.id)
            .success(function (data) {
                $scope.details = data;
            }).jsonp();
    };

    $scope.createName = function(name) {
        if (name.length > 15) {
            return name.substring(0,12)+"...";
        }
        return name;
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
    $scope.loadSampleTree = function(){
        $scope.my_tree =  {};
        mcapi('/samples/%/tree', $scope.project.id)
            .success(function (data) {
                // Partial fix to sorting the samples. This only sorts the top level.
                $scope.tree_data = $filter('orderBy')(data, 'name');
                $scope.col_defs = [
                    { field: "path"},
                    { field: "owner"},
                    { field: "numofchildren"}
                ];
            }).jsonp();
    }
    function init(){
        $scope.details = '';
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            $scope.loadSampleTree();
        });

    }
    init();


}
