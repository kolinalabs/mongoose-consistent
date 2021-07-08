class DataObjectsExtractor {
    async extract(source, sourceType, extra = []) {
        const dataObjects = []
        switch (sourceType) {
            case 'document':
                dataObjects.push(source)
                break
            case 'model':
                dataObjects.push(...extra[1])
                break
            case 'query':
                switch (source.op) {
                    case 'update':
                    case 'updateOne':
                    case 'updateMany':
                    case 'findOneAndUpdate':
                    case 'findOneAndReplace':
                    case 'replaceOne':
                        dataObjects.push(...[source._update])
                        break
                    default:
                        console.warn('dataObjects query based', source.op, ' is unsupported')
                        break
                }
                break
        }
        return dataObjects
    }
}

module.exports = DataObjectsExtractor
