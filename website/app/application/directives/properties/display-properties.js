Application.Directives.directive("displayProperties", [displayPropertiesDirective]);

function displayPropertiesDirective() {
    return {
        scope: {
            values: "=",
            properties: "="
        },
        controller: "displayPropertiesDirectiveController",
        restrict: "EA",
        templateUrl: "application/directives/properties/display-properties.html"
    };
}

Application.Controllers.controller('displayPropertiesDirectiveController',
                                   ["$scope", displayPropertiesDirectiveController]);
function displayPropertiesDirectiveController($scope) {
}

/* ******************************* */

Application.Directives.directive("displayTextProperty", [displayTextPropertyDirective]);

function displayTextPropertyDirective() {
    return {
        scope: {
            model: "=",
            property: "="
        },
        restrict: "EA",
        templateUrl: "application/directives/properties/display-text.html"
    };
}

/* ******************************* */

Application.Directives.directive("displayNumberProperty", [displayNumberPropertyDirective]);

function displayNumberPropertyDirective() {
    return {
        scope: {
            model: "=",
            property: "="
        },
        restrict: "EA",
        templateUrl: "application/directives/properties/display-number.html"
    };
}

/* ******************************* */

Application.Directives.directive("displaySelectProperty", [displaySelectPropertyDirective]);

function displaySelectPropertyDirective() {
    return {
        scope: {
            model: "=",
            property: "="
        },
        restrict: "EA",
        templateUrl: "application/directives/properties/display-select.html"
    };
}

/* ******************************* */

Application.Directives.directive("displayCompositionProperty", [displayCompositionPropertyDirective]);

function displayCompositionPropertyDirective() {
    return {
        scope: {
            model: "=",
            property: "="
        },
        restrict: "EA",
        templateUrl: "application/directives/properties/display-composition.html"
    };
}

/* ******************************* */

Application.Directives.directive("displayPropertyUnits", [displayPropertyUnitsDirective]);

function displayPropertyUnitsDirective() {
    return {
        scope: {
            model: "=",
            property: "="
        },
        restrict: "EA",
        templateUrl: "application/directives/properties/display-property-units.html"
    };
}
