Application.Controllers.controller('projectCreatetReview',
    ["$scope", "project", "User", "pubsub", projectCreatetReview]);

function projectCreatetReview($scope, project, User, pubsub) {

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment({'id': sample.id, 'name': sample.name, 'type': 'sample'});
    });
    pubsub.waitOn($scope, 'addProcessToReview', function (provenance) {
        addAttachment({'id': provenance.id, 'name': provenance.name, 'type': 'process'});
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
            $scope.model.attachments.splice(i, 1);
        }
    }
}

