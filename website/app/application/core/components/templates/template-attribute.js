(function (module) {
    module.directive("templateAttribute", templateAttributeDirective);
    function templateAttributeDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute.html"
        };
    }

    module.controller("templateAttributeDirectiveController", templateAttributeDirectiveController);
    templateAttributeDirectiveController.$inject = ["$scope"];

    function templateAttributeDirectiveController($scope) {
    }

    module.directive("templateAttributeDetails", templateAttributeDetailsDirective);
    function templateAttributeDetailsDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit",
                form: "=form"
            },
            controller: "templateAttributeDetailsDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-details.html"
        };
    }

    module.controller("templateAttributeDetailsDirectiveController", templateAttributeDetailsDirectiveController);
    templateAttributeDetailsDirectiveController.$inject = ["$scope"];

    function templateAttributeDetailsDirectiveController($scope) {
    }

    module.directive("templateAttributeComposition", templateAttributeCompositionDirective);
    function templateAttributeCompositionDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeCompositionDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-composition.html"
        };
    }

    module.controller("templateAttributeCompositionDirectiveController",
        templateAttributeCompositionDirectiveController);
    templateAttributeCompositionDirectiveController.$inject = ["$scope"];

    function templateAttributeCompositionDirectiveController($scope) {

    }

    module.directive("templateAttributeHistogram", templateAttributeHistogramDirective);
    function templateAttributeHistogramDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeHistogramDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-histogram.html"
        };
    }

    module.controller("ModalAddMeasurements", ModalAddMeasurements);
    ModalAddMeasurements.$inject = ["$scope", "$modalInstance"];

    function ModalAddMeasurements($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.close('close clicked');
        };
    }

    module.controller("templateAttributeHistogramDirectiveController", templateAttributeHistogramDirectiveController);
    templateAttributeHistogramDirectiveController.$inject = ["$scope", "$modal"];
    function templateAttributeHistogramDirectiveController($scope, $modal) {
        var categories = [];
        var seriesData = [];

        $scope.addMeasurement = function () {
            var modal = $modal.open({
                templateUrl: "../../projects/project/processes/for-later/wizard/add-measurements.html",
                controller: "ModalAddMeasurements",
                size: 'lg'
            });
            modal.result.then(function (result) {
                console.log("from modal:", result);
            });
        };

        $scope.histogramConfig = {
            options: {
                title: {
                    text: $scope.attribute.name
                },
                chart: {
                    renderTo: "container",
                    type: "column"
                },
                plotOptions: {
                    column: {
                        groupPadding: 0,
                        pointPadding: 0,
                        borderWidth: 0
                    }
                }
            },
            xAxis: {
                categories: categories
            },
            series: [
                {
                    data: seriesData
                }
            ]
        };

        $scope.histogramMeasurementConfig = {
            options: {
                chart: {
                    renderTo: "container",
                    type: "column"
                },
                plotOptions: {
                    column: {
                        groupPadding: 0,
                        pointPadding: 0,
                        borderWidth: 0
                    }
                }
            },
            xAxis: {
                categories: []
            },
            series: [
                {
                    data: []
                }
            ]
        };

        $scope.db = {
            items: []
        };
        for (var i = 0; i < 50; i++) {
            $scope.db.items.push({
                id: i,
                category: "c_" + i,
                value: i * 10
            });
        }

        var selectedStartRow = -1,
            selectedStartColumn = -1,
            selectedEndRow = -1,
            selectedEndColumn = -1;

        $scope.afterSelection = function (startRow, startColumn, endRow, endColumn) {
            selectedStartRow = startRow;
            selectedStartColumn = startColumn;
            selectedEndRow = endRow;
            selectedEndColumn = endColumn;
        };

        $scope.afterSelectionSubmit = function () {
            var startRow = selectedStartRow,
                startColumn = selectedStartColumn,
                endRow = selectedEndRow,
                endColumn = selectedEndColumn;

            var j;
            for (var i = startColumn; i <= endColumn; i++) {
                if (i === 0) {
                    // Category
                    categories = [];
                    for (j = startRow; j <= endRow; j++) {
                        categories.push($scope.db.items[j].category);
                    }
                } else {
                    // Series
                    seriesData = [];
                    for (j = startRow; j <= endRow; j++) {
                        seriesData.push($scope.db.items[j].value);
                    }
                }
            }
            $scope.histogramConfig.xAxis.categories = categories;
            $scope.histogramConfig.series[0].data = seriesData;
        };

        $scope.submit = function () {
            categories = $scope.xValues.split(",");
            seriesData = [];
            $scope.yValues.split(",").forEach(function (val) {
                seriesData.push(parseInt(val, 10));
            });
            $scope.histogramConfig.xAxis.categories = categories;
            $scope.histogramConfig.series[0].data = seriesData;
        };

        $scope.measurement = {
            categories: "",
            values: "",
            splitCategories: [],
            splitValues: []
        };

        $scope.submitMeasurement = function () {
            $scope.measurement.splitCategories = $scope.measurement.categories.split("\n");
            $scope.measurement.splitValues = [];
            $scope.measurement.values.split("\n").forEach(function (value) {
                $scope.measurement.splitValues.push(parseInt(value, 10));
            });
        };

        $scope.viewInGraph = function () {
            $scope.showMeasurementGraph = !$scope.showMeasurementGraph;
            if ($scope.showMeasurementGraph) {
                $scope.submitMeasurement();
                $scope.histogramMeasurementConfig.xAxis.categories = $scope.measurement.splitCategories;
                $scope.histogramMeasurementConfig.series[0].data = $scope.measurement.splitValues;
            }
        };

    }

    module.directive("templateAttributeLine", templateAttributeLineDirective);
    function templateAttributeLineDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeLineDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-line.html"
        };
    }

    module.controller("templateAttributeLineDirectiveController", templateAttributeLineDirectiveController);
    templateAttributeLineDirectiveController.$inject = ["$scope"];
    function templateAttributeLineDirectiveController($scope) {
        $scope.linechartConfig = {
            options: {
                chart: {
                    type: "areaspline"
                },
                plotOptions: {
                    series: {
                        stacking: ""
                    }
                }
            },
            xAxis: {
                categories: [1, 2, 3, 4, 5, 6]
            },
            series: [
                {
                    data: [10, 20, 30, 40, 50],
                    type: "line"
                }]
        };
    }

    module.directive("templateAttributeList", templateAttributeListDirective);
    function templateAttributeListDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeListDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-list.html"
        };
    }

    module.controller("templateAttributeListDirectiveController", templateAttributeListDirectiveController);
    templateAttributeListDirectiveController.$inject = ["$scope"];
    function templateAttributeListDirectiveController($scope) {

    }

    module.directive("templateAttributeNumber", templateAttributeNumberDirective);
    function templateAttributeNumberDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit",
                form: "=form"
            },
            controller: "templateAttributeNumberDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-number.html"
        };
    }

    module.controller("templateAttributeNumberDirectiveController", templateAttributeNumberDirectiveController);
    templateAttributeNumberDirectiveController.$inject = ["$scope", "pubsub"];
    function templateAttributeNumberDirectiveController($scope) {
        $scope.control = {
            edit: $scope.edit
        };

        $scope.done = function () {
            $scope.control.edit = false;
            $scope.attribute.done = true;
            if ($scope.attribute.required) {
                pubsub.send("create.sample.attribute.done");
            }
        };
    }

    module.directive("templateAttributePair", templateAttributePairDirective);
    function templateAttributePairDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributePairDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-pair.html"
        };
    }

    module.controller("templateAttributePairDirectiveController", templateAttributePairDirectiveController);
    templateAttributePairDirectiveController.$inject = ["$scope"];
    function templateAttributePairDirectiveController($scope) {
        $scope.control = {
            edit: $scope.edit
        };

        $scope.attribute1 = $scope.attribute.attribute.attributes[0];
        $scope.attribute2 = $scope.attribute.attribute.attributes[1];

        $scope.done = function () {
            $scope.control.edit = false;
            $scope.attribute.done = true;
            if ($scope.attribute.required) {
                pubsub.send("create.sample.attribute.done");
            }
        };

    }

    module.directive("templateAttributeString", templateAttributeStringDirective);
    function templateAttributeStringDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit",
                form: "=form"
            },
            controller: "templateAttributeStringDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-string.html"
        };
    }

    module.controller("templateAttributeStringDirectiveController", templateAttributeStringDirectiveController);
    templateAttributeStringDirectiveController.$inject = ["$scope", "pubsub"];
    function templateAttributeStringDirectiveController($scope, pubsub) {
        $scope.control = {
            edit: $scope.edit
        };

        $scope.done = function () {
            $scope.control.edit = false;
            $scope.attribute.done = true;
            if ($scope.attribute.required) {
                pubsub.send("create.sample.attribute.done");
            }
        };
    }

    module.directive("templateAttributeDate", templateAttributeDateDirective);
    function templateAttributeDateDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit",
                form: "=form"
            },
            controller: "templateAttributeDateDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-date.html"
        };
    }

    module.controller("templateAttributeDateDirectiveController", templateAttributeDateDirectiveController);
    templateAttributeDateDirectiveController.$inject = ["$scope", "pubsub"];
    function templateAttributeDateDirectiveController($scope, pubsub) {
        $scope.dateOptions = {
            formatYear: "yy",
            startingDay: 1
        };

        $scope.control = {
            edit: $scope.edit,
            isOpen: false
        };

        if ($scope.attribute.value === "") {
            $scope.attribute.value = new Date();
            $scope.attribute.done = true;
        }

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.control.isOpen = true;
        };
    }

    module.directive("templateAttributeSample", templateAttributeSampleDirective);
    function templateAttributeSampleDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                attribute: "=attribute",
                edit: "=edit"
            },
            controller: "templateAttributeSampleDirectiveController",
            templateUrl: "application/core/components/templates/partials/attributes/template-attribute-sample.html"
        };
    }

    module.controller("templateAttributeSampleDirectiveController", templateAttributeSampleDirectiveController);
    templateAttributeSampleDirectiveController.$inject = ["$scope", "pubsub"];
    function templateAttributeSampleDirectiveController($scope, pubsub) {
        $scope.control = {
            edit: $scope.edit,
            editIndex: -1
        };

        $scope.attr = {
            name: "",
            description: "",
            from: ""
        };

        /*
         * If edit is set, but there are multiple items, then
         * show the list of items to the user and let them
         * pick which one they are going to edit. If there is
         * only one item and edit is set then load that items
         * value up for editing.
         */
        if ($scope.attribute.value.length == 1 && $scope.control.edit) {
            edit(0);
        } else if ($scope.attribute.value.length > 1) {
            $scope.control.edit = false;
        }

        // View methods
        $scope.addAnother = addAnother;
        $scope.doneAndAddAnother = doneAndAddAnother;
        $scope.cancel = cancel;
        $scope.done = done;
        $scope.editEntry = editEntry;

        ///////////////////////////////////

        // cancel clears the temporary attributes. If there are
        // no values then leave the edit page up, otherwise go
        // back to the list of items.
        function cancel() {
            clearAttrs();
            if ($scope.attribute.value.length !== 0) {
                $scope.control.edit = false;
                $scope.control.editIndex = -1;
            }
        }

        // clearAttrs resets the temporary attr view model.
        function clearAttrs() {
            $scope.attr.name = "";
            $scope.attr.description = "";
            $scope.attr.from = "";
        }

        // edit sets up editing of one of the samples.
        function editEntry(index) {
            $scope.attr.name = $scope.attribute.value[index].name;
            $scope.attr.description = $scope.attribute.value[index].description;
            $scope.attr.from = $scope.attribute.value[index].from;
            $scope.control.editIndex = index;
            $scope.control.edit = true;
            $scope.attribute.done = false;
        }

        // addAnother allows the user to add another sample.
        function addAnother() {
            $scope.control.edit = true;
            clearAttrs();
        }

        // done is called when the user is finished adding in attributes
        // for a sample.
        function done() {
            addAttrsToValue();
            $scope.control.edit = false;
            $scope.attribute.done = true;
            if ($scope.attribute.required) {
                pubsub.send("process.section.category.done");
            }
        }

        // doneAndAddAnother adds a sample, but leaves the edit
        // view up so another sample can be added. It clears the
        // view model attrs of the previous values.
        function doneAndAddAnother() {
            addAttrsToValue();
            clearAttrs();
        }

        // addAttrsToValue updates or adds a sample to the list of samples
        // in the view.
        function addAttrsToValue() {
            if ($scope.control.editIndex === -1) {
                $scope.attribute.value.push(angular.copy($scope.attr));
            } else {
                var attr = $scope.attribute.value[$scope.control.editIndex];
                attr.name = $scope.attr.name;
                attr.description = $scope.attr.description;
                attr.from = $scope.attr.from;
                $scope.control.editIndex = -1;
            }
        }
    }
}(angular.module('materialscommons')));
