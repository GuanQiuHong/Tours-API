/** What we call route handlers - functions to run for that route, 
 * are actually called controllers in the MVC model: Model View Controller architecture.
 */

//import our tour model, since we need to CRUD tours here
const Tour = require('./../models/tourModel');

//a middleware to prefill some fields to return cheapest, highest rated tours
exports.aliasTopTours = (request, response, next) => {
    request.query.limit = '5';
    request.query.sort = '-ratingsAverage,price'; //highest rated, and cheap
    request.query.fields = 'name,price,ratingsAverage,summary,difficulty'; //client doesn't need a ton of info, just these is fine
    next(); //go on to next middleware
}

const APIFeatures = require('./../utils/apiFeatures');

//response.json is what ENDS a request-response cycle, as it is the final link
// getAllTours is a callback function, and all callbacks are asynchronous; so we declare it to be async
exports.getAllTours = async (request, response) => {
   
    try {

        /*************** EXECUTE QUERY ****************/

        /** we initialize an object of the APIFeatures class with the initial Query object containing all documents, 
         * and also the query string from express: client requested URL, via the routers.
         * Then it is essentially a process of adding various methods to the Query object, like filter, sort, limit etc.
         * to tailor the final search results from initial queryString
         * This chaining only works because every function call 'return this': the Query object,
         * so it is the same object albeit with more functions, that's being operated on by the subsequent method
        */
        const features = new APIFeatures(Tour.find(), request.query).filter().sort().limitFields().paginate();


        /** await, by analogy, is like the 'response' in request-response cycle: it's the final link.
         * We need to operate on our _Query_  object with many different methods, until we 'await',
         * i.e. deliver the final object to return to client.
         * In this sense, _various operations on the Query object is like middleware_
         * after the above method operations on APIFeatures, we then await the result so that it can come back
         * with all the documents that were selected.
         * Then, tours is the Query object, which is also an array of javascript objects,
         * that finally gets sent back to the client.
         */
         const tours = await features.query;

        /************* SEND RESPONSE ******************/

        /** We format our response to GET using the JSEND formatting: status followed by data {} */
        response.status(200).json({
            status: 'success',
            results: tours.length, //number of results that we're sending, for client to get info about data received
            data: {
                tours: tours //an array of JS objects, from MongoDB compass (a GUI for MongoDB)
            }
        })
        //catch any potential errors if previous doesn't work...
    } catch(error) {
        response.status(404).json({
            status: 'fail',
            message: error 
        });
    }
};

exports.getTour = async (request, response) => {

    try {
        /** this is how we get the id from api/v1/tours/5 , request.params.id = 5
         * tour will get one JS object, the one that matches given ID
         * findById is similar to Tour.findOne({ _id: request.params.id });
         * when we use.find on a model object, they're called _query methods_ 
          */
       const tour = await Tour.findById(request.params.id);

        /** We format our response to GET using the JSEND formatting: status followed by data {}
         * once we have the object with desired id, we can now send that object in json format
         */
        response.status(200).json({
            status: 'success',
            data: {
                tour: tour //object that has the tours property from JSON.parse()
            }
        });
    } catch(error) {
        response.status(404).json({
            status: 'fail',
            message: error 
        });
    }

}

exports.createTour = async (request, response) => {

    /**
     * we need to have error handling, so we try something, and if it doesn't work, 
     * the method to handle is in the catch block.
     * one error we catch, is if the request.body doesn't have all the information we need
     * to create a tour.
     */
    try{

        /** the earlier way was to use the mdoel to instantiate an object, and then save to database"
         * const newTour = new Tour({
         * name: ... price: ...}) and then newTour.save().then()... so it's in the db
         * in following version, create & save directly on tour, while before, called method on the document
         * we pass the data that we want to store into the database, from the request body of a http POST
         * this may take some time, so we perform it asynchronously; Tour.create() returns a promise
         * then we wait that promise using async await; afterwards, store it into the newTour variable, 
         * which will be the newly created document with mongoDB generated ID
         */
        const newTour = await Tour.create(request.body);

        //as soon as file is written, send 201 code, created, as response
        response.status(201).json({
            status: 'success',
            data: {
                tour: newTour //we specify what has been written to tours-simple.json: the info the client sent
            }
        })
    } catch (error) {
        response.status(400).json({
            status: 'fail',
            message: 'Invalid data sent'
        })
    }
};

exports.updateTour = async (request, response) => {
   
    /** query for the documnet we want to update
     * and then update it
     */
    try {
        /** we update tour based on ID
         * first pass in request.params.id to get the object we wanna modify,
         * and then the data we want to change: which is given by request.body,
         * just like POST request.
         * as a third argument, return newly updated document to client
         */
        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            //if original document was valid, check whether newly updated document is still valid
            runValidators: true 
        })

        response.status(200).json({
            status: 'success',
            data: {
                
                tour: tour //then we return the updated tour
            }
        })

    } catch(error) {
        response.status(404).json({
            status: 'fail',
            message: error 
        });
    }
    
};

exports.deleteTour = async (request, response) => {
   
    try {
        //we aren't sending anything back to client so no need to assign this to a variable
        await Tour.findByIdAndDelete(request.params.id);

        response.status(204).json({
            status: 'success',
            data: null //data is null to show that the resource we deleted no longer exists.
        });
    } catch(error) {

        response.status(404).json({
            status: 'fail',
            message: error 
        });
    }
};

/** Aggregation pipeline: calculate statistics about our tours */
exports.getTourStats = async (request, response) => {
    try {
        /**
         * using the regulation pipeline is like a regular query;
         * difference is that in aggregation, we can manipulate data in a couple of different steps
         * we pass in an array of 'stages'
         * document passes through these stages, one by one, step by step, in the defined sequence.
         * each of the elements in this array will be a stage.
         * similar to how .find() returns a query, .aggregate returns an aggregate object.
         * only when we await it, it comes back with the result.
         */
        const stats = await Tour.aggregate([
            {   
                /** match is to select, or to filter certain documents; like a filter object in mongoDB 
                 * we only want to select documents with a ratingsAverage > 4.5
                */
                $match: { ratingsAverage: { $gte: 4.5}}
            },
            {
                $group: { 
                    /** it groups documents together, using _accumulators_.
                     * if there are 5 tours with different ratings, $group can calculate the average rating
                     * we specify what we want to group by with the _id: 
                     * $toUpper spells the difficulties in upper case
                     */
                    _id: { $toUpper: '$difficulty'}, //grouping the below information by difficulty: one set of stats for easy, one for medium, one for difficult
                    /** for each of the document that goes through this pipeline, 1 will be added to the tours counter.
                     * so group is like a .forEach iteration
                     */
                    numTours: { $sum: 1},
                    //calculate total number of ratings we have, total number of tours
                    numOfRatings: { $sum: '$ratingsQuantity'},
                    /** $avg is another mongoDB operator, just like $gt. To specify which field we want to calculate average for, 
                     * we write: '$field' */ 
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            
            {
                /** specify which field we want to sort by: average price: 1 for ascending */
                $sort: { avgPrice: 1 }
            },
            // //stages can be repeated
            // {
            //     //select all documents that are not easy
            //     $match: { _id: { $ne: 'EASY'}}
            // }
        ]);

        response.status(200).json({
            status: 'success',
            data: {
                
                stats: stats
            }
        });

    }   catch(error) {
        response.status(404).json({
            status: 'fail',
            message: error 
        });
    }
}