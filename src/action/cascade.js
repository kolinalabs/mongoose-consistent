const { arrayToDepthObject } = require('../utils')

module.exports = async ({ modelInstance, config, conditions, identifiers }) => {
    // console.log(reference)
    if (config.pathName.indexOf('.$') > 0) {
        // console.log(JSON.stringify(conditions))
        if (config.pathName.endsWith('.$')) {
            // console.log('SimpleArray')
            // console.log('CASCADE INTO SIMPLE ARRAY')
            // OK
            await modelInstance.updateMany(conditions, {
                $pull: conditions,
            })
        } else {
            /**
             * @todo
             * Testar com subdocs diferentes (dois tipos de ItemA)
             * Deve anular apenas para um dos tipos
             * TEST: OK!!!
             *
             * @todo
             * Teste com docs de maior profundidade
             */
            // console.log(
            //     'CASCADE INTO ARRAY OF SUB_DOCS'
            // )
            const pathParts = config.pathName.split('.$.')

            const criteriaObj = arrayToDepthObject(pathParts, {
                $in: identifiers,
            })

            await modelInstance.updateMany(conditions, {
                $pull: criteriaObj,
            })
        }
    } else {
        // console.log('CASCADE WITH SIMPLE PATH')
        await modelInstance.deleteMany(conditions)
    }
}
