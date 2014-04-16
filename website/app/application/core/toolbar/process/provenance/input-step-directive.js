Application.Directives.directive('inputStep',
    function () {
        return {
            restrict: "A",
            controller: "toolbarProcessProvenance",
            scope: {
                conditions: '=',
                files: "="
            },
            templateUrl: 'application/core/toolbar/process/provenance/input-step.html'
        };
    });
