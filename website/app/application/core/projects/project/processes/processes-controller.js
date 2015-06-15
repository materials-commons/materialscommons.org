Application.Controllers.controller('projectProcesses',
    ["project", projectProcesses]);

function projectProcesses(project) {
    this.all = project.processes;
}
