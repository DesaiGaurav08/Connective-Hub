const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://0.0.0.0:27017/examease';
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/content/uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use the current date/time and original filename as the filename
    }
});

// Multer file filter to accept only PDF files
const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed'), false); // Reject the file
    }
};

// Initialize Multer middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});



router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.post('/authenticate', async (req, res) => {
    try {
        // Extract admin_name and password from request body
        const { admin_name, password } = req.body;

        // Access the admins collection
        const db = client.db('examease');
        const adminCollection = db.collection('admins');
        const userCollection = db.collection('users');
        const contentCollection = db.collection('contents');
        const postCollection = db.collection('posts');

        const usersArray = [];

        // Iterate over the cursor and collect documents into the array
        const cursor = userCollection.find();
        for await (const user of cursor) {
            usersArray.push(user);
        }

        const contentArray = [];

        // Iterate over the cursor and collect documents into the array
        const cursor1 = contentCollection.find();
        for await (const content of cursor1) {
            contentArray.push(content);
        }
        const ObjectId = mongoose.Types.ObjectId;
        
        const postsArray = [];

        // Iterate over the cursor and collect documents into the array
        const cursor2 = postCollection.find();
        for await (const post of cursor2) {
            postsArray.push(post);
        }


        // Find admin by admin_name in the admins collection
        const admin = await adminCollection.findOne({ admin_name });
        if (!admin) {
            // If admin is not found, redirect back to login page
            return res.redirect('/login');
        }
        // console.log(admin);
        // Compare passwords
        const apass = admin.password;
        console.log(apass, admin.password);
        if (apass.toString !== password.toString) {
            // If passwords don't match, redirect back to login page
            return res.redirect('/admin/login');
        }

        // If authentication is successful, set admin's name and ID in res.locals
        const adminName = admin.admin_name; // Use admin_name property
        const adminId = admin._id.toString(); // Convert ObjectID to string
        res.locals.adminName = adminName;
        res.locals.adminId = adminId;

        // Redirect to the admin dashboard page with the admin's name and ID
        res.render('admin/Dashboard', {
            adminId: adminId,
            users: usersArray,
            contents: contentArray,
            posts:postsArray
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/add-content/:adminId', async (req, res) => {
    
    const db = client.db('examease');
    const userCollection = db.collection('users');
    const contentCollection = db.collection('contents');
    const postCollection = db.collection('posts');

    const usersArray = [];

    // Iterate over the cursor and collect documents into the array
    const cursor = userCollection.find();
    for await (const user of cursor) {
        usersArray.push(user);
    }

    const contentArray = [];

    // Iterate over the cursor and collect documents into the array
    const cursor1 = contentCollection.find();
    for await (const content of cursor1) {
        contentArray.push(content);
    }
    const postsArray = [];

        // Iterate over the cursor and collect documents into the array
        const cursor2 = postCollection.find();
        for await (const post of cursor2) {
            postsArray.push(post);
        }
    res.render('admin/Dashboard', { adminId: req.params.adminId,users:usersArray,contents:contentArray ,posts:postsArray});
});

// Define the route for the admin dashboard
router.post('/add-content/:adminId', upload.single('pdfFile'), async (req, res) => {
    try {
        const { title, contentText } = req.body;
        const pdfFileName = req.file.filename;
        const adminId = req.params.adminId;
        // Access the examease database
        const database = client.db('examease');

        // Access the contents collection (create it if it doesn't exist)
        const collection = database.collection('contents');

        // Create a new content document
        const newContent = {
            title,
            contentText,
            pdfFileName,
            createdAt: new Date(), // Automatically set the creation date
        };

        // Insert the new content document into the contents collection
        await collection.insertOne(newContent);

        res.status(201).send("<script>alert('Content added successfully'); setTimeout(() => {window.location.href='/admin/add-content/${adminId}'; }, 1000);</script>");
        
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).send("<script>alert('Internal Server Error'); setTimeout(() => { window.location.href='/admin/add-content/${adminId}'; }, 3000);</script>");
    }
});





module.exports = router;