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
    .map(([author, authorBlogs]) => {
      return { 'author': author, 'blogs': authorBlogs.length }
    })
    .maxBy('blogs')
}

const mostLikes = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .entries()
    .map(([author, authorBlogs]) => {
      return { 'author': author, 'likes': _(authorBlogs).sumBy('likes') }
    })
    .maxBy('likes')
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}