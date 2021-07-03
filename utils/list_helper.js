const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = (acc, blog) => acc + blog.likes

  return blogs.reduce(sum, 0)
}

const favoriteBlog =  (blogs) => {
  const max = (max, current) => current.likes > max.likes ? current : max

  return blogs.length === 0 ? null : blogs.reduce(max)
}

const mostBlogs = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .entries()
    .map(([author, blog]) => {
      return { 'author': author, 'blogs': blog.length }
    })
    .maxBy('blogs')
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}