Application.Services.factory("homeCustomize", homeCustomizeService);

function homeCustomizeService() {

    var service =  {
        show: function() {
            // If user is not showing this item then return false
            var isUserShowing = service.userShow(what);
            if (!isUserShowing) {
                return false;
            }

            // Otherwise check status.
            var expanded = ui.anyExpandedExcept(project.id, what);
            // if expanded is true that means something is expanded
            // besides the requested entry, so return false to show
            // this entry. Otherwise if expanded is false, that means
            // nothing is expanded so return true.
            return !expanded;
        },

        userShow: function(what) {
            switch(what) {
                case "samples":
                    return showSamples;
                case "reviews":
                    return showReviews;
                case "notes":
                    return showNotes;
                case "processes":
                    return showProcesses;
                case "files":
                    return showFiles;
                default:
                    return false;
            }
        }
    };
    return service;
}
