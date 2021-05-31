class RefConstraintError extends Error {
    constructor(checker) {
        const { modelName, pathName } = checker
        const message = `Cannot delete a parent doc: ref constraint fails (${modelName}.${pathName})`
        super(message)
        this.checker = checker
    }
}

module.exports = RefConstraintError
