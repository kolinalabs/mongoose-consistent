class TargetExtractor {
    async extract(source) {
        const targetRef = source.constructor.modelName
            ? [source.constructor.modelName]
            : []

        if (source.constructor.name === 'Query') {
            targetRef.push(source.model.modelName)
        }

        if (typeof source.parent === 'function') {
            const subPath = await this.detectSubPath(source)
            const parentPath = await this.extract(source.parent())

            targetRef.push(...[parentPath, subPath])
        }

        return targetRef.join('.')
    }

    async detectSubPath(document) {
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
}

module.exports = TargetExtractor
