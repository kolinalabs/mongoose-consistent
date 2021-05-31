module.exports = async ({ modelInstance, config, conditions, targetPath }) => {
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
