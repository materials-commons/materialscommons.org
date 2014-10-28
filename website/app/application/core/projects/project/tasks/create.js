Application.Controllers.controller('projectTasksCreate',
    ["$scope", "User", "toastr", "projectState",
        "$stateParams", "project", "recent", projectTasksCreate]);

function projectTasksCreate($scope, User, toastr, projectState,
                            $stateParams, project, recent) {
    var projectID = project.id;
    var stateID = $stateParams.sid;


    function initializeState() {
        var defaultModel = {
            title: "",
            note: ""
        };
        $scope.model = projectState.getset(projectID, stateID, defaultModel);
        recent.addIfNotExists(projectID, stateID, "New Task");
    }

    function saveTask() {
        project.put(User.keyparam()).then(function(task) {
            recent.gotoLast(projectID);
            recent.delete(projectID, stateID);
            projectState.delete(projectID, stateID);
        }, function(reason){
            toastr.error(reason.data.error, 'Error', {
                closeButton: true
            });
        });
    }

    $scope.cancel = function() {
        recent.delete(projectID, stateID);
        projectState.delete(projectID, stateID);
        recent.gotoLast(projectID);
    };

    $scope.create = function () {
        project.todos.push({
            'title': $scope.model.title,
            'note': $scope.model.note,
            'date': new Date()
        });
        saveTask();
    };

    function init(){
        initializeState();
    }
    init();
}
