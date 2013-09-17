function UploadFileController($scope, $http, mcapi, User, formDataObject) {
    $scope.files = [];
    $scope.percentage = 0;

    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

    $scope.addFile = function (element) {
        $scope.$apply(function () {
            var obj = {};
            obj.file = element.files[0];
            obj.status = "Ready";
            obj.datagroup = $scope.datagroup;
            $scope.files.push(obj);
        });
    }

    $scope.uploadEachFile = function (mp, ep) {
        if ($scope.files.length == 0) {
            return;
        }

        $scope.files.forEach(function (fileEntry) {
            if (fileEntry.status != "Uploaded") {
                fileEntry.status = "Uploading...";
                mcapi('/user/%/upload/%', User.u(), fileEntry.datagroup)
                    .success(function() { fileEntry.status = "Uploaded"; })
                    .error(function() { fileEntry.status = "Failed"; })
                    .post({file: fileEntry.file}, {headers:{'Content-Type': false}, transformRequest:formDataObject});
            }
        });
    };
}

function UploadDirectoryController($scope, mcapi, User) {
    $scope.files = [];
    $scope.percentage = 0;
    $scope.uploadurl = "notset";

    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

}

function UpDownLoadQueueController($scope, mcapi, User) {
    mcapi('/user/%/udqueue', User.u())
        .success(function (data) {
            $scope.udentries = data;
        }).jsonp();
}
