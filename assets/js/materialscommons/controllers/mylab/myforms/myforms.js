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
        $scope.mcdb.deleteDoc(id, rev).success( function() {
            console.log("Successfully deleted document");
        }).error(function(data, status) {
                /*
                ** On failure need to add the document back in.
                 */
                console.log("Failed to delete status: " + status);
            });
//        remove()
//            .success(function() {
//                 console.log("success");
////                $scope.mcdb.rows.splice(index, 1);
//            })
//            .error(function(data, status) {
//                console.log("error: Cannot delete form: " + status);
//            });
//        var id = $scope.mcdb.rows[index].id;
//        var doc2 = $scope.mcdb.getDoc(id);
//        console.dir(doc2);
//        doc2.remove()
//            .success(function() {
//                $scope.mcdb.rows.splice(index, 1);
//            })
//            .error(function(data, status) {
//                alert("Cannot delete form: " + status);
//            });
    }
}


function MyFormsCreateEditController($scope, $routeParams, $location, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");

    $scope.formentry = {
        type: "form",
        user: "gtarcea@umich.edu",
        title: "",
        description: "",
        entries: []
    }

    $scope.choices = [
        {type: "text", title: "", id: 1},
        {type: "number", title: "", id: 2},
        {type: "date", title: "", id: 3},
        {type: "url", title: "", id: 4}
    ];
    $scope.newitems = [];
    $scope.itemtitle = null;

    if ($routeParams.id) {
        editForm();
    }


    $scope.newItemDropped = function(event, ui) {
        console.log("itemtitle = " + $scope.itemtitle);
        console.log("length = " + $scope.formentry.entries.length);
        console.log("formentry = " + $scope.formentry.entries[$scope.formentry.entries.length-1].type);
        if ($scope.itemtitle != null) {
            $scope.formentry.entries[$scope.formentry.entries.length - 1].title = $scope.itemtitle;
            $scope.itemtitle = null;
        }

        addItemBack();
    }

    function editForm() {
        $scope.formentry = $scope.mcdb.getDoc($routeParams.id);
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
            $scope.choices.splice(0, 0, {type: "text", title: "", id: 1});
        }
        else if (!sawNumber) {
            $scope.choices.splice(1, 0, {type: "number", title: "", id: 2});
        }
        else if (!sawDate) {
            $scope.choices.splice(2, 0, {type: "date", title: "", id: 3});
        }
        else if (!sawUrl) {
            $scope.choices.splice(3, 0, {type: "url", title: "", id: 4});
        }
    }
}

