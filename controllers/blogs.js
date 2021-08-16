const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 })
    .populate('comments', { content: 1 , id: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'unauthorized user' })
  }

  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  const populatedBlog = await Blog
    .findById(savedBlog._id)
    .populate('user', { username: 1, name: 1, id: 1 })
    .populate('comments', { content: 1, id: 1 })
  response.status(201).json(populatedBlog)
})


blogRouter.delete('/:id', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).end()
  }

  const blog = await Blog.findById(request.params.id)
  if (blog && blog.user && blog.user.toString() !== user._id.toString()) {
    return response.status(401).end()
  }

  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  const status = deletedBlog ? 204 : 404
  response.status(status).end()
})


blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new:true })
    .populate('user', { username: 1, name: 1, id: 1 })
    .populate('comments', { content: 1, id: 1 })
  response.json(updatedBlog.toJSON())
})


blogRouter.post('/:id/comments', async (request, response) => {
  const comment = new Comment({ content: request.body.comment })

  const savedComment = await comment.save(comment)

  await Blog.findByIdAndUpdate(
    request.params.id,
    { $push: { comments: savedComment._id } },
    { new: true }
  )

  response.status(201).json(savedComment)
})

module.exports = blogRouter