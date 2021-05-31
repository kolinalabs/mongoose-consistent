const RefConstraintError = require('../RefConstraintError')

module.exports = async ({ modelInstance, config, conditions, identifiers, targetPath, next }) => {
    return next(
        new RefConstraintError({
            modelName: config.modelName,
            pathName: targetPath,
            conditions,
            onDelete: config.action,
            ...config,
        })
    )
}
