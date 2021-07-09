const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')


describe('when there is initially one user at db', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  describe('GET /api/users', () => {
    test('return json', async () => {
      await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    })

    test('return the correct user', async () => {
      const response = await api.get('/api/users')

      expect(response.body).toHaveLength(1)
      expect(response.body).toContainEqual({
        id: expect.any(String),
        username: 'root'
      })

    })
  })


  describe('POST /api/users', () => {

    test('creates a new user with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'testeri',
        password: 'salasana',
        name: 'Test User',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('does not create new user without username', async () => {
      await postFails({
        password: 'salasana',
        name: 'Test User'
      }, '`username` is required')
    })

    test('does not create new user with too short username', async () => {
      await postFails({
        username: 'te',
        password: 'salasana',
        name: 'Test User'
      }, '`username` (`te`) is shorter than the minimum allowed length')
    })

    test('does not create new user with existing username', async () => {
      await postFails({
        username: 'root',
        password: 'salasana',
        name: 'Test User'
      }, 'expected `username` to be unique')
    })

    test('does not create new user without password', async () => {
      await postFails({
        username: 'testeri',
        name: 'Test User'
      }, 'invalid password')
    })

    test('does not create new user with too short password', async () => {
      await postFails({
        username: 'testeri',
        password: 'sa',
        name: 'Test User'
      }, 'invalid password')
    })

    const postFails = async (invalidUser, message) => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain(message)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    }


  })
})

afterAll(async () => {
  await User.deleteMany({})
  mongoose.connection.close()
})