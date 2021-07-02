const SaveConstraintChecker = require('./on-save/SaveConstraintChecker')
const DeleteConstraintChecker = require('./on-delete/DeleteConstraintChecker')

class RefConstraintChecker {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                eventKey: 'onDelete',
                actionDefault: 'restrict',
            },
            options
        )
    }

    async onDelete(source) {
        const checker = new DeleteConstraintChecker(this.options)
        await checker.check(source)
    }

    async onSave(source, extra = []) {
        const saveChecker = new SaveConstraintChecker(this.options)
        await saveChecker.check(source, extra)
    }
}

module.exports = RefConstraintChecker
