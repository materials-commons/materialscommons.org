// Get all attributes for a process
r.db('samplesdb').table("processes")
    .getAll("a8849140-e67c-4915-95fb-0735e3f908ec")
    .merge(function(proc) {
        return {
            attributes: r.db("samplesdb").table("attribute2process")
                .getAll(proc('id'), {index: "process_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .coerceTo("array")
        };
    });


// Get all attributes for a sample
// Assumption: A sample only ever has one active attribute set.
r.db('samplesdb').table("samples")
    .getAll("ecace6b3-1006-4718-b44f-f9ce3e350fcc")
    .eqJoin("id", r.db("samplesdb").table("sample2attribute_set"), {index: "sample_id"})
    .zip()
    .filter({current: true})
    .merge(function(aset) {
        return {
            attributes: r.db("samplesdb").table("attribute_set2attribute")
                .getAll(aset('attribute_set_id'), {index: "attribute_set_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .coerceTo("array")
        };
    });
