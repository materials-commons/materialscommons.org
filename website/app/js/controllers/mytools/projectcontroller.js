function ProjectController($scope, $stateParams, Stater, mcapi, $state, watcher) {
    $scope.project_id = $stateParams.id;
    $scope.bk = {
        action: ''
    };
    watcher.watch($scope, 'bk.action', function (choice) {
        console.log("choice = '" + choice + "'");
        if (choice === 'prov') {
            Stater.newId("prov", "create prov", "", function (status, state) {
                if (status) {
                    $scope.state = state;
                    $scope.state.attributes.process = {};
                    //wizard.fireStep('nav_choose_process');
                    $state.go('mytools.projects.provenance');
                }
            });

        }
    });
    $scope.init = function () {
        mcapi('/projects/%', $scope.project_id)
            .success(function (project) {
                $scope.project = project;
                $state.go('mytools.projects.overview');
            }).jsonp();
    };

    $scope.init();
}

function ProvController($scope, $state) {
    $scope.isCurrentStep = function (step) {
        return $scope.currentStep === step;
    }

    $scope.init = function() {
        $scope.currentStep = 'process';
        $scope.processSaved = false;
        $scope.inputsSaved = false
        $scope.outputsSaved = false;
        $state.go('mytools.projects.provenance.process');
    }

    $scope.init();
}

function ProjectOverviewController($scope, $stateParams, mcapi) {
    $scope.project_id = $stateParams.id;
    $scope.processes = [];
    $scope.init = function () {
        /*
         ** Figure out how we are going to display the processes.
         */
//        mcapi('/processes/project/%s', $scope.project_id)
//            .success(function(data) {
//                $scope.processes = $scope.process(data);
//            });
    };

    $scope.process = function (processes) {
        var temp_proc = {};
        var tree_p;
        processes.forEach(function (pr) {
            var temp = pr.template;
            if (temp in temp_proc) {
                temp_proc[temp].push(pr);
            }
            else {
                temp_proc[temp] = new Array();
                temp_proc[temp].push(pr);
            }

        });

        tree_p = $scope.convert_into_tree(temp_proc);
        return tree_p
    };

    $scope.convertToTree = function (data) {
        var tree = [];
        var count = 0;
        var processes = data;
        var all_templates = Object.keys(data);
        var new_templates = all_templates.filter(function (v) {
            return v !== ''
        });
        new_templates.forEach(function (d) {
            var template_name = '';
            $scope.all_templates.forEach(function (item) {
                if (item.id == d) {
                    template_name = item.template_name;
                }
            })
            var template = {"id": d, "name": template_name};
            count = count + 1;
            template['c_id'] = count.toString();
            template['parent_id'] = '';
            tree.push(template);
            var list_processes = processes[d]
            tree, count = $scope.iterate_process(count, list_processes, template, tree)
        });
        return tree
    };

    $scope.init();
}