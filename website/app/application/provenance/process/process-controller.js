Application.Provenance.Controllers.controller('provenanceProcess',
    ["$scope", "mcapi", "watcher", "alertService", "ProvSteps", "ProvDrafts", "dateGenerate", "User",
        function ($scope, mcapi, watcher, alertService, ProvSteps, ProvDrafts, dateGenerate, User) {
            watcher.watch($scope, 'process.process_type', function (template) {
                if ($scope.process.template.template_name === template.template_name) {
                    // All attributes already loaded from a draft
                    return;
                }
                $scope.process.model.default_properties = template.default_properties;
                $scope.process.required_input_conditions = template.required_input_conditions;
                $scope.process.required_output_conditions = template.required_output_conditions;
                $scope.process.required_input_files = template.required_input_files;
                $scope.process.required_output_files = template.required_output_files;
                var now = new Date();
                var dd = ("0" + now.getDate()).slice(-2);
                var mm = ("0" + (now.getMonth() + 1)).slice(-2);
                var today = now.getFullYear() + "-" + mm + "-" + dd;
                $scope.process.name = template.template_name + ':' + today;
                $scope.process.template = template;
            });
            $scope.addAdditionalProperty = function () {
                $scope.process.model.added_properties.push(JSON.parse($scope.additionalProperty));
            };

            $scope.addCustomProperty = function () {
                $scope.process.model.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, "type": "text", 'unit': '', 'value_choice': [], 'unit_choice': [], 'required': false});
            };

            $scope.add_notes = function () {
                $scope.process.notes.push({'message': $scope.bk.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.bk.new_note = "";
            };
            $scope.add_run = function () {
                if ($scope.process.template.template_pick === 'experiment') {
                    $scope.process.runs.push({'started': $scope.bk.exp_run_date, 'stopped': '', 'error_messages': ''});
                } else {
                    $scope.process.runs.push({'started': $scope.bk.start_run, 'stopped': $scope.bk.stop_run, 'error_messages': $scope.bk.new_err_msg});
                    $scope.bk.new_err_msg = "";
                    $scope.bk.start_run = "";
                    $scope.bk.stop_run = "";
                }
            };

            $scope.remove_run = function (index) {
                $scope.process.runs.splice(index, 1);
            };

            $scope.saveDraft = function () {
                ProvDrafts.current.name = $scope.process.model.default_properties[0].value;
                ProvDrafts.saveDraft();
                $scope.message = "Your draft has been saved!";
            };

            $scope.next = function () {
                ProvSteps.setStepFinished('process');
            };

            function init() {
                $scope.bk = {
                    new_note: '',
                    new_err_msg: '',
                    start_run: '',
                    stop_run: ''
                };
                $scope.process = ProvDrafts.current.attributes.process;
                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"process"')
                    .success(function (processes) {
                        var t;
                        $scope.process_templates = processes;
                        if ($scope.process.template !== "") {
                            t = _.findWhere($scope.process_templates, {template_name: $scope.process.template.template_name});
                            if (t) {
                                $scope.process.process_type = t;
                            }
                        }
                    })
                    .error(function () {
                        alertService.sendMessage("Unable to retrieve processes from database.");
                    }).jsonp();

                mcapi('/machines')
                    .success(function (data) {
                        $scope.machines_list = data;

                        if ($scope.process.machine) {
                            var i = _.indexOf($scope.machines_list, function (item) {
                                return (item.name === $scope.process.machine.name);
                            });

                            if (i !== -1) {
                                $scope.process.machine = $scope.machines_list[i];
                            }
                        }
                    }).jsonp();

            }

            init();
        }]);
