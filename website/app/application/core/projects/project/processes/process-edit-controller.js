Application.Controllers.controller('projectEditProcess',
    ["$scope", "project", "$stateParams", "modalInstance", projectEditProcess]);

function projectEditProcess($scope, project, $stateParams,  modalInstance) {

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

    $scope.open = function(params){
        //This if and else check should go away with the new model
        if (params.ptype === 'sample'){
            params.type = params.ptype;
        }else if(params.ptype === 'file'){
            params.type = 'datafile';
        }

        modalInstance.openModal(params, project);
    };

    function init() {
        $scope.project = project;
        var i = _.indexOf($scope.project.processes, function (process) {
            return process.id === $stateParams.process_id;
        });
        if (i > -1) {
            $scope.current = $scope.project.processes[i];
            $scope.process = {
                samples: $scope.current.inputs.sample,
                files_used: $scope.current.inputs.files,
                files_produced: $scope.current.outputs.files
            };
        }
    }

    init();
}

