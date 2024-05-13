const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/examease', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, 'public')));

router.get('/:userId', async (req, res) => {
  const usersCollection = mongoose.connection.collection('users');
  const postsCollection = mongoose.connection.collection('posts');
  const userId=  (req.params.userId);

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
    res.render('profile/profile', { name: user.name ,userId:userObjectId,persona:user.persona,post:postsArray}); // Assuming "profile.ejs" expects a "user" object
  });
  

});

router.get('/about/:userName/:userId', (req, res) => {

  res.render('profile/aboutProfile',{name:req.params.userName,userId:req.params.userId});
});









module.exports = router;