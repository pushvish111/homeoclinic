var express= require("express");
var app = express();
var mysql = require("mysql");
var passport   = require('passport');
var session    = require('express-session');
var bodyParser = require('body-parser');


app.use(express.static("public"));
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); 



const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HomeoClinic@1',
    database: 'HomeoClinic'
});

db.connect( function(err){
    if(err){
        console.log(err);
    } else{
        console.log("MYSQL connected...");
    }
})

//parse url
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//define routes
app.get('/', function(req, res){
    res.render('landing.ejs')
})

app.get('/patientlogin', function(req, res){
    res.render('patientLogin.ejs');
})

app.get('/patientsignup', function(req, res){
    res.render('patientsignup.ejs');
})


app.listen(3000, function(){
    console.log("HomeoClinic has started");
})