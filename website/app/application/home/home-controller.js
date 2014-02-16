Application.Controllers.controller('home', ['$scope', 'mcapi', function ($scope, mcapi) {
    mcapi('/news')
        .success(function (data) {
            $scope.news = data;
        }).jsonp();
}]);