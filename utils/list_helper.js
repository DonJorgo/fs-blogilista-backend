// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = (acc, blog) => acc + blog.likes

  return blogs.reduce(sum, 0)
}


module.exports = {
  dummy,
  totalLikes
}