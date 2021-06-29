const ConstraintError = require('./ConstraintError')

class InsertOrUpdateError extends ConstraintError {
    constructor(context) {
        const constraintName =
            `${context.parentModel}.` +
            `${context.parentKey}#` +
            `${context.childModel}.` +
            `${context.childKey}`

        const message =
            `Cannot add or update a child row:` +
            ` a foreign key constraint fails` +
            ` ('${context.dbName}'.'${context.childCollection}',` +
            ` CONSTRAINT '${constraintName}'` +
            ` FOREIGN KEY ('${context.childKey}')` +
            ` REFERENCES '${context.parentCollection}' ('${context.parentKey}'))`

        super(message)
        this.context = context
    }
}

module.exports = InsertOrUpdateError
