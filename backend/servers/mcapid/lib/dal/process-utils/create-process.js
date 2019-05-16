/*
 * This module takes care of creating new processes. In particular it needs to create the
 * set of process setup properties. A process setup property describes something about the
 * process. For example a heat treatment process may have time and temperature properties.
 * These setup properties are broken into sections, thus a process has multiple setup
 * sections where each section can have multiple properties.
 *
 * This setup is represented in the database using the following sets of tables:
 *    processes - This contains basic information about a process such as its name, template, etc..
 *    setups - This is the different sections
 *    process2setup - This maps a process back to each of its setup "sections"
 *    setupproperties - A setup property that maps to a particular setup.
 *
 * Thus to get all the setup properties for a process you have to do the following -
 *    r.table('processes').get('<process-id>')  -- Get the process
 *        .eqJoin('id', r.table('process2setup'), {index: 'process_id'}).zip() -- Map to setups
 *        .eqJoin('setup_id', r.table('setups')).zip() -- Get each setup
 *        .merge(s => {
 *            return {
 *                properties: r.table('setupproperties').getAll(s('setup_id'), {index: 'setup_id'}).coerceTo('array')
 *            }
 *        })
 */

const model = require('@lib/model');

module.exports = function(r) {
    const db = require('@dal/db')(r);

    async function createProcessFromTemplate(projectId, template, name, owner, processType) {
        let p = new model.Process(name, owner, template.id, template.does_transform, processType);
        // TODO: Fix ugly hack, template id is global_<name>, the substring removes the global_ part.
        p.process_type = template.process_type;
        p.template_name = template.id.substring(7);
        p.category = template.category;
        let proc = await addProcess(projectId, p);
        await createSetup(proc.id, template.setup);
        return proc.id;
    }

    async function addProcess(projectId, process) {
        let p = await db.insert('processes', process);
        let p2proc = new model.Project2Process(projectId, p.id);
        await db.insert('project2process', p2proc);
        return p;
    }

    async function createSetup(processId, settings) {
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];

            // Create the setting
            let s = new model.Setups(current.name, current.attribute);
            let setup = await db.insert('setups', s);

            // Associate it with the process
            let p2s = new model.Process2Setup(processId, setup.id);
            await db.insert('process2setup', p2s);

            // Create each property for the setting. Add these to the
            // setting variable so we can return a setting object with
            // all of its properties.
            let props = [];
            for (let j = 0; j < current.properties.length; j++) {
                let p = current.properties[j];
                let val = p.value;
                let prop = new model.SetupProperty(setup.id, p.name, p.description, p.otype, val, p.unit);
                props.push(prop);
            }

            if (props.length) {
                await db.insert('setupproperties', props);
            }
        }
    }

    // addSetupParams adds a new set of setup parameters. Setups are divided into "sections",
    // a setup where each setup has a name/attribute pair. A process can have multiple of
    // these sections. The setup parameters are associated with these setup sections. This
    // function will create the section if it doesn't exist.
    async function addSetupParams(name, attribute, properties, processId) {
        let setup = await findMatchingSetup(processId, name);
        if (!setup) {
            setup = await db.insert('setups', new model.Setups(name, attribute));
            await db.insert('process2setup', new model.Process2Setup(processId, setup.id));
        }

        if (properties) {
            let toInsert = properties.map(prop => {
                if (!prop.description) prop.description = '';
                if (!prop.unit) prop.unit = '';
                return new model.SetupProperty(setup.id, prop.name, prop.description, prop.otype, prop.value, prop.unit);
            });

            await r.table('setupproperties').insert(toInsert);
        }
        return true;
    }

    async function findMatchingSetup(processId, name) {
        let matches = await r.table('process2setup')
            .getAll(processId, {index: 'process_id'})
            .eqJoin('setup_id', r.table('setups')).zip()
            .filter({name: name});
        // matches is either empty or an array of 1 entry.
        if (matches.length) {
            // found a match
            return matches[0];
        }

        return null;
    }

    return {
        createProcessFromTemplate,
        addSetupParams,
    };
};