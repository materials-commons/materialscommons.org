Application.Filters.filter('projectFileCount', function() {
    return function(project) {
        var totalFiles = 0;
        if (!project) {
            return 0;
        }

        for (var key in project.mediatypes) {
            totalFiles += project.mediatypes[key].count;
        }

        return totalFiles;
    };
});
