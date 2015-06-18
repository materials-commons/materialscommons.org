Application.Controllers.controller('projectEditProcess',
    ["$scope", "project", "$stateParams", projectEditProcess]);

function projectEditProcess($scope, project, $stateParams) {

    $scope.process = {
        samples: [
            {
                name: 'We43 sample',
                measurements: [{name: 'length', value: '10cm'}, {
                    name: 'volume fraction',
                    value: '45 k'
                }, {name: 'width', value: '5cm'}],
                attachments: [{name: 'A1.txt'}, {name: 'A2.txt'}]
            },
            {
                name: 'Mg + Al sample',
                measurements: [{name: 'weight', value: '1kg'}, {
                    name: 'area fraction',
                    value: '45 sq cm'
                }, {name: 'width', value: '13cm'}]
            }
        ]
    };

    function init() {
        $scope.project = project;

        var i = _.indexOf($scope.project.processes, function (process) {
            return process.id === $stateParams.process_id;
        });
        if (i > -1) {
            $scope.current = $scope.project.processes[i];
            console.log($scope.current);
            $scope.process = {
                samples: $scope.current.inputs.sample,
                files_used: $scope.current.inputs.files,
                files_produced: $scope.current.outputs.files
            };
        }
    }

    init();
}

