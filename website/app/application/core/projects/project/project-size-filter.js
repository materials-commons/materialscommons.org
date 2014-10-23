Application.Filters.filter('projectSize', function() {
    return function(project) {
        if (!project) {
            return 0;
        }
        return bytesToSizeStr(project.size);
    };
});
