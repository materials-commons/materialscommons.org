Application.Provenance.Controllers.controller('provenanceProcess',
    ["$scope", "mcapi", "alertService", "ProvSteps", "ProvDrafts", "dateGenerate", "User", "$injector", "$filter",
        function ($scope, mcapi, alertService, ProvSteps, ProvDrafts, dateGenerate, User, $injector, $filter) {
            var $validationProvider = $injector.get('$validation'), check;

            $scope.change_process = function (template) {
                if ($scope.doc.template.template_name === template.template_name) {
                    // All attributes already loaded from a draft
                    return;
                }
                $scope.doc.default_properties = template.default_properties;
                $scope.doc.required_input_conditions = template.required_input_conditions;
                $scope.doc.required_output_conditions = template.required_output_conditions;
                $scope.doc.required_input_files = template.required_input_files;
                $scope.doc.required_output_files = template.required_output_files;
                var now = new Date();
                var dd = ("0" + now.getDate()).slice(-2);
                var mm = ("0" + (now.getMonth() + 1)).slice(-2);
                var today = now.getFullYear() + "-" + mm + "-" + dd;
                $scope.doc.name = template.template_name + ':' + today;
                $scope.doc.template = template;
            };
            $scope.saveDraft = function (form) {
                check = $validationProvider.checkValid(form);
                if (check === true) {
                    ProvDrafts.current.name = $scope.doc.name;
                    ProvDrafts.saveDraft();
                    $scope.message = "Your draft has been saved!";
                } else {
                    $validationProvider.validate(form);
                }

            };

            $scope.next = function (form) {
                check = $validationProvider.checkValid(form);
                if (check === true) {
                    ProvSteps.setStepFinished('process');
                }
            };


            function init() {
                $scope.bk = {
                    new_note: '',
                    new_err_msg: '',
                    start_run: '',
                    stop_run: '',
                    additional_property: '',
                    customPropertyName: '',
                    customPropertyValue: ''

                };
                $scope.doc = ProvDrafts.current.process;

                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"process"')
                    .success(function (processes) {
                        $scope.process_templates = processes;
                        $scope.experimental_templates = $filter('templateFilter')($scope.process_templates, 'experiment');
                        $scope.computational_templates = $filter('templateFilter')($scope.process_templates, 'computation');

                    })
                    .error(function () {
                        alertService.sendMessage("Unable to retrieve processes from database.");
                    }).jsonp();

                mcapi('/user/%/preferred_templates', User.u())
                    .success(function (data) {
                        $scope.preferred_templates = data.preferences.templates;
                    }).jsonp();

                mcapi('/machines')
                    .success(function (data) {
                        $scope.machines_list = data;

                        if ($scope.doc.machine) {
                            var i = _.indexOf($scope.machines_list, function (item) {
                                return (item.name === $scope.doc.machine.name);
                            });

                            if (i !== -1) {
                                $scope.doc.machine = $scope.machines_list[i];
                            }
                        }
                    }).jsonp();

            }

            init();
        }]);
