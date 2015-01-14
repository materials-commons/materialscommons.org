Application.Services.factory("homeCustomize", [homeCustomizeService]);

function homeCustomizeService() {

    var service = {
        showReviews: true,
        showNotes: true,
        showProcesses: true,
        showFiles: true,
        showSamples: true,
        showCreateReview: false

    };
    return service;
}
