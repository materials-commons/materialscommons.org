function DraftsCountController($scope, User, pubsub, Stater) {
    pubsub.waitOn($scope, 'drafts.change', function() {
        $scope.drafts = Stater.all;
    });

    pubsub.waitOn($scope, 'drafts.update', function() {
        Stater.retrieveAll(User.u(), function() {
            pubsub.send('drafts.change', '');
        })
    })

    $scope.drafts = Stater.all;

    $scope.retrieveDrafts = function() {
        Stater.retrieveAll(User.u(), function() {
            $scope.drafts = Stater.all;
        });
    }

    $scope.retrieveDrafts();
}

function DraftsListController($scope, pubsub, Stater) {
    pubsub.waitOn($scope, 'drafts.change', function() {
        $scope.drafts = Stater.all;
    });

    $scope.drafts = Stater.all;

    $scope.delete = function(stateId) {
        Stater.clearRemote(stateId, function() {
            pubsub.send('drafts.update', '');
        })
    }
}