function MyDataListController($scope, $routeParams, $location, cornercouch) {
    $scope.email="gtarcea@umich.edu";
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "data_by_user", {key: $scope.email});

    $scope.editData = function(id) {
        /*
         ** TODO: How to edit an item
         **
         **    What happens when a change is made to data that is associated with
         **    an experiment that the user doesn't own?
         */
        $location.path("/mylab/mydata/edit-data/" + id);
    }

    $scope.removeData = function(id) {
        /*
         ** TODO: How to remove an item -
         **    Do we remove the item from all the experiments? Should show the user
         **    the impact of removing the item, and then give them the option to remove
         **    from experiments they own.
         **
         **    What happens when the data is associated with an experiment that a user
         **    doesn't own?
         */
    }
}

function MyDataCreateEditController($scope, $routeParams, $location, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.dataitem = $scope.mcdb.getDoc($routeParams.id);

    $scope.editAttachment = function(id) {

    }

    $scope.removeAttachment = function(index) {

    }

    $scope.editExperiment = function(id) {
        $location.path("/mylab/myexperiments/edit-experiment/" + id);
    }

    $scope.removeExperiment = function(index) {

    }
}

function MyDataAddController($scope, $routeParams, $location, cornercouch) {
    $scope.list1 = {title: 'Drag me!'};
    $scope.list2 = {};
}