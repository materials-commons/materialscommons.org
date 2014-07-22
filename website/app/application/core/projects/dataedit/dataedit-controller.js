Application.Controllers.controller('projectsDataEdit',
    ["$scope", "$window", "mcapi", "alertService", "$state", "$stateParams", "pubsub", "User", "ProjectPath", "Projects",
        function ($scope, $window, mcapi, alertService, $state, $stateParams, pubsub, User, ProjectPath, Projects) {

            $scope.setupAccessToUserFile = function () {
                if (isImage($scope.doc.name)) {
                    $scope.fileType = "image";
                } else {
                    $scope.fileType = "other";
                }
                $scope.fileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey();
                $scope.originalFileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey() + "&download=true";
                $scope.fileName = $scope.doc.name;
            };

            $scope.showTab = function (tab) {
                switch (tab) {
                    case "details":
                        $state.go('projects.dataedit.details', {'data_id': $scope.doc.id});
                        break;
                    case "provenance":
                        $state.go('projects.dataedit.provenance');
                        break;
                    case "reviews":
                        $state.go('projects.dataedit.reviews');
                        break;
                    case "notes":
                        $state.go('projects.dataedit.notes');
                        break;
                }
            };

            $scope.backToFolder = function (item) {
                $scope.dir = ProjectPath.update_dir(item);
                var proj_id = ProjectPath.get_project();
                $state.go("projects.overview", {id: proj_id, draft_id: '', from: 'datafile'});
            };

            $scope.pullDirectoryPath = function(){
                mcapi('/datafile/%', $stateParams.data_id)
                    .success(function (data) {
                        $scope.datafile = data;
                        $scope.datafile.datadirs.forEach(function(id){
                            mcapi('/datadir/%', id)
                                .success(function (data) {
                                    $scope.file_path.push(data.name);
                                }).jsonp();
                        });
                    }).jsonp();

            };

            function init() {
                $scope.model = {
                    is_disabled: true,
                    desc: ''
                };
                $scope.file_path = [];
                $scope.id = $stateParams.data_id;
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                        $scope.model.desc = $scope.doc.description;
                        $scope.setupAccessToUserFile();
                        $scope.trail = ProjectPath.get_trail();
                        $scope.dir = ProjectPath.get_dir();
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();

                if($stateParams.file_path === 'global'){
                    $scope.pullDirectoryPath();

                }
            }

            init();
        }]);
