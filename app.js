/** We start receiving requests in the app.js file;
 * it'll then, depending on the route, enter one of the routers: tourRoutes or userRoutes
 * then, depending on the request, it'll execute one of the controller methods, which are
 * located in tourController and userController.
 * That's where response gets sent, and finish the request-response-cycle
 * app.js is used to configure our application.  
*/

/** A convention to have configuration in app.js
 * We use POSTMAN to make API testing easier.
 */
 const express = require('express'); //get the express package, a node.js framework to make coding in node easier.

 //middleware to help logging http method to the terminal

 const morgan = require('morgan');
 
 const app = express(); //adds a bunch of methods to the app variable.


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

 /*********************************************
 * MIDDLEWARES 
 **********************************************/

 //only log request type to console if we're in development environment
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/** app.js, or main.js, is where we apply our global middlewares
 * then we have sub-middlewares depending on the route taken, 
 * based on URL, and resource specified;
 * so that can be tourRouter, or userRouter, etc.
 */


 /**
  * app.use to actually use middleware.
  * express.json() is a middleware: a function that modifies _incoming request data_ 
  * the data from the body of request is added to the request object;
  * Called middleware because it stands between request and response. 
  * express.json() returns a function
 */  
app.use(express.json()); 

//a way of opening static files from a folder and not from a route; another middleware
app.use(express.static(`${__dirname}/public`));

 app.use((request, response, next) => {
     /**                MIDDLEWARE
  *  =>  pass in a function we wanna add to our middleware stack.
  * in each middleware function, we've access to request and response;
  * but also access to the _next_ function in the middleware stack.
  * => if we didn't call nextFunction, request response cycle would be stuck here
  * we'd never end up sending a response to the client.
  * so, _USE NEXT IN ALL YOUR MIDDLEWARE_
  * => This middleware is 'global', all requests & responses regardless of route or http method 
  * would get passed through this
  * if middleware is placed AFTER a route handler, that middleware wouldn't run for the handler before it,
  * but will run for handlers AFTER it.
  */
     console.log('Hello from the middleware');
     next(); //how we call the next function
 })


app.use((request, response, next) => {
    //custom property to append time to the request, so it can be used in responses
    request.requestTime = new Date().toISOString(); //convert into a readable string
    next();
});

/****************************************************
 * ROUTES 
 ****************************************************/

/** tourRouter only runs on /api/v1/tours, so / and /:id is sub-routes of tourRouter
 * similarly for userRouter
 * this is called mounting the router
 * we create a different router for each resource, 
 * to have separation of concern between resources;
 * creating a small application for each resource, 
 * then putting everything together in one main app file.
 */

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


//application configuration, app from express, in one file
module.exports = app;
