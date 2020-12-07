const app = require('../src/app')

describe('App', () => {
    it(`GET / responds with 200 contining "Hello, boilerplate!"`, () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Hello, boilerplate!')
    })
})