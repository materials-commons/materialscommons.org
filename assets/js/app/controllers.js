'use strict';

function ExperimentListController($scope, $location, cornercouch) {

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
            window.location = document.getElementById('createExperiment').href + "?name=" + $scope.query;
        }
    }

    $scope.editExperiment = function(id) {
        window.location = "#/materialscommons/experiment/" + id;
    }
}

function ExperimentCreateEditController($scope, $routeParams, cornercouch) {

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.propertyIndex = -1;

    if (!$routeParams.experimentId) {
        $scope.experiment = $scope.mcdb.newDoc();
        $scope.experiment.properties = [];
        $scope.experiment.description = "";
        $scope.experiment.lab = "";
        $scope.experiment.metal = "";
        $scope.experiment.thickness = "";
        $scope.experiment.type = "experiment";
        $scope.pageTypeMessage = "Create";
        $scope.saveButtonText = "Save";
        $scope.deleteOrCancelButtonText = "Cancel";

        if ($routeParams.name) {
            $scope.name = $routeParams.name;
        }
        else {
            $scope.name = "";
        }
    } else {
        $scope.pageTypeMessage = "View";
        $scope.saveButtonText = "Save Changes";
        $scope.deleteOrCancelButtonText = "Delete";
        $scope.experiment = $scope.mcdb.getDoc($routeParams.experimentId);
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
        window.location = '#/materialscommons/notebook';
    };

    $scope.deleteOrCancel = function() {
        if ($scope.pageTypeMessage == "Create") {
            window.location = '#/materialscommons/notebook';
        } else {
            $scope.experiment.remove()
                .success(function() {
                    delete $scope.experiment;
                })
                .error(function(data, status) {
                    alert("Unable to delete experiment: " + status);
                });
            window.location = '#/materialscommons/notebook';
        }
    };

    $scope.removeProperty = function(index) {
        $scope.experiment.properties.splice(index, 1);
    };

    $scope.editProperty = function(index) {
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

function MessagesController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "recent_events");
}

function ChartController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.chart_data = $scope.mcdb.getDoc("942ecdf121a6f788cc86a10a7e3e8ab6");
}

function FrontPageController($scope, $routeParams) {
    // Nothing to do yet.
}

function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}


//function MicrostructureController($scope, $routeParams) {
//
//    $scope.tmessage = "Microstructure";
//
//    $scope.ms_equipment = [
//        "APT",
//        "TEM",
//        "XRD",
//        "SEM",
//        "OIM",
//        "Optical"
//    ];
//
//    $scope.saveChanges = function () {
//        var type = "<td class='mc-prop-type'>microstructure</td>";
//        var description = "<td class='mc-prop-description'>" + $scope.ms_description + "</td>";
//        var how = "<td class='mc-prop-how'>" + $scope.ms_equipment + "</td>"
//        var dateAdded = "<td class='mc-prop-date'>today</td>";
//        var attachmentCount = "<td><span class='badge badge-info'>0</span></td>";
//        var entry = "<tr>" + type + description + how + dateAdded + attachmentCount + "</tr>";
//        $('#experimentPropertyEntries').append(entry);
//
//        var rowCount = $('#experimentPropertyEntries tr').length;
//
//        $('#msCountBadge').html(rowCount);
//
//        $scope.ms_equipment = "NONE";
//        $scope.ms_description = "";
//    }
//}