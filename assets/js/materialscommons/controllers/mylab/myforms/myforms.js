function MyFormsListController($scope, $routeParams, $location, cornercouch) {
    $scope.user = "gtarcea@umich.edu";
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "form_by_user", {key: $scope.user});

    $scope.editForm = function(id) {
        console.log("editForm");
        /*
         ** TODO: How to edit an item
         **
         **    What happens when a change is made to data that is associated with
         **    an experiment that the user doesn't own?
         */
        $location.path("/mylab/myforms/edit-form/" + id);
    }

    $scope.removeForm = function(index) {
        console.log("removeForm");
        var id = $scope.mcdb.rows[index].value._id;
        var rev = $scope.mcdb.rows[index].value._rev;
        $scope.mcdb.rows.splice(index, 1);
        $scope.mcdb.deleteDoc(id, rev).success(function() {
            console.log("Successfully deleted document");
        }).error(function(data, status) {
                /*
                 ** On failure need to add the document back in.
                 */
                console.log("Failed to delete status: " + status);
            });
    }
}


function MyFormsCreateEditController($scope, $routeParams, $location, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");

    $scope.choices = [
        {type: "text", title: "", description:"", id: 1},
        {type: "number", title: "", description:"", id: 2},
        {type: "date", title: "", description:"", id: 3},
        {type: "url", title: "", description:"", id: 4}
    ];
    $scope.newitems = [];
    $scope.itemtitle = null;

    if ($routeParams.id) {
        editForm();
    }
    else {
        $scope.formentry = $scope.mcdb.newDoc();
        $scope.formentry.type = "form";
        $scope.formentry.user = "gtarcea@umich.edu";
        $scope.formentry.title = "";
        $scope.formentry.description = "";
        $scope.formentry.entries = [];
    }


    $scope.newItemDropped = function(event, ui) {
        $scope.formentry.entries.push($scope.newitems[$scope.newitems.length - 1]);
        addItemBack();
    }

    function editForm() {
        $scope.formentry = $scope.mcdb.getDoc($routeParams.id);
    }

    $scope.removeItem = function(index) {
        $scope.formentry.entries.splice(index,1);
    }

    $scope.saveForm = function() {
        $scope.formentry.save().error(function(data, status) {
            alert("Unable to save: " + status);
        });
        $location.path('/mylab/myforms/forms-list/');
    }

    function addItemBack() {
        var sawText = sawNumber = sawDate = sawUrl = false;

        for (var i = 0; i < $scope.choices.length; i++) {
            switch ($scope.choices[i].type) {
                case "text":
                    sawText = true;
                    break;
                case "number":
                    sawNumber = true;
                    break;
                case "date":
                    sawDate = true;
                    break;
                case "url":
                    sawUrl = true;
                    break;
            }
        }

        if (!sawText) {
            $scope.choices.splice(0, 0, {type: "text", title: "", description: "", id: 1});
        }
        else if (!sawNumber) {
            $scope.choices.splice(1, 0, {type: "number", title: "", description:"", id: 2});
        }
        else if (!sawDate) {
            $scope.choices.splice(2, 0, {type: "date", title: "", description: "", id: 3});
        }
        else if (!sawUrl) {
            $scope.choices.splice(3, 0, {type: "url", title: "", description: "", id: 4});
        }
    }
}

