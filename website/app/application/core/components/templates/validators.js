(function (module) {
    module.directive("validateUniqueSampleName", validateUniqueSampleName);

    function validateUniqueSampleName() {
        return {
            require: "ngModel",
            scope: {
                samples: "=validatorSamples"
            },
            restrict: "A",
            link: function ($scope, element, attrs, model) {
                model.$validators.uniqueSampleName = function (modelValue, viewValue) {
                    if (model.$isEmpty(modelValue)) {
                        return true;
                    }
                    if (findSampleByName($scope.samples, modelValue)) {
                        // couldn't find a matching sample
                        return true;
                    }
                    return false;
                };
            }
        };

        function findSampleByName(sampleList, sampleName) {
            var index = _.indexOf(sampleList, function (s) {
                return s.name === sampleName;
            });
            return index === -1;
        }
    }
}(angular.module('materialscommons')));
