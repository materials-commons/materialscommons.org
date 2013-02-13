#!/usr/local/bin/node
#
# Quick script to delete all documents in the all_experiments view.
# TODO: Extend functionality to work with any view.
#

var request = require('/usr/local/lib/node_modules/request');

request.get({url:'http://localhost:5984/materialscommons/_design/materialscommons-app/_view/all_experiments', json:true},
        function(err, req, body)
        {
            for (i = 0; i < body.rows.length; i++)
            {
                id = body.rows[i].id;
                rev = body.rows[i].value._rev;
                request.del('http://localhost:5984/materialscommons/'+id+"?rev="+rev);
            }
            //console.log(body);
        });
