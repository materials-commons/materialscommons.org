module.exports = function(r) {

    async function getPropertyMeasurements(propertyId) {
        return await r.table('properties').get(propertyId)
            .merge(() => {
                return {
                    measurements: r.table('property2measurement').getAll(propertyId, {index: 'property_id'})
                        .eqJoin('measurement_id', r.table('measurements')).zip().coerceTo('array'),
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