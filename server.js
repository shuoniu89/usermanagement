require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));


mongoose.connect('mongodb://localhost:27017/movieDB', {useNewUrlParser: true});

const movieSchema = {
    title: String,
    rating: Number,
    poster_path: String,
    release_date: String,
    overview: String,
};

const Movie = mongoose.model('Movie', movieSchema);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    }
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model('User', userSchema);

app.listen(3000, function () {
    console.log("server started at 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/get_all_movies", function (req, res) {
    Movie.find(function (err, data) {
        if (err) {
            res.send({
                "message": "error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
    });
});

app.get('/get_movie_by_id', function (req, res) {
    Movie.find({"_id": req.query.movie_id}, function (err, data) {
        if (err) {
            res.send({
                "message": "error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data[0]
            })
        }
    });
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err) => {
        if (err) {
            res.redirect('/register.html')
        } else {
            res.redirect('/index.html')
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if (err) {
            console.log("invalid input")
            res.redirect('/login.html')
        } else {
            console.log(foundUser.password);
            if (foundUser.password === password) {
                console.log("log in success")
                res.redirect('/index.html')
            } else {
                console.log("wrong user name and password")
                res.redirect('/login.html')
            }
        }
    });
});