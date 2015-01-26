Application.Controllers.controller("sideboardController",
                                  ["$scope", sideboardController]);
function sideboardController($scope) {
    $scope.sideboard = [];

    function itemIndex(item) {
        var i = _.indexOf($scope.sideboard, function(sideboardItem) {
            return item.id === sideboardItem.id;
        });
        return i;
    }

    $scope.onDrop = function(ignore, item) {
        var i = itemIndex(item);

        // If item is already in list then don't add it again.
        if (i === -1) {
            $scope.sideboard.push(item);
        }
    };

    $scope.removeFromSideboard = function(item) {
        var i = itemIndex(item);
        if (i !== -1) {
            $scope.sideboard.splice(i, 1);
        }
    };
}
