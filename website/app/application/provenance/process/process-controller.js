Application.Provenance.Controllers.controller('provenanceProcess',
    ["$scope", "mcapi", "watcher", "alertService", "ProvSteps", "ProvDrafts",
        function ($scope, mcapi, watcher, alertService, ProvSteps, ProvDrafts) {
            watcher.watch($scope, 'process_type', function (template_name) {
                console.log('template_name =' + template_name);
                console.dir(template_name);
                var template = _.findWhere($scope.process_templates, {template_name: template_name});
                console.log("template =");
                console.dir(template);
                if (template) {
                    template.model.forEach(function (item) {
                        if (item.name === "required_conditions") {
                            $scope.process.required_conditions = item.value;
                        } else if (item.name === "required_output_conditions") {
                            $scope.process.required_output_conditions = item.value;
                        } else if (item.name === "required_input_files") {
                            $scope.process.required_input_files = item.required;
                        } else if (item.name === "required_output_files") {
                            $scope.process.required_output_files = item.required;
                        }

                    });
                    var now = new Date();
                    var dd = ("0" + now.getDate()).slice(-2);
                    var mm = ("0" + (now.getMonth() + 1)).slice(-2);
                    var today = now.getFullYear() + "-" + mm + "-" + dd;
                    $scope.process.name = template.template_name + ':' + today;
                    $scope.process.template = template;
                }
            });

            $scope.add_property_to_machine = function () {
                if ($scope.bk.p_name || $scope.bk.p_name === ' ') {
                    $scope.process.machine.model.push({'name': $scope.bk.p_name, 'value': ''});
                }

            };

            $scope.custom_property = function () {
                if ($scope.additional_prop || $scope.additional_prop === ' ') {
                    $scope.process.machine.model.push({'name': $scope.additional_prop, 'value': ''});
                }

            };

            $scope.machine_select = function (m) {
                $scope.process.machine = m;
            };

            $scope.clear_machine = function () {
                $scope.process.machine = {'model': []};
                $scope.machine_added = false;
            };

            $scope.add_machine_to_db = function () {
                var temp = $scope.process.machine;
                mcapi('/machines/new')
                    .success(function (data) {
                        mcapi('/machines/%', data.id)
                            .success(function (machine_obj) {
                                $scope.process.machine = machine_obj;
                                $scope.show_machine = $scope.process.machine.name;
                                $scope.machine_added = true;
                                $scope.myradio = 'select';
                            })
                            .error(function (e) {

                            }).jsonp();
                    })
                    .error(function (e) {

                    }).post(temp);
                $scope.useExisting = 'yes';
            };

            $scope.add_notes = function () {
                $scope.process.notes.push($scope.bk.new_note);
                $scope.bk.new_note = "";
            };

            $scope.add_run = function () {
                $scope.process.runs.push({'started': $scope.bk.start_run, 'stopped': $scope.bk.stop_run, 'error_messages': $scope.bk.new_err_msg});
                $scope.bk.new_err_msg = "";
                $scope.bk.start_run = "";
                $scope.bk.stop_run = "";
            };

            $scope.remove_run = function (index) {
                $scope.process.runs.splice(index, 1);

            };

            $scope.add_citations = function () {
                $scope.process.citations.push($scope.bk.new_citation);
                $scope.bk.new_citation = "";
            };

            $scope.done = function () {
                ProvSteps.setStepFinished('process');
            };

            $scope.init = function () {
                // Book keeping values to preserve to communicate with transcluded elements that contain an ng-model.
                $scope.bk = {
                    p_name: '',
                    start_run: '',
                    stop_run: '',
                    new_err_msg: '',
                    new_note: '',
                    new_citation: ''
                };

                $scope.process = ProvDrafts.current.attributes.process;
                console.dir($scope.process);

                $scope.useExisting = "yes";

                mcapi('/machines')
                    .success(function (data) {
                        $scope.machines_list = data;
                    }).jsonp();

                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"machine"')
                    .success(function (data) {
                        $scope.machine_template = data[0];
                        $scope.default_properties = $scope.machine_template.model.default;
                        $scope.additional_properties = $scope.machine_template.model.additional;
                    })
                    .error(function (e) {

                    }).jsonp();


                mcapi('/templates')
                    .argWithValue('filter_by', '"template_type":"process"')
                    .success(function (processes) {
                        $scope.process_templates = processes;
                        if ($scope.process.template != "") {
                            $scope.process_type = $scope.process.template.template_name;
                        }
                    })
                    .error(function () {
                        alertService.sendMessage("Unable to retrieve processes from database.");
                    }).jsonp();

            };

            $scope.init();
        }]);