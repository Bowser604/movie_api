const express = require('express');
const morgan = require('morgan');
const fs = require('fs'), // import built in node modules fs and path 
const path = require('path');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

const top10Movies = [
  { title: 'Snatch', year: 2000 },
  { title: 'Sicario', year: 2015 },
  { title: 'Lock, Stock and Two Smoking Barrels', year: 1998 },
  { title: 'Gladiator', year: 2000 },
  { title: 'Rurouni Kenshin 3', year: 2014 },
  { title: 'Blade Of The Immortal', year: 2017 },
  { title: 'Pulp Fiction', year: 1994 },
  { title: 'Saving Private Ryan', year: 1998 },
  { title: 'Raiders Of The Lost Ark ', year: 1981 },
  { title: 'Die Hard', year: 1988 },
];

// GET route for "/movies" 
app.get('/movies', (req, res) => {
  // Return a JSON object containing data about the top 10 movies
  res.json({ topMovies: top10Movies });
});

// Default routes
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

// Start the server on port 8080
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

