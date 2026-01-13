class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Search functionality
    search() {
        const keyword = this.queryString.keyword
            ? {
                $or: [
                    { title: { $regex: this.queryString.keyword, $options: 'i' } },
                    { description: { $regex: this.queryString.keyword, $options: 'i' } },
                    { tags: { $regex: this.queryString.keyword, $options: 'i' } },
                ],
            }
            : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // Filter functionality
    filter() {
        const queryCopy = { ...this.queryString };

        // Remove fields that are not for filtering
        const removeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
        removeFields.forEach((el) => delete queryCopy[el]);

        // Advanced filtering for price, rating, etc.
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // Pagination
    pagination(resPerPage) {
        const currentPage = Number(this.queryString.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }

    // Sorting
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    // Field limiting
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
}

module.exports = APIFeatures;
