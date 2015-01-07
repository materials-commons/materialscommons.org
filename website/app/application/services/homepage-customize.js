Application.Services.factory("homeCustomize", [homeCustomizeService]);

function homeCustomizeService() {

    var service = {
        showReviews: true,
        showNotes: true,
        showProcesses: true,
        showFiles: true,
        showSamples: true,
        showCreateReview: false,

        setPanelState: function (what) {
            switch (what) {
                case "reviews":
                    service.showReviews = !service.showReviews;
                    break;
                case "notes":
                    service.showNotes = !service.showNotes;
                    break;
                case "processes":
                    service.showProcesses = !service.showProcesses
                    break;
                case "files":
                    service.showFiles = !service.showFiles
                    break;
                case "samples":
                    service.showSamples = !service.showSamples;
                    break;
                default:
                    return false;
            }
        },
        showPanel: function (what) {

            switch (what) {
                case "reviews":

                    return service.showReviews;
                case "notes":
                    return service.showNotes;
                case "processes":
                    return service.showProcesses;
                case "files":
                    return service.showFiles;
                case "samples":
                    return service.showSamples;
                default:
                    return false;
            }
        }
    };
    return service;
}
