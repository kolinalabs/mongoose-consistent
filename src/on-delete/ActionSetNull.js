const Action = require('./Action')

class ActionSetNull extends Action {
    async supports({ config }) {
        return config.action === 'set_null'
    }

    async apply(context) {
        const { modelInstance, config, conditions, targetPath } = context
        if (config.pathName.indexOf('.$') > 0) {
            if (config.pathName.endsWith('.$')) {
                await modelInstance.updateMany(conditions, {
                    $pull: conditions,
                })
            } else {
                const targetPath = config.pathName.replace('.$', '.$[]')
                await modelInstance.updateMany(conditions, {
                    $set: { [targetPath]: null },
                })
            }
        } else {
            const updateExpr = {
                $set: { [targetPath]: null },
            }

            if (config.refPath && config.refPathDefault) {
                updateExpr[config.refPath] = config.refPathDefault
            }

            await modelInstance.updateMany(conditions, updateExpr)
        }
    }
}

module.exports = ActionSetNull
