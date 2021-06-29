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
                    case 'updateOne':
                        dataObjects.push(...[source._update])
                        break
                    default:
                        console.log('dataObjects query based', source.op)
                        break
                }
                break
        }
        return dataObjects
    }
}

module.exports = DataObjectsExtractor
