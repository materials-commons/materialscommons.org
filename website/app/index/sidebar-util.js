Application.Services.factory("sidebarUtil", sidebarUtilService);

function sidebarUtilService() {
    return {
        projectSize: function(project) {
            if (!('projectSize' in project)) {
                project.projectSize = bytesToSizeStr(project.size);
            }
            return project.projectSize;
        },

        projectFileCount: function(project) {
            if (!('fileCount' in project)) {
                var totalFiles = 0;
                for (var key in project.mediatypes) {
                    totalFiles += project.mediatypes[key].count;
                }
                project.fileCount = numberWithCommas(totalFiles);
            }
            return project.fileCount;
        }
    };
}
