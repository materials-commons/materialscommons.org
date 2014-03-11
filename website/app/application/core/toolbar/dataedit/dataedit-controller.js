Application.Controllers.controller('toolbarDataEdit',
    ["$scope", "$window", "mcapi", "alertService", "$state", "$stateParams", "pubsub", "User", "dateGenerate",
        function ($scope, $window, mcapi, alertService, $state, $stateParams, pubsub, User, dateGenerate) {
            $scope.model = {
                new_note: '',
                is_disabled: true
            };

            $scope.setupAccessToUserFile = function () {
                if (isImage($scope.doc.name)) {
                    $scope.fileType = "image";
                } else {
                    $scope.fileType = "other";
                }
                $scope.fileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey();
                $scope.originalFileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey();
                $scope.fileName = $scope.doc.name;
            };

            $scope.saveData = function () {
                mcapi('/datafile/update/%', $scope.doc.id)
                    .success(function (data) {
                        $scope.model.is_disabled = true;
                        $scope.msg = "Data has been saved";
                        alertService.sendMessage($scope.msg);
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
                //$window.history.back();
            };

            $scope.cancel = function () {
                $scope.model.is_disabled = true;
            };

            $scope.add_notes = function () {
                $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.saveData();
                $scope.model.new_note = "";
            };

            $scope.showtab = function (tab) {
                switch (tab) {
                    case "reviews":
                        $state.go('toolbar.dataedit.reviews');
                        break;
                    case "tags":
                        $state.go('toolbar.dataedit.tags');
                        break;
                    case "notes":
                        $state.go('toolbar.dataedit.notes');
                        break;
                    case "provenance":
                        $state.go('toolbar.dataedit.provenance');
                        break;
                }
            };

            $scope.edit_details = function () {
                $scope.model.is_disabled = false;
            };

            $scope.init = function () {
                $scope.id = $stateParams.id;
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                        $scope.setupAccessToUserFile();
                        mcapi('/datadirs/%/datafile', $scope.doc.id)
                            .success(function (data) {
                                $scope.trail = data[0].name.split('/');
                            }).jsonp();
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();
            };
            $scope.init();
        }]);
