Application.Services.factory('Events',  ['$filter', EventsService]);

function EventsService($filter) {
    var service = {
        date: '',

        addConvertedTime: function (project) {
            project.reviews = service.update(project.open_reviews);
            project.samples = service.update(project.samples);
            project.processes = service.update(project.processes);
            project.notes = service.update(project.notes);
            project.drafts = service.update(project.drafts);
            return project;
        },

        update: function (items) {
            items.forEach(function (item) {
                var item_date = new Date(0);
                item_date.setUTCSeconds(item.mtime.epoch_time);
                item.converted_mtime = Date.UTC(item_date.getUTCFullYear(), item_date.getUTCMonth(), item_date.getUTCDay());
            });
            return items;
        },

        prepareCalendarEvent: function (items) {
            var calendar_event = [];
            if (items.length !== 0) {
                var grouped_by_convertedtime = $filter('groupBy')(items, 'converted_mtime');
                Object.keys(grouped_by_convertedtime).forEach(function (key) {
                    var d = new Date(0);
                    var value = grouped_by_convertedtime[key][0];
                    d.setUTCSeconds(value.mtime.epoch_time);
                    calendar_event.push({title: value.title, start: d});
                });
            }
            return calendar_event;
        },

        updateDate: function (project, date) {
            project.date = date;
            return project;
        }
    };
    return service;
}
