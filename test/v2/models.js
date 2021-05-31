const mongoose = require('mongoose')

const EVENT_KEY = 'onDelete'
const ACTION = process.env.ACTION || 'restrict'

const ItemASchema = new mongoose.Schema({
    name: {
        type: String,
        default() {
            return `Item A ${Math.random()}`
        },
    },
})

const ObjectRelatedSchema = new mongoose.Schema({
    token: {
        type: String,
        default() {
            return Math.random()
        },
    },
    itemA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemA',
        [EVENT_KEY]: ACTION,
    },
})

const SingleNestedSchema = new mongoose.Schema({
    token: {
        type: String,
        default() {
            return Math.random()
        },
    },
})

const ItemBSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Side B',
    },
    refItemA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemA',
        [EVENT_KEY]: ACTION,
    },
    refPathSample: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'modelType',
        [EVENT_KEY]: ACTION,
    },
    modelType: {
        type: String,
        required: true,
        default: 'None',
        enum: ['Product', 'ItemA', 'None'],
    },
    refArrayOfObjectIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ItemA',
            [EVENT_KEY]: ACTION,
        },
    ],
    refArrayOfObjectRelated: [
        {
            type: ObjectRelatedSchema,
        },
    ],
    singleNested: SingleNestedSchema,
    arrayNested: [SingleNestedSchema],
})

const ItemCSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Side C',
    },
    singleNestedB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemB.singleNested',
        [EVENT_KEY]: ACTION,
    },
    arrayNestedB: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ItemB.arrayNested',
            [EVENT_KEY]: ACTION,
        },
    ],
    layerArray: [
        {
            layer2Array: {
                layer3Array: {
                    layer4Array: {
                        layer5Array: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'ItemA',
                            [EVENT_KEY]: ACTION,
                        },
                    },
                },
            },
        },
    ],
    layerObject: {
        layer2Object: {
            layer3Object: {
                layer4Object: {
                    layer5Object: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'ItemA',
                        [EVENT_KEY]: ACTION,
                    },
                },
            },
        },
    },
})

const ItemDSchema = new mongoose.Schema({
    name: String,
})

const ItemA = mongoose.model('ItemA', ItemASchema, 'item_a')
const ItemB = mongoose.model('ItemB', ItemBSchema, 'item_b')
const ItemC = mongoose.model('ItemC', ItemCSchema, 'item_c')
const ItemD = mongoose.model('ItemD', ItemDSchema, 'item_d')

module.exports = {
    ItemA,
    ItemB,
    ItemC,
    ItemD,
}
