Application.Directives.directive('inputOutputStep',
    function () {
        return {
            restrict: "A",
            controller: "toolbarProcessProvenance",
            scope: {
                conditions: '=',
                files: "=",
                stepType: "@"
            },
            templateUrl: 'application/core/toolbar/process/provenance/input-output-step.html'
        };
    });
