Application.Provenance.Controllers.controller('provenanceProcess',
    ["$scope", "mcapi", "watcher", "alertService", "ProvSteps", "ProvDrafts", "dateGenerate", "User", "$injector",
        function ($scope, mcapi, watcher, alertService, ProvSteps, ProvDrafts, dateGenerate, User,  $injector) {
            var $validationProvider = $injector.get('$validation'), check;

            watcher.watch($scope, 'bk.process_type', function (template) {
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
            });

            $scope.remove_run = function (index) {
                $scope.doc.runs.splice(index, 1);
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
                    process_type: '',
                    additional_property: '',
                    customPropertyName: '',
                    customPropertyValue: ''

                };
                $scope.doc = ProvDrafts.current.process;
                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"process"')
                    .success(function (processes) {
                        var t;
                        $scope.process_templates = processes;
                        if ($scope.doc.template !== "") {
                            t = _.findWhere($scope.process_templates, {template_name: $scope.doc.template.template_name});
                            if (t) {
                                $scope.bk.process_type = t;
                            }
                        }
                    })
                    .error(function () {
                        alertService.sendMessage("Unable to retrieve processes from database.");
                    }).jsonp();

                mcapi('/machines')
                    .success(function (data) {
                        $scope.machines_list = data;
                    }).jsonp();
            }

            init();
        }]);
