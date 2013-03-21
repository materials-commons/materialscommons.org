
function MyFormsListController($scope, $routeParams, $location, cornercouch) {
    $scope.user="gtarcea@umich.edu";
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "form_by_user", {key: $scope.user});

    $scope.editData = function(id) {
        /*
         ** TODO: How to edit an item
         **
         **    What happens when a change is made to data that is associated with
         **    an experiment that the user doesn't own?
         */
        $location.path("/mylab/myforms/edit-form/" + id);
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


function MyFormsCreateEditController($scope, $routeParams, $location, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");

    $scope.formentry = {
        type:"form",
        user: "gtarcea@umich.edu",
        title: "",
        description:"",
        entries:[]
    }

    $scope.choices = [
        {type:"text", title:"", id:1},
        {type:"number", title:"", id:2},
        {type:"date", title:"", id:3},
        {type: "url", title:"", id:4}
    ];
    $scope.newitems = [];
    $scope.itemtitle = null;

    if ($routeParams.id) {
        editForm();
    }


    $scope.newItemDropped = function(event, ui) {
//        console.log($scope.itemtitle);
        if ($scope.itemtitle != null) {
            $scope.formentry.entries[$scope.formentry.entries.length-1].title = $scope.itemtitle;
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

        if (! sawText) {
            $scope.choices.splice(0,0, {type:"text", title:"", id:1});
        }
        else if (! sawNumber) {
            $scope.choices.splice(1,0, {type:"number", title:"", id:2});
        }
        else if (! sawDate) {
            $scope.choices.splice(2,0, {type:"date", title:"", id:3});
        }
        else if (! sawUrl) {
            $scope.choices.splice(3,0, {type:"url", title:"", id:4});
        }
    }
}

