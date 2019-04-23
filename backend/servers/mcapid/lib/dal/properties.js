module.exports = function(r) {

    async function getPropertyMeasurements(propertyId) {
        return await r.table('properties').get(propertyId)
            .merge((a) => {
                return {
                    best_measure: r.branch(a('best_measure_id').eq(''), 'None',
                        r.table('best_measure_history').getAll(a('best_measure_id'))
                            .eqJoin('measurement_id', r.table('measurements')).zip().pluck('unit', 'value', 'measurement_id').nth(0),
                    ),
                    measurements: r.table('property2measurement').getAll(propertyId, {index: 'property_id'})
                        .eqJoin('measurement_id', r.table('measurements')).zip()
                        .pluck('id', 'unit', 'value')
                        .coerceTo('array'),
                };
            });
    }

    async function clearBestMeasureForProperty(propertyId) {
        await r.table('properties').get(propertyId).update({best_measure_id: ''});
        return true;
    }

    return {
        getPropertyMeasurements,
        clearBestMeasureForProperty,
    };
};