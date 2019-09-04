/**
 * Mongoose is all about _models_: models are like blueprints that we use, to create documents.
 * A bit like classes in Javascript, which we also use as blueprints to create objects.
 * We create models in Mongoose in order to create documents using them; 
 * and also to Create, Read, Update, Delete documents. 
 * To create models, we need to use _schemas_.
 * We use a schema to create our data, to set default values, to validate the data, etc.
 * we here specify a schema for our data, and do some validation
 */

const mongoose = require('mongoose');

//a schema is like a class definition, which tells us what variables are allowed inside this model 

const tourSchema = new mongoose.Schema({
    //in defining schemas, we specify what data type each field will be
    name: { //schema type options follow
        type: String,
        /** to say that this field is required; this field is generally called a _validator_
         * if a required field is not specified when document is created, it'll throw an error
         */
        required: [true, 'A tour must have a name'], //name is required, and error message displayed
        unique: true, //name must be unique
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number, 
        default: 4.5 //a new tour document using this schema, without specifying rating, will be set to 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        //insertion must have such required fields
        required: [true, 'A tour must have a price'] 
    },
    priceDiscount: {
        type: Number
    },
    summary: {
        type: String,
        required: true,
        //another schema type-option; remove all the whitespace in the beginning and end of the string
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        //the name of the image, which we'll replace in a template later
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    /** multiple images, so save as an array of Strings */
    images: [String],
    /** timestamp set by the time the user adds a new tour
     * by default, time is set to when this model instance is created
     */
    createdAt: {
        type: Date, 
        default: Date.now(),
        select: false //so we always exclude this when client requests a document

    },
    //array of dates at which different tours start
    startDates: [Date]

});

//create tour out of the schema we created in the beginning; .model(nameOfModel, schemaUsed)
//Model is like a function constructor
const Tour = mongoose.model('Tour', tourSchema);

//we use the default export to send out our 'class' so we can create objects/documents with this
module.exports = Tour;

































// /** new document created out of the Tour model
//  * Models are like Classes; and so we're creating new objects out of a class:
//  * except in the context of database, such instantiated objects are called _Documents_
//  * testTour is an instance of the tour model.
//  */
// const testTour = new Tour({
//     name: 'The Park Camper',
//     price: 997

// });

// /** save this document to the tours database
//  * Save will return a promise that we can then use
//  * we get access to the document that was just saved to the db
//  */
// testTour.save().then(document => {
//     console.log(document);
// }).catch(error => {
//     console.log('ERROR: ', error);
// })
