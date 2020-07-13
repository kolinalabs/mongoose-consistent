const isNested = source => {
    return (typeof source.parent === 'function') && source.parent()
}

module.exports = source => {
    const tree = []
    while(isNested(source)) {
        const lastId = source._id
        source = source.parent()

        for (const path in source.schema.paths) {
            if (['__v', '_id'].includes(path)) {
                continue
            }

            const pathValue = source[path]
            if (
                pathValue &&
                pathValue._id &&
                pathValue._id.toString() === lastId.toString()
            ) {
                tree.push(path)
                break
            }
        }
    }

    if (
        source.constructor &&
        source.constructor.modelName
    ) {
        tree.push(source.constructor.modelName)
    } else if (
        source.model &&
        source.model.modelName
    ) {
        tree.push(source.model.modelName)
    }

    return tree.reverse().join('.')
}
