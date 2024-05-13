const express = require('express');
const app = express();
const login = require('./routes/login');
const home = require('./routes/home');
const profile = require('./routes/profile');
const content = require('./routes/content');
const post = require('./routes/post');
const repository = require('./routes/repository');
const connect = require('./routes/connect')
const admin = require('./routes/admin'); // Rename admin to adminRoutes to avoid confusion
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Define admin schema
const adminSchema = new mongoose.Schema({
    admin_name: {
        type: String,
        required: true,
        unique: true // Ensure admin_name is unique
    },
    password: {
        type: String,
        required: true
    }
});

// Create Admin model from schema
const Admin = mongoose.model('Admin', adminSchema);

app.use('/', home);
app.use('/login', login);
app.use('/profile', profile);
app.use('/content', content);
app.use('/post', post);
app.use('/admin', admin); 
app.use('/repository', repository); 
app.use('/connect', connect); 
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views', 'profile'),
    path.join(__dirname, 'views', 'home'),
    path.join(__dirname, 'views', 'content'),
    path.join(__dirname, 'views', 'login'),
    path.join(__dirname, 'views', 'admin'),
    path.join(__dirname, 'views', 'connect'),
]);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/path/to/content', express.static(path.join(__dirname, 'public', 'content', 'uploads')));

mongoose.connect('mongodb://0.0.0.0:27017/examease', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to MongoDB");
        // Check if admin exists
        const admin = await Admin.findOne({ admin_name: 'admin' });
        if (!admin) {
            // Create admin if not exists
            await Admin.create({ admin_name: 'admin', password: 'admin_password' });
            console.log('Admin created');
        } else {
            console.log('Admin already exists');
        }
    })
    .catch((err) => console.error(err));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

