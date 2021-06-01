const RefConstraintError = require('../RefConstraintError')

module.exports = async ({ config, conditions, targetPath }) => {
    throw new RefConstraintError({
        modelName: config.modelName,
        pathName: targetPath,
        conditions,
        onDelete: config.action,
        ...config,
    })
}
