var express = require("express");
var app = express();
var mysql = require("mysql");
var passport = require("passport");
var session = require("express-session");
var bodyParser = require("body-parser");

var LocalStrategy = require("passport-local").Strategy;

app.use(express.static("public"));
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
); // session secret
app.use(passport.initialize());
app.use(passport.session());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "HomeoClinic@1",
  database: "HomeoClinic",
});

db.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("MYSQL connected...");
  }
});

//parse url
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//define routes
app.get("/", function (req, res) {
  res.render("landing.ejs");
});

app.get("/patientlogin", function (req, res) {
  res.render("patientLogin.ejs");
});

app.get("/patientsignup", function (req, res) {
  res.render("patientsignup.ejs");
});

app.listen(3000, function () {
  console.log("HomeoClinic has started");
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.query("select * from users where id = " + id, function (err, rows) {
    done(err, rows[0]);
  });
});

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      db.query(
        "select * from users where email = '" + email + "'",
        function (err, rows) {
          console.log(rows);
          console.log("above row object");
          if (err) return done(err);
          if (rows.length) {
            return done(
              null,
              false,
              req.flash("signupMessage", "That email is already taken.")
            );
          } else {
            var newUserMysql = new Object();

            newUserMysql.email = email;
            newUserMysql.password = password;

            var insertQuery =
              "INSERT INTO users ( email, password ) values ('" +
              email +
              "','" +
              password +
              "')";
            console.log(insertQuery);
            db.query(insertQuery, function (err, rows) {
              newUserMysql.id = rows.insertId;

              return done(null, newUserMysql);
            });
          }
        }
      );
    }
  )
);

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      db.query(
        "SELECT * FROM `users` WHERE `email` = '" + email + "'",
        function (err, rows) {
          if (err) return done(err);
          if (!rows.length) {
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found.")
            );
            // req.flash is the way to set flashdata using connect-flash
          }

          // if the user is found but the password is wrong
          if (!(rows[0].password == password))
            return done(
              null,
              false,
              req.flash("loginMessage", "Oops! Wrong password.")
            ); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, rows[0]);
        }
      );
    }
  )
);
