function DataGroupGridController($scope, mcapi, Thumbnail){

    $scope.layout = 'grid';
    mcapi('/datadirs')
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();

    $scope.display_images = function(){
        $scope.pics = {};
        mcapi('/datafile/ids/%', $scope.datagroup.id)
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


