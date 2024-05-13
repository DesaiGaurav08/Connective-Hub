const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { render } = require('ejs');


const uri = 'mongodb://0.0.0.0:27017/examease';
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/:userName/:userId', async (req, res) => {

    const db = client.db('examease');
    const contentCollection = db.collection('contents');
    const contentArray = [];

    // Iterate over the cursor and collect documents into the array
    const cursor1 = contentCollection.find();
    for await (const content of cursor1) {
        contentArray.push(content);
    }
    res.render('content/repository', { contents:contentArray,name:req.params.userName,userId:req.params.userId });
});











module.exports = router;