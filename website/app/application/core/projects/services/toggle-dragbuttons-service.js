Application.Services.factory('toggleDragButton', ["pubsub",toggleDragButton]);

function toggleDragButton(pubsub) {
    var service = {
        addToReview: {
            'samples': false,
            'notes': false,
            'files': false,
            'provenance': false
        },
        toggle: function (type, button) {
            switch (type) {
                case "samples":
                    service[button].samples = !service[button].samples;
                    pubsub.send('toggle-samples.update');
                    break;
                case "notes":
                    service[button].notes = !service[button].notes;
                    pubsub.send('toggle-notes.update');
                    break;
                case "files":
                    service[button].files = !service[button].files;
                    console.log(service[button]);
                    pubsub.send('toggle-filess.update');
                    break;
                case "provenance":
                    service[button].provenance = !service[button].provenance;
                    pubsub.send('toggle-provenance.update');
                    break;
            }
        },

        get: function (type, button) {
            return service[button][type];
        }

    };

    return service;
}
