Application.Controllers.controller('toolbarProjectsPageOverview',
    ["$scope", "$stateParams", "Action", function ($scope, $stateParams, Action) {
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
    }]);