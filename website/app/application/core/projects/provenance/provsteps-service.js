Application.Provenance.Services.factory('ProvSteps', [function () {
    var service = {
        finishedSteps: [],
        currentStep: '',
        stepFinishedFunc: null,

        isCurrentStep: function (step) {
            return step === service.currentStep;
        },

        setCurrentStep: function (step) {
            service.currentStep = step;
        },

        setStepFinished: function (step) {
            var found = _.contains(service.finishedSteps, step);
            if (!found) {
                service.finishedSteps.push(step);
            }
            if (service.stepFinishedFunc !== null) {
                service.stepFinishedFunc(step);
            }
        },

        isFinishedStep: function (step) {
            return _.contains(service.finishedSteps, step);

        },

        onStepFinished: function (f) {
            service.stepFinishedFunc = f;
        },

        clear: function () {
            service.finishedSteps = [];
            service.currentStep = '';
            service.stepFinishedFunc = null;
        }
    };

    return service;
}]);