/** It's good practice to have everything related to Express in one file
 * And everything related to server in one file
 * this the file where we do all the setup of our application: environment variables,
 * import express application, starting server,
 * also the file where we configure MongoDB
 */

 /*************************************************
 * START SERVER 
 *************************************************/

//acquire our MongoDB driver: Mongoose
const mongoose = require('mongoose');

const dotenv = require('dotenv'); //to get our environment variables

//specify path where our configuration file is located
dotenv.config({
    path: './config.env'
});

const app = require('./app');

//pass in our database connection string with correct password from config.env, into mongoose.connect
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    //object we pass to deal with deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    //the promise here gets access to a connection object, the resolved value of the promise
}).then(() =>  console.log('DB connection successful!'));


const port = process.env.PORT || 3000;
app.listen(port, () => { //callback function as soon as server starts listening
    console.log(`App running on port ${port}`);
 }); //start a server

 /** routing: how application responds to a certain client request/url, and the http method used for that request:
  * get, patch, etc.
  */