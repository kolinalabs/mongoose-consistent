# mongoose-consistent

Foreign reference check across collections with mongoose.

[![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

Mongoose allows models from different collections to be related by some type of reference (ref, refPath, array of ObjectIds). However, document deletion operations associated with documentos from another collection, end up affecting the consistency of these relationships.

This library aims to provide mechanisms in an attempt to maintain the relational integrity between documents of different models, using their reference identifiers (_id), as well as types of action (restrict, set_null or cascade), in order to apply constraints similar to those of relational databases, however application level.

# Usage

Install globally or on a specific schema.

```js
    // globally
    const mongoose = require('mongoose')

    mongoose.plugin(require('@kolinalabs/mongoose-consistent'))

    // or specific schema
    MySchema.plugin(require('@kolinalabs/mongoose-consistent'))
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
        onDelete: 'restrict'    // 'cascade' or 'no_action' (default)
    }
})
```

## Supported action types

**restrict**: An error is thrown when attempting to delete a parent record related to a child record.

**Note**
> When using **deleteMany** with actionType **restrict**, if only one of the documents is related to another record, the error is thrown and none of the deletion operations occur.

**cascade**: All child records are removed.

**set_null**: Sets the referenced property in the children to 'null'

**no_action (default)**: Ignore reference check.

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

> When using the action type **cascade** in such a configuration, the entire document is removed.

> When using the action type **set_null** in such a configuration, the ObjectId removed from array.

## Subdocuments (0.1.7+)

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

# Running tests

- Copy '.env.example' file to '.env'
- Configure your mongodb dsn (full)
- Run 'npm test'

[travis_img]: https://travis-ci.org/kolinalabs/mongoose-consistent.svg?branch=master
[travis_url]: https://travis-ci.org/kolinalabs/mongoose-consistent
[npm_img]: https://img.shields.io/npm/v/@kolinalabs/mongoose-consistent.svg
[npm_url]: https://npmjs.com/package/@kolinalabs/mongoose-consistent
