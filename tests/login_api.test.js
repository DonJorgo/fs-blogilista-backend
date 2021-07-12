const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

const baseUrl = '/api/login'

describe('POST /api/login', () => {

  describe('when there is one user at db', () => {

    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('login_sekret', 10)
      const user = new User({
        username: 'login_api_test_username',
        name: 'login_api_test_name',
        passwordHash
      })
      await user.save()
    })

    describe('with correct credentials', () => {
      test('return json', async () => {
        await api
          .post(baseUrl)
          .send({
            username: 'login_api_test_username',
            password: 'login_sekret'
          })
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

      test('return correct properties', async () => {
        const response = await api
          .post(baseUrl)
          .send({
            username: 'login_api_test_username',
            password: 'login_sekret'
          })

        expect(response.body).toEqual({
          token: expect.any(String),
          username: 'login_api_test_username',
          name: 'login_api_test_name'
        })
      })
    })

    describe('with incorrect credentials', () => {
      test('return error message', async () => {
        const response = await api
          .post(baseUrl)
          .send({
            username: 'login_api_test_username',
            password: 'login_wrong'
          })
          .expect(401)
          .expect('Content-Type', /application\/json/)

        expect(response.body)
          .toEqual({ error: 'invalid username or password' })
      })
    })
  })
})

afterAll(async () => {
  await User.deleteMany({})
  mongoose.connection.close()
})