(function (module) {
    module.filter('transformProcesses', function () {
        return function (processes) {
            var names = [];
            processes.forEach(function(p){
                names.push(p.name);
            });
            return names.join(',  ');
        };
    });
}(angular.module('materialscommons')));