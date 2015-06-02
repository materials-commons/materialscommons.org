Application.Controllers.controller('ProcessCreateController',
    ["$scope", "project", "$state", "Template", "$modal", "pubsub",ProcessCreateController]);

function ProcessCreateController($scope, project, $state, Template, $modal, pubsub) {
    $state.go('projects.project.processes.create');

    $scope.template = Template.getActiveTemplate();

    $scope.modal = {
        instance: null,
        items: ''
    };
    $scope.model = {
        process_info: {name: '', description: ''},
        measurements: [],
        samples: {},
        attachments: []
    };

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment(sample);
    });

    pubsub.waitOn($scope, 'addProcessToReview', function (process) {
        addAttachment(process);
    });

    pubsub.waitOn($scope, 'addFileToReview', function (file) {
        addAttachment(file);
    });

    function addAttachment(item) {
        var i = _.indexOf($scope.model.attachments, function (entry) {
            return item.id === entry.id;
        });
        if (i < 0) {
            $scope.model.attachments.push(item);
        } else {
            $scope.model.attachments.splice(i, 1);
        }
    }

    $scope.open = function (size) {
        $scope.modal.instance = $modal.open({
            templateUrl: 'application/core/projects/project/reviews/myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                modal: function () {
                    return $scope.modal;
                },
                project: function () {
                    return $scope.project;
                }
            }
        });
    };
}
