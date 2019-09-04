/** We want to import the lots of data from our JSON file,
 * right into MongoDB.
 */
/** We need access to file system module, because we need to read our JSON files */
const fs = require('fs');

/** need our tours model, because it's our link to the database; 
 * where we write the JSON tours to.
*/
const Tour = require('./../../models/tourModel');

 //acquire our MongoDB driver: Mongoose
const mongoose = require('mongoose');


//we need environment variables to connect to database
const dotenv = require('dotenv'); //to get our environment variables



//specify path where our configuration file is located
dotenv.config({
    path: './config.env'
});

//pass in our database connection string with correct password from config.env, into mongoose.connect
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    //object we pass to deal with deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    //the promise here gets access to a connection object, the resolved value of the promise
}).then(() =>  console.log('DB connection successful!'));

/** READ OUR JSON FILE */

//it's in the same folder our import-dev-data is in, so directly access...
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')); //convert to JS objects using JSON.parse

/** IMPORT DATA FROM TOURS-SIMPLE.JSON INTO DATABASE */
const importData = async () => {

    try {
        /** the create method can accept an array of JS objects to create;
        * it'll create a document for each object, and save it to our Tour collection in MongoDB
        */
        await Tour.create(tours);
        console.log('Data successfully loaded');

    } catch(error){
        console.log(error);
    }
    process.exit(); //stop our application after performing desired action.
}

/** DELETE ALL DATA FROM COLLECTION */
const deleteData = async () => {
    try {
        /** Mongoose implements the same function as native MongoDB, deleteMany.
         * deleteMany removes all documents in a collection, if no arguments specified.
         * 
         * Mongoose is a layer of abstraction on top of MongoDB: 
         * the fundamental functionality is the name, but it, for example,
         * makes certain tasks easier to write and implement
          */
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    } catch(error){
        console.log(error);
    }
    process.exit(); //stop our application after performing desired action.
}

/** on the terminal/command line within VS code,
 * if the command specified on this file is --import,
 * then we want to import all data from JSON into our database*/
if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);