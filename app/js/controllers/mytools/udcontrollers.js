function UploadFileController($scope, $http, mcjsonp, User, formDataObject) {
    $scope.files = [];
    $scope.percentage = 0;

    mcjsonp('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        });

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
                var url = mcurl("/user/%/upload/%", User.u(), fileEntry.datagroup);
                fileEntry.status = "Uploading...";
                $http({
                    method: 'POST',
                    url: url,
                    headers: {'Content-Type': false},
                    data: { file: fileEntry.file},
                    transformRequest: formDataObject
                })
                    .success(function () {
                        fileEntry.status = "Uploaded";
                    })
                    .error(function () {
                        fileEntry.status = "Failed";
                    });
            }
        });
    };
}

function UploadDirectoryController($scope, mcjsonp, User) {
    $scope.files = [];
    $scope.percentage = 0;
    $scope.uploadurl = "notset";

    mcjsonp('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        })

}

function UpDownLoadQueueController($scope, mcjsonp, User) {
    mcjsonp('/user/%/udqueue', User.u())
        .success(function (data) {
            $scope.udentries = data;
        })
}
