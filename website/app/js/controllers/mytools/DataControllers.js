function DataEditController($scope, $window, mcapi, alertService, $stateParams, pubsub, User) {
    $scope.count = 0;
    $scope.grid_options = [];
    $scope.id = $stateParams.id;

    $scope.setupAccessToUserFile = function () {
        if (isImage($scope.doc.name)) {
            $scope.fileType = "image";
        } else {
            $scope.fileType = "other";
        }
        $scope.fileSrc = "datafiles/static/" + $scope.doc.id+"?apikey=" + User.apikey();
        $scope.originalFileSrc = "datafiles/static/" + $scope.doc.id+"?apikey=" + User.apikey();
        $scope.fileName = $scope.doc.name;
    }

    mcapi('/datafile/%', $scope.id)
        .success(function (data) {
            $scope.doc = data;
            $scope.setupAccessToUserFile();
        })
        .error(function (data) {
            alertService.sendMessage(data.error);
        }).jsonp();

    $scope.tagchoices = new Array();
    $scope.originalTags = [];
    mcapi('/tags')
        .success(function (data) {
            data.forEach(function (item) {
                $scope.tagchoices.push(item.id);
                $scope.originalTags.push(item.id);
            })
        }).jsonp();

    $scope.removeTag = function (index) {
        $scope.doc.tags.splice(index, 1);
    }

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
        if (!_.contains($scope.tagchoices, $scope.new_tag)) {
            $scope.tagchoices.push($scope.new_tag);
        }

        $scope.tag_to_add = $scope.new_tag;
        $scope.addTag();
        $scope.new_tag = "";
    }

    $scope.addNoteKeypressCallback = function (event) {
        $scope.doc.notes.push($scope.new_note);
        $scope.new_note = "";
    }
    $scope.add_notes = function () {
        $scope.doc.notes.push($scope.new_note);
        $scope.new_note = "";
    }


}

function MyDataController($scope, mcapi, $location) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    mcapi('/datafiles')
        .success(function (data) {
            $scope.data_by_user = data;
        }).jsonp();

    $scope.dgroupid = "";

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            mcapi('/datadirs/%', datagroupId)
                .success(function (data) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                }).jsonp();
        }
    }
}