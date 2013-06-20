function ExperimentListController($scope, $location, $routeParams, cornercouch) {

//    var mcdb = {rows:[
//        { value:{"_id":"1", "name":"ALLISON-SEM-MAGNESIUSM",
//            "description":"Test tensile strength of magnesium when heated"}},
//        { value:{"_id":"2", "name":"ALLISON-THERMAL-MAGNESIUSM-HYBRID",
//            "description":"Alloying of magnesium/aluminum hybrid under extreme temperatures"}},
//        { value:{"_id":"3", "name":"ALLISON-SEM-CHROMIUM",
//            "description":"Does chromium show same failure conditions as magnesium?"}}
//    ]};
//
//    $scope.mcdb = mcdb;

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "all_experiments");

    $scope.keypressCallback = function(event) {
        if (length == 0) {
            var path = document.getElementById('createExperiment').href + "?name=" + $scope.query;
            document.location = path;
        }
    }

    $scope.editExperiment = function(id) {
        $location.path("/mylab/myexperiments/edit-experiment/" + id);
    }
    $scope.predicate = 'name';
}

function ExperimentCreateEditController($scope, $routeParams, $location, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.propertyIndex = -1;

    if (!$routeParams.id) {
        $scope.experiment = $scope.mcdb.newDoc();
        $scope.experiment.properties = [];
        $scope.experiment.description = "";
        $scope.experiment.lab = "";
        $scope.experiment.metal = "";
        $scope.experiment.thickness = "";
        $scope.experiment.name = "";
        $scope.experiment.type = "experiment";
        $scope.pageTypeMessage = "Create";
        $scope.saveButtonText = "Save";
        //$scope.deleteOrCancelButtonText = "Cancel";

        if ($routeParams.name) {
            $scope.experiment.name = $routeParams.name;
        }
    } else {
        $scope.pageTypeMessage = "View/Edit";
        $scope.saveButtonText = "Save Changes";
        //$scope.deleteOrCancelButtonText = "Delete";
        $scope.experiment = $scope.mcdb.getDoc($routeParams.id);
    }

    $scope.equipment = [
        "APT",
        "TEM",
        "XRD",
        "SEM",
        "OIM",
        "Optical"
    ];

    $scope.msSaveChanges = function() {
        if ($scope.propertyIndex == -1) {
            var prop = {};
            prop.type = 'microstructure';
            prop.mtype = $scope.ms_equipment;
            prop.description = $scope.ms_description;
            prop.date = 'today';
            prop.attachments = new Array();
            $scope.experiment.properties.push(prop);
            $scope.ms_equipment = "NONE";
            $scope.ms_description = "";
        } else {
            var i = $scope.propertyIndex;
            $scope.experiment.properties[i].mtype = $scope.ms_equipment;
            $scope.experiment.properties[i].description = $scope.ms_description;
            $scope.propertyIndex = -1;
        }
    }

    $scope.msCount = function() {
        return microstructureCount($scope.experiment.properties);
    };

    $scope.saveExperiment = function() {
        $scope.experiment.save().error(function(data, status) {
            alert("Unable to save: " + status);
        });
        $location.path('/mylab/myexperiments/experiment-list/');
    };

    $scope.deleteExperiment = function() {
        $scope.experiment.remove()
            .success(function() {
                delete $scope.experiment;
            })
            .error(function(data, status) {
                alert("Unable to delete experiment: " + status);
            });
        $location.path('/mylab/myexperiments/experiment-list/');
    };

    $scope.removeProperty = function(index) {
        console.log("removeProperty");
        $scope.experiment.properties.splice(index, 1);
    };

    $scope.editProperty = function(index) {
        console.log("editProperty");
        $scope.propertyIndex = index;
        switch ($scope.experiment.properties[index].type) {
            case "microstructure":
                $scope.ms_equipment = $scope.experiment.properties[index].mtype;
                $scope.ms_description = $scope.experiment.properties[index].description;
                $('#microstructure').modal('show');
                break;
            default:
                $scope.propertyIndex = -1;
                alert("Not implemented yet");
                break;
        }
    }
}