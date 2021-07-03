const mostBlogs = require('../utils/list_helper').mostBlogs

describe('most blogs', () => {

  const blogs = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    },
    {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      __v: 0
    },
    {
      _id: '5a422ba71b54a676234d17fb',
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      __v: 0
    },
    {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0
    }
  ]

  describe('when list has one blog',() => {
    const listWithOneBlog = [blogs[0]]

    test('returns author of that blog',() => {
      expect(mostBlogs(listWithOneBlog).author).toBe('Michael Chan')
    })

    test('returns blog count of 1',() => {
      expect(mostBlogs(listWithOneBlog).blogs).toBe(1)
    })
  })

  describe('for bigger list',() => {
    test('returns author with most blogs',() => {
      expect(mostBlogs(blogs).author).toBe('Robert C. Martin')
    })

    test('returns blog count of the most prolific author',() => {
      expect(mostBlogs(blogs).blogs).toBe(3)
    })
  })

  describe('with two top authors having equal amount of blogs', () => {
    const listWithEqualBlogCount = blogs.concat({
      title: 'Dummy',
      author: 'Edsger W. Dijkstra',
    })
    const expected = {
      author: expect.stringMatching(/Robert C. Martin|Edsger W. Dijkstra/)
    }
    test('returns either one of them', () => {
      expect(mostBlogs(listWithEqualBlogCount)).toMatchObject(expected)
    })

  })
})