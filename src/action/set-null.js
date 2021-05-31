module.exports = async ({ modelInstance, config, conditions, identifiers, targetPath }) => {
    if (config.pathName.indexOf('.$') > 0) {
        if (config.pathName.endsWith('.$')) {
            // console.log('SET_NULL INTO SIMPLE ARRAY')
            await modelInstance.updateMany(conditions, {
                $pull: conditions,
            })
        } else {
            // console.log('SET_NULL INTO ARRAY OF SUB_DOCS')
            /**
             * @todo
             * Testar com subdocs diferentes (dois tipos de ItemA)
             * Deve anular apenas para um dos tipos
             */
            const targetPath = config.pathName.replace('.$', '.$[]')
            await modelInstance.updateMany(conditions, {
                $set: { [targetPath]: null },
            })
        }
    } else {
        // console.log('SET_NULL INTO SIMPLE PATH')
        const updateExpr = {
            $set: { [targetPath]: null },
        }

        if (config.refPath && config.refPathDefault) {
            updateExpr[config.refPath] = config.refPathDefault
        }

        await modelInstance.updateMany(conditions, updateExpr)
    }
}
