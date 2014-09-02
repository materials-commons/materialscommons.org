Application.Controllers.controller('defaultStackDrop', ["$scope", defaultStackDrop]);

function defaultStackDrop($scope) {
    $scope.onDrop = function() {
        console.log("onDrop");
        return true;
    };
}
