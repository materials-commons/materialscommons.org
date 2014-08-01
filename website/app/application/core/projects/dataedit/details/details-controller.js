Application.Controllers.controller('projectsDataEditDetails',
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

            $scope.save = function () {
                mcapi('/datafile/update/%', $scope.doc.id)
                    .success(function (data) {
                        $scope.bk.edit_desc = false;
                    }).put($scope.doc);
            };

            $scope.editDescription = function () {
                $scope.bk.edit_desc = true
            };

            function init() {
                $scope.bk = {
                    edit_desc: false
                }
                $scope.id = $stateParams.data_id;
                $scope.modal = Projects.model;
                mcapi('/datafile/%', $stateParams.data_id)
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
            }

            init();
        }]);
