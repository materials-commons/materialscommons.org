function DataGroupGridController($scope, mcapi, User, Thumbnail){

    $scope.layout = 'grid';
    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

    $scope.display_images = function(){
        $scope.pics = {};
        mcapi('/user/%/datafile/ids/%', User.u(), $scope.datagroup.id)
            .success(function (datafiles) {
                $scope.datafiles = datafiles;
                if (Thumbnail.fetch_images($scope.datafiles)){
                    $scope.pics =  Thumbnail.fetch_images($scope.datafiles);
                }

            })
            .error(function () {
            }).jsonp();
    }

}


