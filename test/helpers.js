const faker = require('faker')

const makeAuthorData = (multiple = false) => {
    if (!multiple) {
        return {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            phone: faker.phone.phoneNumber()
        }
    }
    const data = []
    for (let i = 0; i < multiple; i++) {
        data.push(makeAuthorData())
    }

    return data
}

const makePostData = (author, multiple = false) => {
    if (!multiple) {
        return {
            title: faker.lorem.sentence(),
            content: faker.lorem.text(),
            author
        }
    }

    const data = []
    for (let i = 0; i < multiple; i++) {
        data.push(makePostData(author))
    }

    return data
}

module.exports = {
    makeAuthorData,
    makePostData
}
