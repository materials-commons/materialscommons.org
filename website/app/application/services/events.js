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
                var item_date = new Date(item.mtime.epoch_time * 1000)
                item.converted_mtime = Date.UTC(item_date.getUTCFullYear(), item_date.getUTCMonth(), item_date.getUTCDate());
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
                    calendar_event.push({title: grouped_by_convertedtime[key].length , start: d});
                });
            }
            return calendar_event;
        },

        updateDate: function (project, currentdate, nextdate) {
            var today = new Date();
            var today_utc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
            if (today_utc === currentdate){
                project.date = '';
                project.nextdate = '';
            }else{
                project.date = currentdate;
                project.nextdate = nextdate;
            }
            return project;
        }
    };
    return service;
}
