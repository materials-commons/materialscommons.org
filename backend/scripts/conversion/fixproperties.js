#!/usr/bin/env node

"use strict";

var ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

console.log(ropts);
var r = require('rethinkdbdash')(ropts);
var bluebird = require('bluebird');

function SetupProperty(setupID, name, description, attribute, _type, value, unit) {
    this.setup_id = setupID;
    this.name = name;
    this.description = description;
    this.attribute = attribute;
    this._type = _type;
    this.value = value;
    this.unit = unit;
}

function* fixSetup(setupId, settings) {
    for (let i = 0; i < settings.length; i++) {
        let current = settings[i];
        // Create each property for the setting. Add these to the
        // setting variable so we can return a setting object with
        // all of its properties.
        for (let j = 0; j < current.properties.length; j++) {
            let p = current.properties[j].property;
            let val = p.value;
            let prop = new SetupProperty(setupId, p.name, p.description, p.attribute,
                p._type, val, p.unit);
            yield r.table('setupproperties').insert(prop);
        }
    }
}

bluebird.coroutine(function*() {
    try {
        var processes = yield r.db("materialscommons").table('processes')
            .eqJoin('id', r.db('materialscommons').table('process2setup'), {index: 'process_id'}).zip()
            .merge(function(p) {
                return {
                    properties: r.db('materialscommons').table('setupproperties')
                        .getAll(p('setup_id'), {index: 'setup_id'}).count()
                }
            }).filter(r.row('properties').eq(0));
        for (let i = 0; i < processes.length; i++) {
            let p = processes[i];
            console.log("Adding setup for " + p.name + "/" + p.process_id);
            let template = yield r.table('templates').get(p.template_id);
            yield * fixSetup(p.setup_id, template.setup);
            console.log("Done.")
        }
        console.log("Finished with updates, exiting...");
        process.exit(0);
    } catch (err) {
        console.log(err);
    }
})();


