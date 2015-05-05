Application.Controllers.controller('projectCreatetReview',
    ["$scope", "project", "User", "pubsub", "$modal", "$log" ,projectCreatetReview]);

function projectCreatetReview($scope, project, User, pubsub,$modal, $log) {

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment({'id': sample.id, 'name': sample.name, 'type': 'sample'});
    });
    pubsub.waitOn($scope, 'addProcessToReview', function (process) {
        addAttachment({'id': process.id, 'name': process.name, 'type': 'process'});
    });
    pubsub.waitOn($scope, 'addFileToReview', function (file) {
        addAttachment({'id': file.id, 'name': file.name, 'type': 'file', 'path': file.fullname});
    });
    $scope.project = project;
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.model = {
        title: "",
        comment: '',
        assigned_to: [],
        attachments: []
    };
    $scope.addUser = function () {
        $scope.model.assigned_to.push($scope.selectedUser);
    };

    $scope.removeUser = function (user) {
        var i = _.indexOf($scope.model.assigned_to, user);
        $scope.model.assigned_to.splice(i, 1);
    };

    function addAttachment(item) {
        var i = _.indexOf($scope.model.attachments, function (entry) {
            return item.id === entry.id;
        });
        if (i === -1) {
            $scope.model.attachments.push(item);
        } else{

            //$scope.model.attachments.splice(i, 1);
        }
    }

    $scope.modal = {
        instance: null,
        items: ['item1', 'item2', 'item3']
    };

    $scope.open = function (size) {
        $scope.modal.instance = $modal.open({
            template: '<div modal-instance modal="modal" project="project">',
            scope: $scope,
            size: size
        });

    };
}
