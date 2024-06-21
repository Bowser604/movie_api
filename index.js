const mongoose = require("mongoose");
const Models = require("./models.js");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');

const bcrypt = require("bcrypt");
const cors = require('cors');
const passport = require('passport');
require('./passport');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

mongoose.connect("mongodb://localhost:27017/[Movies]", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect( process.env.CONNECTION_URI, { 
//   useNewUrlParser: true, 
//   useUnifiedTopology: true 
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((error) => {
//   console.error('Error connecting to MongoDB:', error.message);
// });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { //If a specific origin isnt'found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
// const passport = require('passport');
// require('./passport');



// CREATE a user
app.post(
  "/users",
  [
    check('Username', 'Username must be more then two characters').notEmpty().isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], 
  async (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});


// GET all users
app.get(
  "/users",
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// UPDATE user info
app.put(
  "/users/:Username",
  [
    // Input validation
    check('Username', 'Username is required').isLength({min: 3}),
    check('Username', 'Username contains non alphanumeric characters not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Condition to check added here
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // Condition ends
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
       },
       { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);
   

// CREATE favorite movie to user
app.post(
  "/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  ) // Updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


// Delete movie title from user
app.delete(
  "/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
);


// Delete a user by username
app.delete(
  "/users/:Username", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    console.log("Inside DELETE /users/:Username endpoint");
    await Users.findOneAndDelete(
    { Username: req.params.Username })
      .then((user) => {
      console.log("User delete:", user);
        if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
);


//READ message
app.get(
  "/", (req, res) => {
  res.send("My top 10 movies list!");
});

// READ all movies
app.get(
  "/movies",
  //  passport.authenticate('jwt', { session: false }),
  // async 
  (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
);


// READ movie info for specific title
app.get(
  "/movies/:Title", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
  } 
);



// READ by genre name
app.get(
  "/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
  }
);


// READ
app.get(
  "/movies/director/:directorName", passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
  }
);

app.get(
  "/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.get(
  "/secreturl", (req, res) => {
  res.send("This is a secret URL with super top-secret content.");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});