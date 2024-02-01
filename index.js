const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });


let top10Movies = [
  { 
    title: 'Snatch',
    year: 2000 
  },
  {
    title: 'Sicario', 
    year: 2015 
  },
  { 
    title: 'Lock, Stock and Two Smoking Barrels', 
    year: 1998 
  },
  { 
    title: 'Gladiator', 
    year: 2000 
  },
  { 
    title: 'Rurouni Kenshin 3',
    year: 2014 
  },
  {
    title: 'Blade Of The Immortal',
    year: 2017 
  },
  {
    title: 'Pulp Fiction', 
    year: 1994 
  },
  { 
    title: 'Saving Private Ryan',
    year: 1998 
  },
  { 
    title: 'Raiders Of The Lost Ark ', 
    year: 1981 
  },
  { 
    title: 'Die Hard', 
    year: 1988 
  },
]
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

// app.use(morgan("common"));
// app.use(accessLogStream);

// app.use(express.static(path.join(__dirname, 'public')));


// GET route for "/movies" 
app.get('/movies', (req, res) => {
  // Return a JSON object containing data about the top 10 movies
  res.json({ topMovies: top10Movies });
});
    
// Default routes
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// app.get('/secreturl', (req, res) => {
//   res.send('This is a secret url with super top-secret content.');
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something Went Wrong!');
});

// Start the server on port 8080
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});


