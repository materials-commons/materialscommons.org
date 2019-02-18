class ProjectsAPIService {
    /*@ngInject*/
    constructor(Restangular, notesAPI, projectsAPIRoute, toast) {
        this.Restangular = Restangular;
        this.notesAPI = notesAPI;
        this.projectsAPIRoute = projectsAPIRoute;
        this.toast = toast;
    }

    getProjectsForUser() {
        // return this.Restangular.one('v4').one('ui').one('getProjectsForUser').customPOST().then(projects => projects.plain());
        return this.Restangular.one('v3').one('ui:getProjectsForUser').customPOST().then(projects => projects.plain().data);
    }

    getProjectOverview(projectId) {
        return this.Restangular.one('v4').one('ui').one('getProjectOverview').customPOST({project_id: projectId}).then(
            p => {
                let proj = p.plain();
                proj.shortcuts = proj.shortcuts.map(d => {
                    d.path = d.name;
                    d.name = d.name.replace(`${p.name}/`, '');
                    return d;
                });
                return proj;
            });
    }

    getProjectNotes(projectId) {
        return this.Restangular.one('v4').one('ui').one('getProjectNotes').customPOST({project_id: projectId}).then(notes => notes.plain());
    }

    getProjectAccessEntries(projectId) {
        return this.Restangular.one('v4').one('ui').one('getProjectAccessEntries').customPOST({project_id: projectId}).then(u => u.plain());
    }

    addProjectNote(projectId, note) {
        return this.notesAPI.addNote(note, 'project', projectId);
    }

    updateProjectNote(projectId, note) {
        return this.notesAPI.updateNote(note, 'project', projectId);
    }

    deleteProjectNote(projectId, note) {
        return this.notesAPI.deleteNote(note, 'project', projectId);
    }

    updateProject(projectID, projectAttrs) {
        return this.projectsAPIRoute(projectID).customPUT(projectAttrs).then(p => p.plain());
    }

    //////////////////////////// Check if these calls are being used ////////////////////////////////////
    getAllProjects() {
        return this.projectsAPIRoute().getList().then(projects => projects.plain());
    }

    deleteProject(projectId) {
        return this.projectsAPIRoute(projectId).customDELETE().then(rv => rv.plain());
    }

    getProject(projectId) {
        return this.projectsAPIRoute(projectId).get().then(p => p.plain());
    }

    getProjectV3(projectId) {
        return this.Restangular.one('v3').one('getProject').customPOST({project_id: projectId}).then(p => p.plain().data);
    }

    getActivities(projectId) {
        return this.projectsAPIRoute(projectId).one('activity_feed').get().then(
            activities => {
                let plainActivities = activities.plain();
                plainActivities.forEach(a => {
                    a.birthtime = new Date(a.birthtime * 1000);
                });
                return plainActivities;
            }
        );
    }

    getExcelFilePaths(projectId) {
        return this.projectsAPIRoute(projectId).one('excel_files').get().then(
            results => {
                return {'file_list': results};
            }
        );
    }

    createShortcut(projectId, directoryId) {
        return this.projectsAPIRoute(projectId).one('shortcuts', directoryId).put().then(d => d.plain());
    }

    deleteShortcut(projectId, directoryId) {
        return this.projectsAPIRoute(projectId).one('shortcuts', directoryId).customDELETE().then(d => d.plain());
    }

    createProject(projectName, projectDescription) {
        return this.Restangular.one('v2').one('projects').customPOST({
            name: projectName,
            description: projectDescription
        }).then(p => p.plain());
    }

    getProjectSamples(projectID) {
        return this.projectsAPIRoute(projectID).one('samples').getList().then(samples => samples.plain());
    }

    getProjectSample(projectID, sampleID) {
        return this.Restangular.one('sample').one('details', sampleID).get()
            .then(function(samples) {
                let s = samples.plain();
                return s[0];
            });
    }

    getProjectProcesses(projectID) {
        return this.projectsAPIRoute(projectID).one('processes').getList().then(processes => processes.plain());
    }

    getProcessesForProject(projectId) {
        return this.Restangular.one('v3').one('getProcessesForProject').customPOST({project_id: projectId}).then(
            processes => processes.plain().data,
            e => this.toast.error(e.error)
        );
    }

    getSamplesForProject(projectId) {
        return this.Restangular.one('v3').one('getSamplesForProject').customPOST({project_id: projectId}).then(
            samples => samples.plain().data,
            e => this.toast.error(e.error)
        );
    }

    getProcessForProject(projectId, processId) {
        return this.Restangular.one('v3').one('getProcessForProject').customPOST({project_id: projectId, process_id: processId}).then(
            process => process.plain().data,
            e => this.toast.error(e.error)
        );
    }

    getProjectProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get().then(process => process.plain());
    }

    updateProjectProcess(projectID, process) {
        return this.projectsAPIRoute(projectID).one('processes', process.id).customPUT(process).then(p => p.plain());
    }

    createProjectProcess(projectID, process) {
        return this.projectsAPIRoute(projectID).one('processes').customPOST(process).then(p => p.plain());
    }

    getProjectDirectory(projectID, dirID) {
        if (!dirID) {
            return this.projectsAPIRoute(projectID).one('directories').get().then(d => d.plain());
        } else {
            return this.projectsAPIRoute(projectID).one('directories', dirID).get().then(d => d.plain());
        }
    }

    getAllProjectDirectories(projectId) {
        return this.projectsAPIRoute(projectId).one('directories', 'all').getList().then(dirs => dirs.plain());
    }

    createProjectDir(projectID, fromDirID, path) {
        return this.projectsAPIRoute(projectID).one('directories').customPOST({
            from_dir: fromDirID,
            path: path
        }).then(dirs => dirs.plain());
    }

    getProjectFile(projectID, fileID) {
        return this.projectsAPIRoute(projectID).one('files', fileID).get().then(f => f.plain());
    }
}

angular.module('materialscommons').service('projectsAPI', ProjectsAPIService);
