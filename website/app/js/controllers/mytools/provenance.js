
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