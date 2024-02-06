const express = require('express')
const {ObjectId}  = require('mongodb')
const bodyParser = require('body-parser')
// Importing required functions from dbConnection.cjs
const {connectToDb, getDb} = require('./dbConnection.cjs')

const app = express()
app.use(bodyParser.json())
let db
connectToDb(function(error) {
    if(error) {
        console.log('Could not establish connection...')
        console.log(error)
    } else {
        app.listen(8000)
        db = getDb()
        console.log('Listening on port 8000...')
    }
})
 ///Adding entry
app.post('/add-entry', function(request, response) {
   db.collection("ExpensesData").insertOne(request.body).then(function() {
      response.status(201).json({
         "status" : "Entry added"
      })
   }).catch(function() {
      response.status(500).json({
         "status": "Error adding entry."
      })
   })
})
//getting entry
app.get('/get-entry', function(request, response) {
   const entries = []
   db.collection('ExpensesData')
   .find()
   .forEach(entry => entries.push(entry))
   .then(function() {
       response.status(200).json(entries)
   }).catch(function() {
       response.status(404).json({
           "status" : "Could not fetch documents"
       })
   })
})
app.delete('/delete-entry', function(request, response) {
   if(ObjectId.isValid(request.query.id)) {
       db.collection('ExpensesData').deleteOne({
           _id : new ObjectId(request.query.id)
       }).then(function() {
           response.status(200).json({
               "status" : "Entry successfully deleted"
           })
       }).catch(function() {
           response.status(500).json({
               "status" : "Entry not deleted"
           })
       })
   } else {
       response.status(500).json({
           "status" : "ObjectId not valid"
       })
   }
})

app.patch('/update-entry/:id', function(request, response) {
   if(ObjectId.isValid(request.params.id)) {
       db.collection('ExpensesData').updateOne(
           { _id : new ObjectId(request.params.id) }, // identifier : selecting the document which we are going to update
           { $set : request.body } // The data to be updated
       ).then(function() {
           response.status(200).json({
               "status" : "Entry updated successfully"
           })
       }).catch(function() {
           response.status(500).json({
               "status" : "Unsuccessful on updating the entry"
           })
       })
   } else {
       response.status(500).json({
           "status" : "ObjectId not valid"
       })
   }
})
