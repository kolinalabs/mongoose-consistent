const setup = require('./setup')
const applyAndAssert = require('./apply-and-assert')
const { ConstraintErrorClass, constraintErrorMessage, action } = setup
const { ItemA, ItemB } = setup.models

const createItems = async () => {
    const itemA = await ItemA.create({})
    const itemB = await ItemB.create({
        refPathSample: itemA,
        modelType: 'ItemA'
    })

    return {
        itemA,
        itemB,
    }
}

const AssertFor = {
    async restrict({ itemA, itemB, error }) {
        const message = constraintErrorMessage('ItemB.refPathSample')

        const itemA2 = await ItemA.findById(itemA._id)
        const itemB2 = await ItemB.findById(itemB._id)

        expect(error).toBeInstanceOf(ConstraintErrorClass)
        expect(error.message).toBe(message)
        expect(itemA2).not.toBeNull()
        expect(itemB2).not.toBeNull()
    },
    async cascade({ itemA, itemB, error }) {
        const itemA2 = await ItemA.findById(itemA._id)
        const itemB2 = await ItemB.findById(itemB._id)

        expect(error).toBeNull()
        expect(itemA2).toBeNull()
        expect(itemB2).toBeNull()
    },
    async set_null({ itemA, itemB, error }) {
        const itemA2 = await ItemA.findById(itemA._id)
        const itemB2 = await ItemB.findById(itemB._id)

        expect(error).toBeNull()
        expect(itemA2).toBeNull()
        expect(itemB2).not.toBeNull()
        expect(itemB2.refPathSample).toBeNull()
    },
}

const assertFn = AssertFor[action]

describe(`Mapping type [ref] for action [${action}]`, () => {
    it('Using document.remove()', async () => {
        await applyAndAssert('remove', createItems, assertFn)
    })

    it('Using Model.deleteOne()', async () => {
        await applyAndAssert('deleteOne', createItems, assertFn)
    })

    it('Using Model.deleteMany()', async () => {
        await applyAndAssert('deleteMany', createItems, assertFn)
    })

    it('Using Model.findOneAndDelete()', async () => {
        await applyAndAssert('findOneAndDelete', createItems, assertFn)
    })

    it('Using Model.findOneAndRemove()', async () => {
        await applyAndAssert('findOneAndRemove', createItems, assertFn)
    })

    it('Using Model.findByIdAndDelete()', async () => {
        await applyAndAssert('findByIdAndDelete', createItems, assertFn)
    })

    it('Using Model.findByIdAndRemove()', async () => {
        await applyAndAssert('findByIdAndRemove', createItems, assertFn)
    })
})
