const express = require('express');
//tourController is equivalent to the exports object, with extra functions appended to it
const tourController = require('./../controllers/tourController');

 /**
  * Each router is like a mini, sub-application: one for each resource.
  * We want to use Router, 
  * a middleware that refers requests 
  * to sub-routes, like tourRouter, or userRouter,
  * depending on the url of the incoming request.
  */

const router = express.Router();

/** Chaining multiple middleware for one http method call:  
 * POST example: We might run a middleware before createTour, 
 * to check that the data that is coming in the request.body actually contains data tht we want for the tour. 
 * put the middlewares in order: checkBody content first, then createTour if valid content present
 * We chain middleware because we want to modularize code: each middleware takes care of one function 
*/


/** run a middleware to prefill some fields, manipulate the Query object 
 * so if a client queries top-5-cheap, it is first routed to _.aliasTopTours_, where ratingsAverage, price are sorted,
 * and limit of 5 results are specified in the query object;
 * it is then routed to getAllTours handler, where modifications to Query results are made based on the pre-filled information
*/
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

//it's already been specified that tourRouter only deals with '/api/v1/tours'
//in app.js, so here we detail which URLs within /tours we're responding to
router.route('/').get(tourController.getAllTours).post(tourController.createTour);
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);



//we have one thing to export here, which is the router with its appended http methods
module.exports = router;







































/** good practice to specify API version, v1
 * we usually call the callback function here the _route handler_
 * we want to send back all the tours data when someone requests this url
 * tours is the main resource of this website about selling tours
 * we get these tours we send to the client through tours-simple.json
 * Client and server typically exchanges data of type JSON, we can use JSEND
*/
//app.get('/api/v1/tours', getAllTours);

/** we define a variable called id, so client can request a specific tour rather than ALL
 * if /api/v1/tours/5, request.params automatically assigns { id: 5 }
*/
//app.get('/api/v1/tours/:id', getTour);

/** add a new route, POST, so client can add new tours
 * Following REST architecture, URL is exact same in comparison to GET tours; the http method is what changes (to .post), due to request type.
 * Post: send data from client to server, which means _request object_ holds all the data that is sent from client.
 * body is a property available on the request; 
 * in POSTMAN, we can simulate sending info to the server by modifying the body tab, in POST request
 */
//app.post('/api/v1/tours', createTour);

/** PUT: sends entire updated project; PATCH: sends part of project that's been changed
 * PATCH is easier to handle because it's only partially, whatever's been changed.
 * dealing with files is not a real world scenario
 */
//app.patch('/api/v1/tours/:id', updateTour);

/** delete request => status code is 204 */
//app.delete('/api/v1/tours/:id', deleteTour);