// UTILITY CLASS TO REFACTOR OUR CODE
class APIFeatures {
  constructor(mongooseQuery, expressQuery) {
    this.mongooseQuery = mongooseQuery
    this.expressQuery = expressQuery
  }

  filter() {
    const filteredQuery = { ...this.expressQuery }
    const excludedQuery = ['sort', 'limit', 'page', 'fields']

    excludedQuery.forEach((fl) => delete filteredQuery[fl])

    console.log(filteredQuery)

    this.mongooseQuery = this.mongooseQuery.find(filteredQuery)

    return this
  }

  sort() {
    if (this.expressQuery.sort) {
      const sortStr = this.expressQuery.sort.replaceAll('%', ' ')
      this.mongooseQuery = this.mongooseQuery.sort(sortStr)
    } else {
      // sorting it by date
      // to display earlier tour first
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt')
    }

    return this
  }

  limitFields() {
    // removing __v (mongoose specific) and createdAt field to hide when tour is created
    this.mongooseQuery = this.mongooseQuery.select('-__v -createdAt')
    if (this.expressQuery.fields) {
      const field = this.expressQuery.fields.replaceAll('%', ' ')

      this.mongooseQuery = this.mongooseQuery.select(field)
    }

    return this
  }

  paginate() {
    const page = +this.expressQuery.page || 1
    const limit = +this.expressQuery.limit || 100
    const skip = (page - 1) * limit

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)

    return this
  }
}

module.exports = APIFeatures
