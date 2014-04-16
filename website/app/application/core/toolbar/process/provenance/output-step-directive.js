Application.Directives.directive('outputStep',
    function () {
        return {
            restrict: "A",
            controller: "toolbarProcessProvenance",
            scope: {
                conditions: '=',
                files: "="
            },
            templateUrl: 'application/core/toolbar/process/provenance/output-step.html'
        };
    });
