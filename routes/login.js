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


router.get('/', (req, res) => {
    res.render('login/login',{ error: '' });
});

router.get('/signUp', (req, res) => {
    res.render('login/signUp');
});

// Route handler for user login
router.post('/authenticate', async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;
    
        // Connect to MongoDB
        await client.connect();
    
        // Access the users collection
        const db = client.db('examease');
        const usersCollection = db.collection('users');
    
        // Find user by email in the users collection
        const user = await usersCollection.findOne({ email });
    
        // If user is not found, render login page with error message
        if (!user) {
            console.log(email);
            return res.render('login/login', { error: 'Invalid email or password. Please register.' });
        }
    
        // If user is found, compare passwords
        const upass = await user.password;
        console.log(upass);
    
        if (_.isEqual(upass, password)) {
            // If passwords match, set user's name in res.locals
            const userName = await user.name;
            const userId= await user._id;
            // Render the "/index" page with the user's name
            return res.redirect(`/Dashboard/${userName}/${userId}`)
        } else {
            // If passwords don't match, render login page with error message
            return res.render('login/login', { error: 'Invalid email or password.' });
        }
        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    persona: {
        type: String,
        required: true
    },
    connection: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    }   
});

// Define a model for the "user" collection
const User = mongoose.model('User', userSchema);

router.post('/register', async (req, res) => {
    // Define a schema for the "user" collection
    
    try {
        // Extract registration data from request body
        const { name, email, password, persona } = req.body;
        // Create new user in database (assuming User model is defined)
        const newUser = new User({ name, email, password, persona });
        await newUser.save();
        // Redirect to login page after successful registration
        console.log('New user created!')
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;