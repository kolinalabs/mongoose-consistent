const Action = require('./Action')
const DeleteConstraintError = require('./DeleteConstraintError')

class ActionRestrict extends Action {
    async supports({ config }) {
        return config.action === 'restrict'
    }

    async apply(context) {
        const { config, conditions, targetPath } = context
        throw new DeleteConstraintError({
            modelName: config.modelName,
            pathName: targetPath,
            conditions,
            onDelete: config.action,
            ...config,
        })
    }
}

module.exports = ActionRestrict
