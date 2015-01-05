Application.Services.factory("homeCustomize", homeCustomizeService);

function homeCustomizeService() {

    var service = {
        showReviews: true,
        showNotes: true,
        showProcesses: true,
        showFiles: true,
        showSamples: true,

        setInfoBox: function (what) {
            switch (what) {
                case "reviews":
                    if (service.showReviews === true) {
                        service.showReviews = false;
                    } else {
                        service.showReviews = true;
                    }
                    break;
                case "notes":
                    if (service.showNotes === true) {
                        service.showNotes = false;
                    } else {
                        service.showNotes = true;
                    }
                    break;
                case "processes":
                    if (service.showProcesses === true) {
                        service.showProcesses = false;
                    } else {
                        service.showProcesses = true;
                    }
                    break;
                case "files":
                    if (service.showFiles === true) {
                        service.showFiles = false;
                    } else {
                        service.showFiles = true;
                    }
                    break;
                case "samples":
                    if (service.showSamples === true) {
                        service.showSamples = false;
                    } else {
                        service.showSamples = true;
                    }
                    break;
                default:
                    return false;
            }
        },
        getInfoBox: function (what) {
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
