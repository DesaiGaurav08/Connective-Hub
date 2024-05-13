const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const _ = require('lodash');


const uri = 'mongodb://0.0.0.0:27017/examease';
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

router.use(bodyParser.urlencoded({ extended: false }));



router.get('/Dashboard/:userName/:userId', async(req, res) => {
    res.render('profile/dashBoard', { name: req.params.userName, userId: req.params.userId});
});

router.get('/about', (req, res) => {
    res.render('home/about');
});

router.get('/', (req, res) => {
    res.render('home/index');
});

router.post('/', (req, res) => {
    res.render('index');
});







module.exports = router;