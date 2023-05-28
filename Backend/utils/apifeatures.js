class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    
  }
  
  search() {
    let keyword = this.queryStr.keyword ? this.queryStr.keyword : "";

    keyword = keyword.trim().toLowerCase();
    const regexKeyword = new RegExp(keyword, "i");

    this.query = this.query.find({
      city: { $regex: regexKeyword },
    });

    return this;
  }
  searchguide() {
    let keyword = this.query.keyword ? this.query.keyword : "";
    
    keyword = keyword.trim().toLowerCase();
    const regexKeyword = new RegExp(keyword, "i");

    this.query = this.query.find({
      currloc: { $regex: regexKeyword },
    });

    return this;
  }

  search1() {
    let keyword = this.queryStr.keyword ? this.queryStr.keyword : "";
    let currcity = this.queryStr.currcity ? this.queryStr.currcity : "";

    keyword = keyword.trim().toLowerCase();
    currcity = currcity.trim().toLowerCase();
    const regexKeyword = new RegExp(keyword, "i");
    const regexCurrcity = new RegExp(currcity, "i");

    this.query = this.query.find({
      $or: [
        { city: { $regex: regexKeyword } },
        { from: { $regex: regexCurrcity } },
      ],
    });

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    //   Removing some fields for category
    // console.log(queryCopy);
    // const removeFields = ["name", "page", "limit"];
    const removeFields = ["page", "limit"];

    removeFields.forEach((key) => delete queryCopy[key]);
    // removeFields.forEach((key) => delete queryCopy[key]);
    // console.log(queryCopy);
    // this.query = this.query.find(queryCopy);
    // Filter For Price and Rating

    // console.log(queryCopy);
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    // console.log(queryStr);
    // this.query = this.query.select("-__v");

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;