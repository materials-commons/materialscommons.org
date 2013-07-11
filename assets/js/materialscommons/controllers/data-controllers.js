function DataEditController($scope, $routeParams, $location, $window, Mcdb) {

    $scope.mcdb = Mcdb.db();
    $scope.doc = Mcdb.db().getDoc($routeParams.id);

    $scope.removeTag = function (index) {
        $scope.doc.tags.splice(index, 1);
    }

    $scope.createNewTag = function(term) {
       console.log("createNewTag called:" + term);
    }

    $scope.addTag = function() {
        if (! _.contains($scope.doc.tags, $scope.tag_to_add)) {
            $scope.doc.tags.push($scope.tag_to_add);
        }
    }

    $scope.tagchoices = new Array();
    $scope.mcdb.query("materialscommons-app", "tags_by_count", {group_level: 1}).success(function (data) {
        data.rows.forEach(function(kv) {
           $scope.tagchoices.push(kv.key[0]);
        });
    });

    $scope.saveData = function () {
        $scope.doc.save().error(function (data, status) {
            // Do something here.
            alert("Unable to save");
        });
        $window.history.back();
    }

    $scope.cancel = function () {
        $window.history.back();
    }

    $scope.keypressCallback = function(event) {
        if (!_.contains($scope.tagchoices, $scope.new_tag))
        {
            $scope.tagchoices.push($scope.new_tag);
        }

        $scope.tag_to_add  = $scope.new_tag;
        $scope.addTag();
        $scope.new_tag = "";
    }
}