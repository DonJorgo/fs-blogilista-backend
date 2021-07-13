const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  await User.deleteMany({})
})

describe('GET /api/blogs', () => {
  test('returns blogs as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns correct amount of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('returns blogs with "id" property as identifier', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
      expect(blog._id).not.toBeDefined()
    })
  })

  test('returns blogs with correct user', async () => {
    const { user } = await helper.userAndBlog()

    const response = await api.get('/api/blogs')
    expect(response.body).toContainEqual(
      expect.objectContaining({ user:
        {
          id: user._id.toString(),
          name: user.name,
          username: user.username
        }
      })
    )
  })
})

describe('POST /api/blogs', () => {
  describe('given there is one user at db', () => {

    let token

    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({ username: 'root', password: 'salasana' })
      await user.save()
      token = helper.tokenForUser(user)
    })

    describe('with correct token', () => {


      test('adds a blog with correct fields', async () => {
        const newBlog = {
          title: 'new blog',
          author: 'test blogger',
          url: 'http://localhost/',
          likes: 0
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        expect(blogsAtEnd).toContainEqual(
          { ...newBlog,
            id: expect.any(String),
            user: expect.any(Object)
          })
      })


      test('sets likes to 0 by default', async () => {
        const newBlog = {
          title: 'new blog',
          author: 'test blogger',
          url: 'http://localhost/',
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(newBlog)
          .expect(201)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toContainEqual(
          { ...newBlog,
            likes: 0,
            id: expect.any(String),
            user: expect.any(Object)
          })
      })


      test('returns 400 Bad request when both title and url are missing', async () => {
        const newBlog = {
          author: 'test blogger',
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(newBlog)
          .expect(400)
      })


      test('returns 201 created when title is present and url is missing', async () => {
        const newBlog = {
          title: 'new blog',
          author: 'test blogger',
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(newBlog)
          .expect(201)
      })


      test('returns 201 created when title is missing and url is present', async () => {
        const newBlog = {
          author: 'test blogger',
          url: 'http://localhost/'
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `bearer ${token}`)
          .send(newBlog)
          .expect(201)
      })
    })

    describe('wihtout token', () => {
      test('does not add a new blog and return status 401', async () => {
        const newBlog = {
          title: 'new blog without token',
          author: 'test blogger without token',
          url: 'http://localhost/notoken',
          likes: 0
        }

        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(401)
          .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        expect(blogsAtEnd).not.toContainEqual(
          { ...newBlog,
            id: expect.any(String),
            user: expect.any(Object)
          })
      })
    })
  })
})


describe('DELETE /api/blogs/:id',  () => {
  describe('when there is one user at db', () => {

    let token

    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({ username: 'root', password: 'salasana' })
      await user.save()
      token = helper.tokenForUser(user)
    })

    test('succeeds with status code 204 with valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

      expect(blogsAtEnd).not.toContainEqual(blogToDelete)
    })

    test('fails with status code 404 for non-existing id', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .set('Authorization', `bearer ${token}`)
        .expect(404)
    })
  })
})

describe('PUT /api/blogs/:id', () => {
  test('modifies the likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const originalLikes = blogToUpdate.likes

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: originalLikes + 1 })
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toContainEqual({
      ...blogToUpdate,
      likes: originalLikes + 1
    })
  })
})

afterAll( async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  mongoose.connection.close()
})
