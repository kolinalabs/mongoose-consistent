const mongoose = require('mongoose')

mongoose.connect(
    'mongodb://localhost:27017/mongoose_consistent',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    function (error) {
        console.log(error ? `MongoError: ${error.message}` : 'MongoConnected')
    }
)

mongoose.plugin(require('./__plugin'), {
    // eventKey: 'deleting',
    // actionDefault: 'restrict'
    // actionDefault: function(args) {
    //     console.log('FN...', args)
    // }
})

const { SideA, SideB, SideC } = require('./FullMapping')

const dynamicScenario = async () => {
    const sideA = await SideA.create({})
    const sideB = await SideB.create({ refSideA: sideA })
    // const sideB = await SideB.create({
    //     refPathSample: sideA,
    //     modelType: 'SideA'
    // })
    // const sideB = await SideB.create({
    //     refArrayOfObjectIds: [sideA]
    // })
    // Not working
    // const sideB = await SideB.create({
    //     refArrayOfObjectRelated: [{ sideA }, { sideA }, { sideA }],
    // })
    // const sideB = await SideB.create({
    //     singleNested: {},
    //     arrayNested: [{}, {}]
    // })
    // console.log({ sideB })
    // const sideC = await SideC.create({
    //     singleNestedB: sideB.singleNested
    // })
    // const sideC = await SideC.create({
    //     arrayNestedB: [sideB.singleNested]
    // })
    // console.log({ sideC })
    // const sideC = await SideC.create({
    //     singleNestedB: sideB.singleNested
    // })
    // console.log(sideC)
    try {
        // await sideB.remove()
        await sideA.remove()
        // await SideA.deleteOne({ _id: sideA._id })
        // await SideA.deleteMany({ _id: { $in: sideA } })
        // console.log('Removed!!!')
    } catch (e) {
        console.log(e.message)
    }
}

dynamicScenario()
