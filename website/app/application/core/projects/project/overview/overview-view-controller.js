Application.Controllers.controller("projectOverviewView",
    ["$scope", "model.projects", "$stateParams", "mcapi","$filter","pubsub", projectOverviewView]);

function projectOverviewView($scope, Projects,$stateParams, mcapi, $filter, pubsub) {
    function init(){
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            console.dir($scope.project);
        });

    }
    init();
}
