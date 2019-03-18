const model = require('@lib/model');

module.exports = function(r) {
    const db = require('@dal/db')(r);

    async function createProcessFromTemplate(projectId, template, owner) {
        let p = new model.Process(template.name, owner, template.id, template.does_transform);
        // TODO: Fix ugly hack, template id is global_<name>, the substring removes the global_ part.
        p.process_type = template.process_type;
        p.template_name = template.id.substring(7);
        p.category = template.category;
        let proc = await addProcess(projectId, p);
        await createSetup(proc.id, template.setup);
        return proc.id;
    }

    async function addProcess(projectID, process) {
        let p = await db.insert('processes', process);
        let p2proc = new model.Project2Process(projectID, p.id);
        await db.insert('project2process', p2proc);
        return p;
    }

    async function createSetup(processID, settings) {
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];

            // Create the setting
            let s = new model.Setups(current.name, current.attribute);
            let setup = await db.insert('setups', s);

            // Associate it with the process
            let p2s = new model.Process2Setup(processID, setup.id);
            await db.insert('process2setup', p2s);

            // Create each property for the setting. Add these to the
            // setting variable so we can return a setting object with
            // all of its properties.
            // TODO: Add into an array and then batch insert into setupproperties
            let props = [];
            for (let j = 0; j < current.properties.length; j++) {
                let p = current.properties[j];
                let val = p.value;
                let prop = new model.SetupProperty(setup.id, p.name, p.description, p.attribute,
                    p.otype, val, p.unit);
                props.push(prop);
            }

            if (props.length) {
                await db.insert('setupproperties', props);
            }
        }
    }

    return {
        createProcessFromTemplate,
    };
};