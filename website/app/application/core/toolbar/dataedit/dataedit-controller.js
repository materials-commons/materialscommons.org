Application.Controllers.controller('toolbarDataEdit',
    ["$scope", "$window", "mcapi", "alertService", "$stateParams", "pubsub", "User", "dateGenerate", "watcher",
        function ($scope, $window, mcapi, alertService, $stateParams, pubsub, User, dateGenerate, watcher) {

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

            $scope.removeTag = function (index) {
                $scope.doc.tags.splice(index, 1);
            };

            $scope.addTag = function () {
                if (!$scope.doc.tags) {
                    $scope.doc.tags = new Array();
                }

                if (!_.contains($scope.doc.tags, $scope.tag_to_add)) {
                    $scope.doc.tags.push($scope.tag_to_add);
                    $scope.msg = "Data has been tagged !"
                    alertService.sendMessage($scope.msg);
                }
            }

            $scope.saveData = function () {
                mcapi('/datafile/update/%', $scope.doc.id)
                    .success(function (data) {
                        $scope.addNewTags();
                        $scope.msg = "Data has been saved"
                        alertService.sendMessage($scope.msg);
                        pubsub.send('tags.change', '')
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);

                $window.history.back();
            }

            $scope.addNewTags = function () {
                var newtags = _.difference($scope.tagchoices, $scope.originalTags);
                var tagObj = {};
                newtags.forEach(function (item) {
                    tagObj.id = item;
                    mcapi('/tag')
                        .success(function (data) {

                        })
                        .error(function (data) {
                            alertService.sendMessage(data.error);
                        }).post(tagObj);
                });
            }

            $scope.cancel = function () {
                $window.history.back();
            }

            $scope.addTagKeypressCallback = function (event) {
                if ($scope.new_tag.length != 0) {
                    if (!_.contains($scope.tagchoices, $scope.new_tag)) {
                        $scope.tagchoices.push($scope.new_tag);
                    }

                    $scope.tag_to_add = $scope.new_tag;
                    $scope.addTag();
                    $scope.new_tag = "";
                }
            }

            $scope.add_notes = function () {
                $scope.doc.notes.push({'message': $scope.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.new_note = "";
            }

            watcher.watch($scope, 'selected_input_process', function(){
                $scope.show_process(JSON.parse($scope.selected_input_process));
            })

            $scope.show_process = function (p) {
                $scope.process = p
                $scope.show_pr = true;
                $scope.input_files = $scope.process.input_files;
                $scope.output_files = $scope.process.output_files;
                if (p.input_conditions.length != 0) {
                    mcapi('/processes/extract/%/%', p.id, "input_conditions")
                        .success(function (data) {
                            $scope.ip_conditions = data;
                        })
                        .error(function (e) {

                        }).jsonp()
                }
                if (p.output_conditions.length != 0) {
                    mcapi('/processes/extract/%/%', p.id, "output_conditions")
                        .success(function (data) {
                            $scope.op_conditions = data;
                        })
                        .error(function (e) {

                        }).jsonp()
                }
            }

            $scope.get_mode_condition = function (cond) {
                $scope.display_condition = cond;
            }

            $scope.init = function () {
                $scope.tagchoices = [];
                $scope.originalTags = [];
                $scope.id = $stateParams.id;

                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                        $scope.setupAccessToUserFile();
                        mcapi('/datadirs/%/datafile', $scope.doc.id)
                            .success(function (data) {
                                $scope.trail = data[0].name.split('/')
                            })
                            .error(function (e) {

                            }).jsonp();
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();

                mcapi('/tags')
                    .success(function (data) {
                        data.forEach(function (item) {
                            $scope.tagchoices.push(item.id);
                            $scope.originalTags.push(item.id);
                        })
                    }).jsonp();

                mcapi('/processes/output/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.output_process = data;
                    }).jsonp()

                mcapi('/processes/input/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.input_processes = data;
                    }).jsonp()

            }
            $scope.init();
        }]);
