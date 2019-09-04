/** create a class to encapsulate reusable modules about query modifying, that we can later on import into other modules */
class APIFeatures {
  
    /** mongoose query object, and the queryString we get from the express, from the route. */

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    };

    /**************** BUILD QUERY **************/

    filter() {
        /////////////////////////////
        // 1) Filter for page, sort, limit, and fields
        /////////////////////////////

        /** we get a shallow copy of the contents of request.query with following syntax,
         * all the key value pairs from request.query
         */
        const queryObject = {...this.queryString};

        /** In our query of database, there are some specifiers we want to exclude, like pagination:
         * ?page=2 wouldn't make sense when querying our documents. so we exclude some,
         * and then use the rest to filter the documents present in our database
        */
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        /**remove the excluded fields from our query object 
         * for each element in the array of excluded fields,
         * if a match is found to the request query, we get rid of it.
         * whatever remains, will be used to search for particular documents
         * in our Tour database
        */
        excludedFields.forEach(element => delete queryObject[element]);

        /** one way of filtering search results: 
         * Tour.find() returns an object of Class _Query_, 
         * which is why it's got a bunch of prototype methods, like .where, .equals, etc.
         */
        //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        /////////////////////////////
        // 2) Filtering for greater than, less than a specific quantity, e.g. documents with price < 500
        /////////////////////////////
        
        //stringify, replace gte with $gte for example, restore back into queryObject with JSON.parse
        let queryString = JSON.stringify(queryObject);

        //match these exact words, replace old string with new one: gte => $gte, which is the MongoDB filter expression for >=
        /** we could write some documentation to allow user to know which kinds of operation they could do on our API:
         * specify which requests can be made, using which http methods, what kind of filtering or sorting are available
         */
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);



        /** We can use a filter object, just like native MongoDB, to get more precise results
         * than 'all' the objects.
         * for example, Tour.find({
         *  duration: 5,
         *  difficulty: 'easy'
         * }); would return an array of tours with a duration of 5, and easy difficulty.
         * queryObject, then, is a filter object based on client-requested queries.
         * find() looks for documents fulfilling requirements, returns a Query object, also an array of JS objects
         */
        //let query = Tour.find(JSON.parse(queryString));

        this.query = this.query.find(JSON.parse(queryString));

        return this; //return the entire Query object, because we need to chain multiple methods in the Execute Query section
    };

    sort() {
        ///////////////////////////////
        // 3) Sorting the documents by some given criteria
        ///////////////////////////////

        /** if there is a sort property... we want to sort the results based on their values
         * request.query.sort returns the specifier we sort by: if sort=price in the client-requested url, 
         * then request.query.sort is price
         * Mongoose will automatically sort the queries based on their prices
         */
        if (this.queryString.sort) {
            /** split the incoming sort criterias, returning an array of all the fields asked to sort by 
             * then join separate elements back together by a space: ' '
             * e.g. price,duration => price duration
            */
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            //if user doesn't specify what criteria to sort by, we sort by date of creation: earliest first
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        /////////////////////////////////
        // 4) Field Limiting
        /////////////////////////////////
        /** For a client, it's always ideal to receive as little data as possible, in order to reduce bandwidth
         * that is consumed with each request. So we should allow API user to request only some of the fields
         */

        if (this.queryString.fields) {
            //mongoose requests a string, with field names separated by spaces; so we format it first
            const fields = this.queryString.fields.split(',').join(' ');
            /** only the criteria specified within select() will be held by our Query object
             * the operation of selecting only certain field names is called _Projecting_
             */
            this.query = this.query.select(fields);
        } else {
            //we exclude a field that comes appended with each document, but which we don't want
            this.query = this.query.select('-__v');
        }
        return this;
    };

    paginate() {
        /////////////////////////////////
        // 5) Pagination
        /////////////////////////////////
        /** Allowing our user to only select a certain page of our results, 
         * in case we have a lot of results.
        */

        /** we set a page and limit by default, because we don't wanna display, say, 1 million results by default...
         * if there is no .page field in the queryString, page = 1 by default using the _... || 1_
         */
        const page = this.queryString.page * 1 || 1; //convert string/query object into a number by * 1
        const limit = this.queryString.limit * 1 || 100; //100 results per page by default

        /** e.g. if page = 3 and limit = 10, on the 3rd page we display results 21-30,
         * which means we skip (3 - 1) * 10 results before we start querying
         */
        const skip = (page - 1) * limit;

        /** User will have page number (skip) with (limit) results per page:
         * _skip_, is amount of results that should be skipped before actually querying data.
         * _limit_, is max number of results we want in one query;
         * if page=2&limit=10, each page will have 10 results, and user is asking for page 2
          */
        this.query = this.query.skip(skip).limit(limit);

        return this;
    };


};

module.exports = APIFeatures;