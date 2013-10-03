function UploadFileController($scope, mcapi, User, formDataObject, $rootScope) {
    $scope.files = [];
    $scope.percentage = 0;

    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

    mcapi('/user/%/material_conditions', User.u())
        .success(function (data) {
            $rootScope.material_conditions = data;
        }).jsonp();

    mcapi('/user/%/equipment_conditions', User.u())
        .success(function (data) {
            $rootScope.equipment_conditions = data;
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

    $scope.update_file_entry = function (file, mc, ec) {
        $scope.files.forEach(function (fileEntry) {
            if (fileEntry.file.name == file) {
                if (mc) {
                    fileEntry.material_condition = mc;
                }
                if (ec) {
                    fileEntry.equipment_condition = ec;
                }
            }
        });
    }

    $scope.apply_to_all_files = function () {
        if ($scope.top_level_mc) {
            $scope.files.forEach(function (fileEntry) {
                fileEntry.material_condition = $scope.top_level_mc;
            });
        }
        if ($scope.top_level_ec) {
            $scope.files.forEach(function (fileEntry) {
                fileEntry.equipment_condition = $scope.top_level_ec;
            });
        }
    }

    $scope.uploadEachFile = function () {
        if ($scope.files.length == 0) {
            return;
        }
        $scope.files.forEach(function (fileEntry) {
            console.dir(fileEntry);
            if (fileEntry.status != "Uploaded") {
                fileEntry.status = "Uploading...";
                mcapi('/user/%/upload/%/mc/%/ec/%', User.u(), fileEntry.datagroup, fileEntry.material_condition.id, fileEntry.equipment_condition.id)
                    .success(function () {
                        fileEntry.status = "Uploaded";
                    })
                    .error(function () {
                        fileEntry.status = "Failed";
                    })
                    .post({file: fileEntry.file}, {headers: {'Content-Type': false}, transformRequest: formDataObject});
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
