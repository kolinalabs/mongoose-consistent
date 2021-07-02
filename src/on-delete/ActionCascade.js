const Action = require('./Action')
const { arrayToDepthObject } = require('../utils')

class ActionCascade extends Action {
    async supports({ config }) {
        return config.action === 'cascade'
    }

    async apply(context) {
        const { modelInstance, config, conditions, identifiers } = context
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
}

module.exports = ActionCascade
