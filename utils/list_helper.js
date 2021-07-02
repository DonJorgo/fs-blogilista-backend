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


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}