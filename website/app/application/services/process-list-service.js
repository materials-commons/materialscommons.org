Application.Services.factory('ProcessList',
                             ["Restangular", "$q", processListService]);
function processListService(Restangular, $q) {
    var service = {
        processes: {}
    };

    return {
        getProcesses: function(project_id){
            var deffered = $q.defer();
            var pid = project_id;
            if (service.processes.hasOwnProperty(project_id)){
                deffered.resolve(service.processes[project_id]);
            } else {
                Restangular.one('processes').one('project', project_id)
                    .getList().then(function(processes){
                        service.processes[pid] = processes;
                        deffered.resolve(service.processes[pid]);
                    });
            }
            return deffered.promise;
        }
    };
}
