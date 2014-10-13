Application.Services.factory('ProcessList',
    ["Restangular","User",
        function (Restangular, User) {
            var service = {
                processes: {}
            }
            return {
                getProcesses: function(project_id){
                    if (service.processes.hasOwnProperty(project_id)){
                        return service.processes[project_id];
                    }else{
                        this.loadProcesses(project_id);
                    }
                },

                loadProcesses: function (project_id) {
                    Restangular.one('processes').one('project', project_id).getList().then(function(data){
                        service.processes[project_id] = data;
                        console.log(service.processes);
                        return service.processes[project_id];
                    });
                }
            }

        }]);
