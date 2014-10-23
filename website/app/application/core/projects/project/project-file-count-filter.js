Application.Filters.filter('projectFileCount', function() {
    return function(project) {
        if (!project) {
            return 0;
        }
        var totalFiles = 0;
        var fileCount = "";
        for (var key in project.mediatypes) {
            totalFiles += project.mediatypes[key].count;
        }
        fileCount = numberWithCommas(totalFiles);
        return fileCount;
    };
});
