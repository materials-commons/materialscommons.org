
function UploadFileController($scope, $rootScope, $http, User, uploadManager) {
    $scope.files = [];
    $scope.percentage = 0;

    $scope.uploadurl = "notset";

    $http.jsonp(mcurljsonp('/user/%/datagroups', User.u()))
        .success(function(data) {
            $scope.datagroups = data;
        })

    $scope.upload = function () {
        $scope.uploadurl = mcurl('/user/%/upload/%', User.u(), $scope.datagroup);
        console.log($scope.uploadurl);
        console.dir(uploadManager.getFiles());
        var fd = new FormData();
        fd.append("uploadedFile", uploadManager.getFiles()[0]);
        $http.post($scope.uploadurl, fd)
            .success(function() {
               console.log("uploaded!!");
            });
        //uploadManager.upload();
        $scope.files = [];
    };

    $rootScope.$on('fileAdded', function (e, call) {
        $scope.files.push(call);
        $scope.$apply();
    });

    $rootScope.$on('uploadProgress', function (e, call) {
        $scope.percentage = call;
        $scope.$apply();
    });

}

function UploadDirectoryController($scope, $http, User) {
    $scope.files = [];
    $scope.percentage = 0;

    $scope.uploadurl = "notset";

    $http.jsonp(mcurljsonp('/user/%/datagroups', User.u()))
        .success(function(data) {
            $scope.datagroups = data;
        })

}

function UpDownLoadQueueController($scope, $http, User) {
    $http.jsonp(mcurljsonp('/user/%/udqueue', User.u()))
        .success(function(data) {
            $scope.udentries = data;
        })
}