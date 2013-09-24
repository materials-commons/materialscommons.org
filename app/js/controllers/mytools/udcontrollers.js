function UploadFileController($scope, mcapi, User, formDataObject, $rootScope) {
    $scope.files = [];
    $scope.percentage = 0;

    $scope.apply_all = function(){
        if ($scope.mc_order_prop){
            $rootScope.mc_orderProp = $scope.mc_orderProp.name
        }
        if ($scope.eq_order_prop){
            $rootScope.eq_orderProp = $scope.eq_orderProp.name
        }
    }

    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

    mcapi('/user/%/material_conditions', User.u())
        .success(function (data) {
            $scope.material_conditions = data;

        }).jsonp();

    mcapi('/user/%/equipment_conditions', User.u())
        .success(function (data) {
            $scope.equipment_conditions = data;
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



    $scope.uploadEachFile = function () {
        if ($scope.files.length == 0) {
            return;
        }

        $scope.files.forEach(function (fileEntry) {
            console.log('file entry ob j is '+ fileEntry.status);
            if (fileEntry.status != "Uploaded") {
                fileEntry.status = "Uploading...";
                mcapi('/user/%/upload/%', User.u(), fileEntry.datagroup)
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
