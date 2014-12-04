Application.Services.factory('Events', ["$filter", EventsService]);

function EventsService($filter) {
    var service = {
        reviews: [],
        samples: [],
        notes: [],
        processes: [],
        grouped_notes: {},
        grouped_reviews: {},
        grouped_samples: {},
        grouped_processes: {},


        classify: function(project){
            service.reviews = $filter("byKey")(project.events, 'item_type', 'review');
            service.grouped_reviews = this.groupEventsByDate(service.reviews);

            service.samples = $filter("byKey")(project.events, 'item_type', 'sample');
            service.grouped_samples = this.groupEventsByDate(service.samples);

            service.notes = $filter("byKey")(project.events, 'item_type', 'note');
            service.grouped_notes = this.groupEventsByDate(service.notes);

            service.processes = $filter("byKey")(project.events, 'item_type', 'provenance');
            service.processes.push($filter("byKey")(project.events, 'item_type', 'draft'));
            service.processes = _.flatten(service.processes);
            service.grouped_processes = this.groupEventsByDate(service.processes);

            return service;
        },

        groupEventsByDate: function (events) {
            events.forEach(function (event) {
                var eventdate = new Date(0);
                eventdate.setUTCSeconds(event.mtime.epoch_time);
                event.converted_mtime = Date.UTC(eventdate.getUTCFullYear(), eventdate.getUTCMonth(), eventdate.getUTCDay());
            });
            //Group By date
            return $filter('groupBy')(events, 'converted_mtime');
        },

        prepareCalendarEvent: function(items) {
            var d = new Date(0);
            var calendar_event = [];
            if (items !== {}) {
                Object.keys(items).forEach(function (key) {
                    var value = items[key][0];
                    d.setUTCSeconds(value.mtime.epoch_time);
                    calendar_event.push({title: value.title, start: d});
                });
            }
            return calendar_event;
        },

        getService: function(){
            return service;
        },

        getEventsByDate: function(events, date){
            return events[date];
        }

        //viewAllEvents: function(events){
        //    events.forEach(function(event){
        //
        //    });
        //}

    };
    return service;
}
