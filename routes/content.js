const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// Connect to MongoDB
const uri = 'mongodb://0.0.0.0:27017/examease';
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/data/uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use the current date/time and original filename as the filename
    }
});
const upload = multer({ storage: storage });



const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String, // Assuming you store the filename or path to the image
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Post = mongoose.model('Post', postSchema);

router.post('/addcontent/result/:userName/:userId', upload.single('uploaded_file'),async (req, res) => {
   // Extract data from request
   const { userId } = req.params;
   const { title, contentText } = req.body;
   const image = req.file.filename; // Get the filename of the uploaded image

   try {
       // Access the examease database
       const database = client.db('examease');

       // Access the posts collection (create it if it doesn't exist)
       const collection = database.collection('posts');

       // Create a new post document
       const newPost = {
           userId,
           title,
           contentText,
           image,
           createdAt: new Date() // Automatically set the creation date
       };

       // Insert the new post document into the posts collection
       await collection.insertOne(newPost);
       
       console.log('New post added to the collection');
      res.render('content/addContentResult',{name:req.params.userName,userId:userId,resultMessage:"Post Created Successfully"}) 
   } catch (error) {
       console.error('Error adding post to collection:', error);
       res.render('content/addContentResult',{name:req.params.userName,userId:userId,resultMessage:"Error adding post to collection"}) 
   }
});


router.get('/addContent/:userName/:userId', (req, res) => {
    res.render('content/addContent', { name: req.params.userName, userId: req.params.userId });
});





module.exports = router;