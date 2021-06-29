const TargetExtractor = require('../TargetExtractor')

class ChildModelResolver {
    constructor() {
        this.targetExtractor = new TargetExtractor()
    }

    async resolve(source, sourceType) {
        const childModelName = await this.targetExtractor.extract(source)

        if (childModelName && childModelName.length > 0) {
            return childModelName
        }

        switch (sourceType) {
            case 'model':
                return source.modelName
            case 'query':
                console.log('Model name query based')
                return null
        }
    }
}

module.exports = ChildModelResolver
