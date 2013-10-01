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
            //obj.mc_name = $scope.mc_name;
            $scope.files.push(obj);
        });
    }

    $scope.update_file_entry = function (file, mc_name, ec_name) {
        $scope.files.forEach(function (fileEntry) {
            if (fileEntry.file.name == file) {
                if (mc_name) {
                    fileEntry.mc_name = mc_name.name;
                }
                if (ec_name) {
                    fileEntry.ec_name = ec_name.name;
                }
            }
        });
    }

    $scope.apply_all = function () {
        if ($scope.mc_name) {
            $rootScope.mc_name = $scope.mc_name.name
            $scope.files.forEach(function (fileEntry) {
                fileEntry.mc_name = $rootScope.mc_name;
            });
        }
        if ($scope.ec_name) {
            $rootScope.ec_name = $scope.ec_name.name
            $scope.files.forEach(function (fileEntry) {
                fileEntry.ec_name = $rootScope.ec_name;
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
                mcapi('/user/%/upload/%/mc_name/%/ec_name/%', User.u(), fileEntry.datagroup, fileEntry.mc_name, fileEntry.ec_name)
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
