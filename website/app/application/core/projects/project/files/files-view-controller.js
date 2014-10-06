Application.Controllers.controller("projectFileView",
    ["$scope", "model.projects", "$stateParams",  projectFileView]);

function projectFileView($scope, Projects,$stateParams) {
    function init(){
        console.log('inside files view');
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });

    }
    init();
}
