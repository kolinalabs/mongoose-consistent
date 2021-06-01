const { ItemA, ItemB } = require('./models')

module.exports = async (method, createItems, assertFn) => {
    let error = null
    const { itemA, itemB } = await createItems()

    try {
        switch (method) {
            case 'remove':
                await itemA.remove()
                break
            case 'deleteOne':
            case 'deleteMany':
                await ItemA[method]({})
                break
            case 'findOneAndDelete':
            case 'findOneAndRemove':
                await ItemA[method]({ _id: itemA._id })
                break
            case 'findByIdAndDelete':
            case 'findByIdAndRemove':
                await ItemA[method](itemA._id)
                break
        }
    } catch (e) {
        error = e
    }

    await assertFn({
        itemA,
        itemB,
        error,
    })
}
