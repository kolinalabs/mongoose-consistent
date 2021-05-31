const detectSubPath = async (document) => {
    const parent = document.parent()
    const parentSchema = parent.schema
    for (const path of Object.keys(parentSchema.obj)) {
        if (parent[path] && typeof parent[path].id === 'function') {
            const assert = await parent[path].id(document._id)
            if (assert) {
                return path
            }
        }

        if (
            parent[path] &&
            parent[path]._id &&
            parent[path]._id.toString() === document._id.toString()
        ) {
            return path
        }
    }

    return null
}

const extractTarget = async (document) => {
    const targetRef = document.constructor.modelName
        ? [document.constructor.modelName]
        : []

    if (document.constructor.name === 'Query') {
        targetRef.push(document.model.modelName)
    }

    if (typeof document.parent === 'function') {
        const subPath = await detectSubPath(document)
        const parentPath = await extractTarget(document.parent())

        targetRef.push(...[parentPath, subPath])
    }

    return targetRef.join('.')
}

module.exports = extractTarget
