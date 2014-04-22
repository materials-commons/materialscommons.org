Application.Controllers.controller('toolbarProcessTag',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub) {
            $scope.removeTag = function (id) {
                mcapi('/tag/%', id)
                    .success(function (data) {
                        var index = -1;
                        for (var i = 0; i < $scope.process_tags.length; i++)
                            if ($scope.process_tags[i].id === data.id) {
                                index = i;
                                $scope.process_tags.splice(index, 1);
                                pubsub.send('tags.change');
                            }
                    })
                    .error(function (e) {
                    }).delete();
            };

            $scope.addNewTag = function (item_id, item_type) {
                var tagObj = {};
                tagObj.id = $scope.tag_model.new_tag;
                if ($scope.tag_model.new_tag.length !== 0) {
                    if (!_.contains($scope.tagchoices, $scope.tag_model.new_tag)) {
                        $scope.tagchoices.push($scope.tag_model.new_tag);
                        mcapi('/tag/%/%', item_type, item_id)
                            .success(function (new_tag) {
                                $scope.process_tags.push(new_tag);
                                $scope.msg = "Data has been tagged !";
                                pubsub.send('tags.change');
                                alertService.sendMessage($scope.msg);
                            })
                            .error(function (data) {
                                alertService.sendMessage(data.error);
                            }).post(tagObj);
                    }
                }
            };

            $scope.addExistingTag = function (item_id, item_type) {
                var tagObj = {};
                tagObj.id = $scope.tag_model.tag_to_add;
                if ($scope.tag_model.tag_to_add.length !== 0) {
                    mcapi('/tag/%/%', item_type, item_id)
                        .success(function (new_tag) {
                            $scope.process_tags.push(new_tag);
                            $scope.msg = "Data has been tagged !";
                            pubsub.send('tags.change');
                            alertService.sendMessage($scope.msg);
                        })
                        .error(function (data) {
                            alertService.sendMessage(data.error);
                        }).post(tagObj);
                }
            };

            $scope.init = function () {
                $scope.id = $stateParams.id;
                $scope.tag_model = {
                    new_tag: "",
                    tag_to_add: {}
                };
                $scope.tagchoices = [];

                mcapi('/processes/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
                mcapi('/tags')
                    .success(function (data) {
                        data.forEach(function (item) {
                            $scope.tagchoices.push(item.id);
                        });
                    }).jsonp();

                mcapi('/tags/list/%/%', 'process', $scope.id)
                    .success(function (data) {
                        $scope.process_tags = data;
                    }).jsonp();
            };
            $scope.init();

        }]);