Application.Controllers.controller('_toolbarDataEditCreateTag',
    ["$scope", "mcapi", "User", "$stateParams", "alertService",
        function ($scope, mcapi, User, $stateParams, alertService) {
            $scope.removeTag = function (index) {
                $scope.doc.tags.splice(index, 1);
            };

            $scope.addTag = function () {
                if (!$scope.doc.tags) {
                    $scope.doc.tags = [];
                }

                if (!_.contains($scope.doc.tags, $scope.tag_to_add)) {
                    $scope.doc.tags.push($scope.tag_to_add);
                    $scope.msg = "Data has been tagged !";
                    alertService.sendMessage($scope.msg);
                }
            };

            $scope.addNewTags = function () {
                var newtags = _.difference($scope.tagchoices, $scope.originalTags), tagObj = {};
                newtags.forEach(function (item) {
                    tagObj.id = item;
                    mcapi('/tag')
                        .success(function (data) {

                        })
                        .error(function (data) {
                            alertService.sendMessage(data.error);
                        }).post(tagObj);
                });
            };

            $scope.addTagKeypressCallback = function (event) {
                if ($scope.new_tag.length !== 0) {
                    if (!_.contains($scope.tagchoices, $scope.new_tag)) {
                        $scope.tagchoices.push($scope.new_tag);
                    }

                    $scope.tag_to_add = $scope.new_tag;
                    $scope.addTag();
                    $scope.new_tag = "";
                }
            };

            $scope.addNewTag = function (item_id, item_type) {
                var tagObj = {};
                tagObj.id = $scope.tag_model.new_tag;
                if ($scope.tag_model.new_tag.length !== 0) {
                    if (!_.contains($scope.tagchoices, $scope.tag_model.new_tag)) {
                        $scope.tagchoices.push($scope.tag_model.new_tag);
                        mcapi('/tag/%/%', item_type, item_id)
                            .success(function (data) {
                                $scope.msg = "Data has been tagged !";
                                alertService.sendMessage($scope.msg);
                            })
                            .error(function (data) {
                                alertService.sendMessage(data.error);
                            }).post(tagObj);
                    }
                }
            };

            $scope.init = function () {
                console.log($scope.doc)
                $scope.tag_model = {
                    new_tag: "",
                    tag_to_add: {}
                };
                $scope.tagchoices = [];
                $scope.originalTags = [];
                mcapi('/tags')
                    .success(function (data) {
                        data.forEach(function (item) {
                            $scope.tagchoices.push(item.id);
                            $scope.originalTags.push(item.id);
                        });
                    }).jsonp();
                mcapi('/tags/%/%', 'datafile', $scope.doc.id)
                    .success(function (data) {
                        console.log(data)
                        $scope.datafile_tags = data;
                    }).jsonp();
            };
            $scope.init();

        }]);