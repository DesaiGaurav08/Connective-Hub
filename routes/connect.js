const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://0.0.0.0:27017/examease';
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/:userName/:userId', async (req, res) => {
    const db = client.db('examease');
    const usersCollection = db.collection('users');

    const ObjectId = mongoose.Types.ObjectId;
    const usersArray = [];
    const self_ID = new ObjectId(req.params.userId);

    const cursor = usersCollection.find();
    for await (const user of cursor) {
        if (self_ID.equals(user._id)) {
            console.log("Skipping logged-in user:", user._id);
            continue; // Skip the logged-in user
        }
        usersArray.push(user);
    }
    res.render('connect/connect', { name: req.params.userName, userId: req.params.userId, users: usersArray });
});

router.post('/:userName/:userId', async (req, res) => {
    const db = client.db('examease');
    const usersCollection = db.collection('users');

    const ObjectId = mongoose.Types.ObjectId;
    const self_ID = new ObjectId(req.params.userId);
    const userId  = new ObjectId(req.body.userId);
  
    // Update connections field of the logged-in user in the database
    usersCollection.findByIdAndUpdate(loggedInUserId, { $push: { connection: userId } })
      .then(() => {
        // Connection successful
        res.sendStatus(200);
      })
      .catch(error => {
        console.error('Failed to connect user:', error);
        res.sendStatus(500);
      });
    res.render('connect/connect', { name: req.params.userName, userId: req.params.userId, users: usersArray });
});



router.get('/:userName/:logUserId/:userId', async (req, res) => {
    const usersCollection = mongoose.connection.collection('users');
    const postsCollection = mongoose.connection.collection('posts');
    const userId=  (req.params.userId);
    const loggedInUserId=(req.params.logUserId);
    const name= (req.params.userName)
    const postsArray = [];
  
  // Iterate over the cursor and collect documents into the array
  const cursor = postsCollection.find({ userId: userId });
  for await (const post of cursor) {
      postsArray.push(post);
  }
  
  // Log the array of posts
  console.log('Posts by user', userId, ':', postsArray);
  
  
    // Convert userId to ObjectId
    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const logUserIdObjectId = new ObjectId(loggedInUserId);
  
    // Find user by ID
    usersCollection.findOne({ _id: userObjectId }, (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (!user) {
        console.log('User not found');
        console.log(req.params.userId );
        res.status(404).send('User not found');
        return;
      }
      
      // Render the profile.ejs template with user's information
      res.render('connect/profile', { name:name,userId:logUserIdObjectId,Username: user.name ,userIdNo:userObjectId,persona:user.persona,post:postsArray}); // Assuming "profile.ejs" expects a "user" object
    });
    
  
  });


module.exports = router;