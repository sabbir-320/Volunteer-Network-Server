const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const multer = require('multer')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra')
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()

// app config
const app = express()

// Middle ware
app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static("volunteers"))

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ipvgi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("volunteers").collection("task");

  // post grud
  app.post('/userRegister', (req, res) => {
    const userRegister = req.body;
    collection.insertOne(userRegister)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addTask', (req, res) => {
    const file = req.files.file
    const title = req.body.title

    const newImg = file.data
    const encImg = newImg.toString('base64')
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    collection.insertOne({ title, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  // get grud 
  app.get('/volunteerItems', (req, res) => {
    collection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/register/:id', (req, res) => {
    collection.find({
      _id: ObjectId(`${req.params.id}`)
    })
      .toArray((err, document) => {
        res.send(document)
        console.log(err);
      })
  })

  // perticuler user item
  app.get('/registerdItem/:_id', (req, res) => {
    console.log(req.params.id);
    collection.find({
      _id: ObjectId(`${req.params.id}`)
    })
      .toArray((err, document) => {
        console.log(document);
        res.send(document)
        console.log(err);
      })
  })

  // app grud by email
  app.get('/volunteerByEmail', (req, res) => {
    collection.find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document)
      })
  })








});


app.listen(process.env.PORT || 5000, () => console.log('run successfully......'))
