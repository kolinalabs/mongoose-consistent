const { arrayToDepthObject } = require('../utils')

module.exports = async ({ modelInstance, config, conditions, identifiers }) => {
    if (config.pathName.indexOf('.$') > 0) {
        if (config.pathName.endsWith('.$')) {
            await modelInstance.updateMany(conditions, {
                $pull: conditions,
            })
        } else {
            const pathParts = config.pathName.split('.$.')

            const criteriaObj = arrayToDepthObject(pathParts, {
                $in: identifiers,
            })

            await modelInstance.updateMany(conditions, {
                $pull: criteriaObj,
            })
        }
    } else {
        await modelInstance.deleteMany(conditions)
    }
}
