angular.module('materialscommons').factory('Events', EventsService);

function EventsService($filter) {
    'ngInject';

    function update(items) {
        items.forEach(function(item) {
            var item_date = new Date(item.mtime.epoch_time * 1000);
            item.converted_mtime = Date.UTC(item_date.getUTCFullYear(), item_date.getUTCMonth(), item_date.getUTCDate());
        });
        return items;
    }

    return {
        addConvertedTime: function(project) {
            project.reviews = update(project.reviews);
            project.samples = update(project.samples);
            project.processes = update(project.processes);
            project.notes = update(project.notes);
            project.drafts = update(project.drafts);
            return project;
        },

        prepareCalendarEvent: function(items, title) {
            var calendar_event = [];
            if (items.length !== 0) {
                var groupedByConvertedTime = $filter('groupBy')(items, 'converted_mtime');
                Object.keys(groupedByConvertedTime).forEach(function(key) {
                    var d = new Date(0);
                    var value = groupedByConvertedTime[key][0];
                    d.setUTCSeconds(value.mtime.epoch_time);
                    var tooltip = groupedByConvertedTime[key].map(function(e) {return e.name;}).join('\n');
                    calendar_event.push({
                        title: groupedByConvertedTime[key].length + " " + title,
                        start: d,
                        description: '',
                        tooltip: tooltip
                    });
                });
            }
            return calendar_event;
        },

        updateDate: function(project, currentdate, nextdate) {
            var today = new Date();
            var today_utc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
            if (today_utc === currentdate) {
                project.date = '';
                project.nextdate = '';
            } else {
                project.date = currentdate;
                project.nextdate = nextdate;
            }
            return project;
        }
    }
}