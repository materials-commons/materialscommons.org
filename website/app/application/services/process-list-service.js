Application.Services.factory('ProcessList',
                             ["Restangular", "pubsub", processListService]);
function processListService(Restangular, pubsub) {
    var service = {
        processes: {}
    };

    return {
        getProcesses: function(project_id){
            if (service.processes.hasOwnProperty(project_id)){
                return service.processes[project_id];
            } else {
                this.loadProcesses(project_id);
            }
        },

        loadProcesses: function (project_id) {
            Restangular.one('processes').one('project', project_id).getList().then(function(data){
                service.processes[project_id] = data;
            });
        }
    };

}
