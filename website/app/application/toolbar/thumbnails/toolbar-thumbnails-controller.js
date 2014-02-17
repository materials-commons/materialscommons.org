Application.Controllers.controller("toolbarThumbnails",
    ["$scope", "mcapi", "Thumbnail", "Thumbnails",
        function ($scope, mcapi, Thumbnail, Thumbnails) {
            $scope.init = function() {
                $scope.model = Thumbnails.model;
                if ($scope.model.datadir.length === 0) {
                    mcapi('/datadirs')
                        .success(function (data) {
                            $scope.model.datadirs = data;
                        }).jsonp();
                }
            };

            $scope.init();

            $scope.display_images = function () {
                mcapi('/datafile/ids/%', $scope.model.datadir.id)
                    .success(function (datafiles) {
                        $scope.datafiles = datafiles;
                        if (Thumbnail.fetch_images($scope.datafiles)) {
                            $scope.model.pics = Thumbnail.fetch_images($scope.datafiles);
                        }

                    })
                    .error(function () {
                    }).jsonp();
            };

        }]);