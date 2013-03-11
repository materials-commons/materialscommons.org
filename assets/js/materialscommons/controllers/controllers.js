'use strict';

function LoginController($scope, $location, $timeout, cornercouch, User) {

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;

    $scope.login = function() {
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email})
            .success(function() {
                if ($scope.mcdb.rows.length > 0) {
                    console.log("Comparing passwords");
                    var db_password = $scope.mcdb.rows[0].value.password;
                    if (db_password == $scope.password) {
                        User.setAuthenticated(true);
                        $scope.failedLogin = false;
                        $scope.successfulLogin = true;
                        $timeout(function() {
                            $location.path("/mylab/myexperiments/experiment-list/");
                        }, 2000);
                    } else {
                        $scope.failedLogin = true;
                    }
                } else {
                    $scope.failedLogin = true;
                }
            })
            .error(function() { console.log("Query Failed!!!");});
    }

    $scope.cancel = function() {
        $location.path("/home");
    }

    $scope.closeAlert = function() {
        $scope.alerts.splice(0,1);
    }
}

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
}

function ExperimentCreateEditController($scope, $routeParams, $location, cornercouch) {

    console.log("ExperimentCreateEditController");
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
        $scope.deleteOrCancelButtonText = "Cancel";

        if ($routeParams.name) {
            $scope.experiment.name = $routeParams.name;
        }
    } else {
        $scope.pageTypeMessage = "View";
        $scope.saveButtonText = "Save Changes";
        $scope.deleteOrCancelButtonText = "Delete";
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

    $scope.deleteOrCancel = function() {
        if ($scope.pageTypeMessage == "Create") {
            $location.path("/mylab/myexperiments/experiment-list/");
        } else {
            $scope.experiment.remove()
                .success(function() {
                    delete $scope.experiment;
                })
                .error(function(data, status) {
                    alert("Unable to delete experiment: " + status);
                });
            $location.path('/mylab/myexperiments/experiment-list/');
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

function MyLabTabController($scope, $routeParams) {
    $scope.template = "partials/mylab/experiment-list.html";
    if ($routeParams.tab) {
        switch ($routeParams.tab) {
            case "myexperiments":
                $scope.template = partialForMyExperimentsRoute();
//                $scope.template = "partials/mylab/experiment-list.html";
                $('#my-experiments-tab').addClass("active");
                break;
            case "mydata":
                $scope.template = "partials/mylab/mydata.html";
                $('#my-data-tab').addClass("active");
                break;
            case "myreferences":
                $scope.template = "partials/mylab/myreferences.html";
                $('#my-references-tab').addClass("active");
                break;
            default:
                $scope.template = "partials/mylab/experiment-list.html";
                $('#my-experiments-tab').addClass("active");
                break;
        }
    }

    function partialForMyExperimentsRoute()
    {
        if ($routeParams.subpage == "experiment-list") {
            return "partials/mylab/experiment-list.html";
        }
        else if ($routeParams.subpage == "create-experiment") {
            return "partials/mylab/experiment.html";
        }
        else if ($routeParams.subpage == "edit-experiment") {
            return "partials/mylab/experiment.html";
        }
    }
}

function ExploreController($scope, $routeParams) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope, $routeParams) {
    $scope.pageDescription = "About";
}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}