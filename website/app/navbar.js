Application.Directives.directive("navbar", navbarDirective);

function navbarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "navbar.html",
        controller: "navbarDirectiveController"
    };
}

Application.Controllers.controller("navbarDirectiveController",
                                   ["$scope", navbarDirectiveController]);

function navbarDirectiveController($scope) {
    console.log("navbar controller");
}
