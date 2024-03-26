const mongoose = require("mongoose");
const Models = require("./models.js");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

mongoose.connect("mongodb://localhost:27017/[Movies]", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("combined", { stream: accessLogStream }));

// CREATE a user
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
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
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// UPDATE user info
app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
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

// CREATE add favorite movie to user
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavriteMovies: req.params.MovieID },
    },
    { new: true }
  ) // Updated document is returned
    .then((updatedUser) => {
      res.json(updateUser);
    });
});

// Delete
app.delete("/users/:id/:movieTitle", async (req, res) => {
  const { id, movieTitle } = req.params;

  const user = await Users.findById(id);
  // let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// Delete a user by username
app.delete("/users/:Username", async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
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
});

//READ
app.get("/", (req, res) => {
  res.send("My top 10 movies list!");
});

// READ
app.get("/movies", (req, res) => {
  res.status(200).json(topMovies);
});

// READ
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = topMovies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

// READ
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = topMovies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

// READ
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.get("/secreturl", (req, res) => {
  res.send("This is a secret URL with super top-secret content.");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Went Wrong!");
});

// Start the server on port 8080
app.listen(8080, () => console.log("listening on 8080"));
