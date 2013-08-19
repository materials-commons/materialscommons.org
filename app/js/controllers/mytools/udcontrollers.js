function UploadFileController($scope, $http, User, $rootScope, formDataObject) {
    $scope.files = [];
    $scope.percentage = 0;

    $http.jsonp(mcurljsonp('/user/%/datadirs', User.u()))
        .success(function (data) {
            $scope.datagroups = data;
        });

    $scope.addFile = function (element) {
        //$scope.files.push(element.files[0]);
        console.log("addFile");
        console.dir(element.files[0]);
        $scope.$apply(function () {
            var obj = {};
            obj.file = element.files[0];
            obj.status = "Ready";
            obj.datagroup = $scope.datagroup;
            $scope.files.push(obj);
        });
    }

    $scope.uploadEachFile = function () {
        if ($scope.files.length == 0) {
            return;
        }

        //var url = "http://magnesium.eecs.umich.edu:5000/v1.0/user/mcfada@umich.edu/upload/abc123";
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

function UploadDirectoryController($scope, $http, User) {
    $scope.files = [];
    $scope.percentage = 0;

    $scope.uploadurl = "notset";

    $http.jsonp(mcurljsonp('/user/%/datadirs', User.u()))
        .success(function (data) {
            $scope.datagroups = data;
        })

}

function UpDownLoadQueueController($scope, $http, User) {
    $http.jsonp(mcurljsonp('/user/%/udqueue', User.u()))
        .success(function (data) {
            $scope.udentries = data;
        })
}
