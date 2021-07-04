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
  })
})

afterAll(async () => {
  await User.deleteMany({})
  mongoose.connection.close()
})