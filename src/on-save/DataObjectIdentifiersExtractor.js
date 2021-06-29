class DataObjectIdentifiersExtractor {
    async extract(dataObject, config) {
        const identifiers = []
        if (config.pathName.indexOf('.$') > 0) {
            if (config.pathName.endsWith('.$')) {
                const [rootField, ...restFields] = config.pathName.split('.$')
                // console.log(config.pathName, config.modelRefs, source)
                // console.log(source[rootField])
                if (Array.isArray(dataObject[rootField])) {
                    identifiers.push(...dataObject[rootField])
                }
            } else {
                /**
                 * @todo unhandled for 3 levels
                 */
                const [rootField, objField, ...restFields] =
                    config.pathName.split('.$.')
                if (Array.isArray(dataObject[rootField])) {
                    identifiers.push(
                        ...dataObject[rootField].map((i) => i[objField])
                    )
                }
            }
        } else {
            if (dataObject[config.pathName]) {
                identifiers.push(dataObject[config.pathName])
                // console.log(source, source[config.pathName])
            }
        }

        return identifiers
    }
}

module.exports = DataObjectIdentifiersExtractor
