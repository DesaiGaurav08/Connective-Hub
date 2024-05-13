const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const _ = require('lodash');

mongoose.connect('mongodb://0.0.0.0:27017/examease', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

router.get('/open/:userName/:userId/:postUserId/:postId', async (req, res) => {
    const postsCollection = mongoose.connection.collection('posts');
    const usersCollection = mongoose.connection.collection('users');
    
    const ObjectId = mongoose.Types.ObjectId;
    
    const postIdString = req.params.postId;
    const postUserIdString = req.params.postUserId;
    const postId = new ObjectId(postIdString);
    const postUserId = new ObjectId(postUserIdString);

    const postArray = [];
    const cursor = postsCollection.find({_id: postId});
    for await (const post of cursor) {
        postArray.push(post);
    }

    const id = new ObjectId(postUserIdString);
    console.log(typeof(postUserIdString));
    const user = await usersCollection.findOne({ _id: postUserId });
    console.log(user.name);
    
    res.render('post/post', { name: req.params.userName, userId: req.params.userId, post: postArray , authorname:user.name});
});

router.get('/:userName/:userId', async (req, res) => {
    const postsCollection = mongoose.connection.collection('posts');
    const postsArray = [];
    const cursor = postsCollection.find({});
    for await (const post of cursor) {
        postsArray.push(post);
    }
    // Log the array of posts
    // console.log('Posts by user', userId, ':', postsArray);
    res.render('post/allPosts', { name: req.params.userName, userId: req.params.userId, post: postsArray });
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