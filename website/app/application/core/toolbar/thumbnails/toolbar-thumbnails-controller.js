Application.Controllers.controller("toolbarThumbnails",
    ["$scope", "mcapi", "Thumbnails", Thumbnail,
        function ($scope, mcapi, Thumbnails, Thumbnail) {
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