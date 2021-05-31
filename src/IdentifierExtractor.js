class IdentifierExtractor {
    async extract(source) {
        if (
            source.constructor.name === 'model' ||
            // Array of ObjectIds of Subdocuments
            typeof source.parent === 'function'
        ) {
            return [source._id]
        }

        const docs = await source.model.find(source._conditions, {
            select: '_id',
        })

        return docs.map((doc) => doc._id)
    }
}

module.exports = IdentifierExtractor
