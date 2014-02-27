Application.Controllers.controller('toolbarGlobalTagCloud',
    ["$scope", "mcapi", function ($scope, mcapi) {
        $scope.cloudtype = "Global";
        mcapi('/tags/count')
            .success(function (data) {
                $scope.word_list = [];
                angular.forEach(data, function (tag) {
                    $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/toolbar/databytag/" + tag.name});
                });
            }).jsonp();
    }]);