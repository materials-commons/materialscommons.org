/*@ngInject*/
function projectsAPIService(Restangular, notesAPI) {
    const projectsAPIRoute = _.partial(Restangular.one('v2').one, 'projects');

    return {

        getAllProjects: function() {
            return projectsAPIRoute().getList().then(projects => projects.plain());
        },

        deleteProject: function (projectId) {
            return projectsAPIRoute(projectId).customDELETE().then(rv => rv.plain());
        },

        getProject: function(projectId) {
            return projectsAPIRoute(projectId).get().then(p => p.plain());
        },

        getProjectV3: function (projectId) {
            return Restangular.one('v3').one('getProject').customPOST({project_id: projectId}).then(p => p.plain().data);
        },

        getActivities: function (projectId) {
            return projectsAPIRoute(projectId).one('activity_feed').get()
                .then(activities => {
                    let plainActivities = activities.plain();
                    plainActivities.forEach(a => {
                        a.birthtime = new Date(a.birthtime * 1000);
                    });
                    return plainActivities;
                });
        },

        getExcelFilePaths(projectId){
            return projectsAPIRoute(projectId).one('excel_files').get().then(
                results => {
                    console.log("getExcelFilesPaths - results", results);
                    return {'file_list': results};
                }
            )
        },

        createShortcut(projectId, directoryId) {
            return projectsAPIRoute(projectId).one('shortcuts', directoryId).put().then(d => d.plain());
        },

        deleteShortcut(projectId, directoryId) {
            return projectsAPIRoute(projectId).one('shortcuts', directoryId).customDELETE().then(d => d.plain());
        },

        createProject: function(projectName, projectDescription) {
            return Restangular.one('v2').one('projects').customPOST({
                name: projectName,
                description: projectDescription
            }).then(p => p.plain());
        },

        getProjectSamples: function(projectID) {
            return projectsAPIRoute(projectID).one('samples').getList().then(samples => samples.plain());
        },

        getProjectSample: function(projectID, sampleID) {
            return Restangular.one('sample').one('details', sampleID).get()
                .then(function(samples) {
                    let s = samples.plain();
                    return s[0];
                });
        },

        getProjectProcesses: function(projectID) {
            return projectsAPIRoute(projectID).one('processes').getList().then(processes => processes.plain());
        },

        getProjectProcess: function(projectId, processId) {
            return projectsAPIRoute(projectId).one('processes', processId).get().then(process => process.plain());
        },

        updateProjectProcess: function(projectID, process) {
            return projectsAPIRoute(projectID).one('processes', process.id).customPUT(process).then(p => p.plain());
        },

        updateProject: function(projectID, projectAttrs) {
            return projectsAPIRoute(projectID).customPUT(projectAttrs).then(p => p.plain());
        },

        createProjectProcess: function(projectID, process) {
            return projectsAPIRoute(projectID).one('processes').customPOST(process).then(p => p.plain());
        },

        getProjectDirectory: function(projectID, dirID) {
            if (!dirID) {
                return projectsAPIRoute(projectID).one('directories').get().then(d => d.plain());
            } else {
                return projectsAPIRoute(projectID).one('directories', dirID).get().then(d => d.plain());
            }
        },

        getAllProjectDirectories: function(projectId) {
            return projectsAPIRoute(projectId).one('directories', 'all').getList().then(dirs => dirs.plain());
        },

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPIRoute(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(dirs => dirs.plain());
        },

        getProjectFile: function(projectID, fileID) {
            return projectsAPIRoute(projectID).one('files', fileID).get().then(f => f.plain());
        },

        addProjectNote: function (projectId, note) {
            return notesAPI.addNote(note, 'project', projectId);
        },

        updateProjectNote: function (projectId, note) {
            return notesAPI.updateNote(note, 'project', projectId);
        },

        deleteProjectNote: function (projectId, note) {
            return notesAPI.deleteNote(note, 'project', projectId);
        }
    }
}

angular.module('materialscommons').factory('projectsAPI', projectsAPIService);

