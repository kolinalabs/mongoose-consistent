# mongoose-consistent  (v2)

Foreign reference check across collections with mongoose.

[![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url] [![downloads]][downloads]

Mongoose allows models from different collections to be related by some type of reference (ref, refPath, array of ObjectIds). However, document deletion operations associated with documentos from another collection, end up affecting the consistency of these relationships.

This library aims to provide mechanisms in an attempt to maintain the relational integrity between documents of different models, using their reference identifiers (_id), as well as types of action (restrict, set_null or cascade), in order to apply constraints similar to those of relational databases, however application level.

### [Check the sample project](https://github.com/kolinalabs/mongoose-consistent-sample)

# Usage

Recommended global installation only.

> Note: Configure this plugin before loading models.

```js
    const mongoose = require('mongoose')

    mongoose.plugin(require('@kolinalabs/mongoose-consistent'), {
        eventKey: 'on_delete',      // onDelete (default)
        actionDefault: 'set_null',  // restrict (default)
    })
```

## Options

| Option | default | description |
|---	|---	|---	|
| **eventKey** | onDelete | Change the configuration property on the schema |
| **actionDefault** | restrict | change the default action applied when a referral is found |

## Actions

**restrict**:

An error is thrown when attempting to delete a parent record.

```js
{
  onDelete: 'restrict'
}
```

**cascade**:

All child records are removed.

```js
{
  onDelete: 'cascade'
}
```

**set_null**:

Sets the referenced property in the children to ```null```.

```js
{
  onDelete: 'set_null'
}
```

**no_action**:

Ignore reference check.

```js
{
  onDelete: 'no_action'
}
```

**callback**:

Use a function to control the behavior of the operation.

```js
{
  onDelete(context) {
      // console.log(context)
  }
}
```

```js
// The 'context' object passed to the callback
{
  config: {
    modelName: 'ItemB',
    pathName: 'refArrayOfObjectRelated.$.itemA',
    modelRefs: ['ItemA'],
    action: 'cascade'
  },
  conditions: {
    'refArrayOfObjectRelated.itemA': {
      '$in': ['60c8e0c2cc629121ac49db5b']
    }
  },
  identifiers: ['60c8e0c2cc629121ac49db5b'],
  targetPath: 'refArrayOfObjectRelated.itemA',
  countRef: 5
}
```

**Note**

> Similar to what happens in relational databases, this configuration must occur in the child schema, corresponding to the weak side of the relationship (ex: 1:N [this side])

```js
// Author write post
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'restrict'    // cascade/set_null/no_action
    }
})
```

## Supported reference types

**ref**

```js
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'restrict'
    }
}, { timestamps: true })
```

**refPath**

```js
const CommentSchema = new mongoose.Schema({
    body: String,
    target: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: 'forModel',
        onDelete: 'set_null'
    },
    forModel: {
        type: String,
        required: true,
        enum: ['Post', 'Product']
    }
})
```

**array of ObjectId**

```js
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
        onDelete: 'cascade'
    }]
})
```

> **CHANGED!** When using the action type **cascade** in such a configuration, only the subdocument is removed from array.

> **CHANGED!** The ObjectId removed from array

>> Unlike what happens with a direct property, which is referenced in a unique way to the document, in arrays, several types of identifiers can be associated with the parent document, thus, it becomes relevant to just cancel the corresponding ids, keeping others associated with the document. , without removing it.

> When using the action type **set_null** in such a configuration, the ObjectId removed from array.

## Subdocuments

According to the mongoose documentation - **Subdocuments are documents embedded in other documents**.

This lib provides functionality so that you can treat references with subdocuments (at any level), just as it does with the common reference between first level documents.

```js

// This will be a product subdocument
const DataSheetSchema = new mongoose.Schema({
    power: Number,
    weight: Number,
    width: Number,
    height: Number
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    // tags: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'Tag',
    //     onDelete: 'restrict'
    // }],
    datasheet: DataSheetSchema  // << is here
}, { timestamps: true })

const CommentSchema = new mongoose.Schema({
    body: String,
    target: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: 'forModel',
        onDelete: 'restrict'
    },
    forModel: {
        type: String,
        required: true,
        enum: [
            'Post',
            'Product', // In addition to the standard reference to the parent document
            'Product.datasheet' // A subdocument can be used as a reference
        ]
    }
})
```

The above example uses the refPath mapping strategy, however two other forms (ref or array of ObjectIDs) are also supported.

# Configuration and behavior matrix

| Association | restrict | cascade | set_null |
|---	|---	|---	|---	|
| ref (ObjectId) | Error | document is removed | field is null |
| refPath | Error | document is removed | field is null |
| array of ObjectId | Error | document is removed | array item is removed |
| array of Subdocuments | Error | subdocument is removed | property of subdocument is null |

# Running tests

- Copy '.env.example' file to '.env'
- Configure your mongodb dsn (full) and action (restrict/cascade/set_null)
- Run 'npm test'

[travis_img]: https://travis-ci.com/kolinalabs/mongoose-consistent.svg?branch=master
[travis_url]: https://travis-ci.com/kolinalabs/mongoose-consistent
[npm_img]: https://img.shields.io/npm/v/@kolinalabs/mongoose-consistent.svg
[npm_url]: https://npmjs.com/package/@kolinalabs/mongoose-consistent
[downloads]: https://img.shields.io/npm/dw/@kolinalabs/mongoose-consistent
