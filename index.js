const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require('uuid');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Lea",
    favoriteMovies: ["Under The Shadow"],
  },
  {
    id: 3,
    name: "Nick",
    favoriteMovies: ["Inception"],
  },
];

let topMovies = [
  {
    Title: "Snatch",
    Description:
      "llegal boxing promoter Turkish (Jason Statham) convinces gangster Brick Top (Alan Ford) to offer bets on bare-knuckle boxer Mickey (Brad Pitt) at his bookie business. When Mickey does not throw his first fight as agreed, an infuriated Brick Top demands another match.",
    Genre: {
      Name: "Crime/Comedy",
      year: "2000",
    },
    Director: {
      Name: "Guy Ritchie",
      Bio: "Guy Stuart Ritchie is an English film director, producer and screenwriter. His work includes British gangster films, and the Sherlock Holmes films starring Robert Downey Jr. Ritchie left school at age 15 and worked entry-level jobs in the film industry before going on to direct television commercials.",
      Birth: "September 10, 1968",
    },
  },
  {
    Title: "Sicario",
    Description:
      "After rising through the ranks of her male-dominated profession, idealistic FBI agent Kate Macer (Emily Blunt) receives a top assignment. Recruited by mysterious government official Matt Graver (Josh Brolin), Kate joins a task force for the escalating war against drugs.",
    Genre: {
      Name: "Action/Crime",
      year: "2015",
    },
    Director: {
      Name: "Denis Villeneuve",
      Bio: "Denis Villeneuve OC CQ RCA is a Canadian filmmaker. He is a four-time recipient of the Canadian Screen Award for Best Direction, winning for Maelström in 2001, Polytechnique in 2009, Incendies in 2010 and Enemy in 2013.",
      Birth: "October 3, 1967",
    },
  },
  {
    Title: "Lock, Stock and Two Smoking Barrels",
    Description:
      "Eddy (Nick Moran) convinces three friends to pool funds for a high-stakes poker game against local crime boss Hatchet Harry (P.H. Moriarty). Harry cheats and Eddy loses, giving him a week to pay back 500,000 pounds or hand over his fathers pub.",
    Genre: {
      Name: "Comedy/Crime",
      year: "1998",
    },
    Director: {
      Name: "Guy Ritchie",
      Bio: "Guy Stuart Ritchie is an English film director, producer and screenwriter. His work includes British gangster films, and the Sherlock Holmes films starring Robert Downey Jr. Ritchie left school at age 15 and worked entry-level jobs in the film industry before going on to direct television commercials.",
      Birth: "September 10, 1968",
    },
  },
  {
    Title: "Gladiator",
    Description:
      "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    Genre: {
      Name: "Action/Drama",
      year: "2000",
    },
    Director: {
      Name: "Ridley Scott",
      Bio: 'Described by film producer Michael Deeley as "the very best eye in the business", director Ridley Scott was born on November 30, 1937 in South Shields, Tyne and Wear. His father was an officer in the Royal Engineers and the family followed him as his career posted him throughout the United Kingdom and Europe before they eventually returned to Teesside.',
      Birth: "November 30, 1937",
    },
  },
  {
    Title: "Rurouni Kenshin 3",
    Description:
      "Kenshin reunites with a former master to ready for battle against Makoto Shishio who has formed an army fleet to overthrow the Meiji government and destroy his enemies.",
    Genre: {
      Name: "Action/Adventure",
      year: "2014",
    },
    Director: {
      Name: "Keishi Ohtomo",
      Bio: "Keishi Ōtomo is a Japanese film director and screenwriter. He is known for psychological thrillers and historical dramas, as well as adapting a variety of manga and novels to film, including The Vulture, Ryōmaden, and the Rurouni Kenshin film series.",
      Birth: "May 6, 1966",
    },
  },
  {
    Title: "Blade Of The Immortal",
    Description:
      "Cursed with immortality, a highly skilled samurai in feudal Japan promises to help a young woman avenge the death of her parents. Their mission leads them into a bloody battle with a ruthless warrior and his band of master swordsmen.",
    Genre: {
      Name: "Action/Crime",
      year: "2017",
    },
    Director: {
      Name: "Takashi Miike",
      Bio: "akashi Miike is a Japanese film director, film producer and screenwriter. He has directed over one hundred theatrical, video, and television productions since his debut in 1991. His films run through a variety of different genres, and range from violent and bizarre to dramatic and family-friendly movies.",
      Birth: "August 24, 1960",
    },
  },
  {
    Title: "Pulp Fiction",
    Description:
      'Vincent Vega (John Travolta) and Jules Winnfield (Samuel L. Jackson) are hitmen with a penchant for philosophical discussions. In this ultra-hip, multi-strand crime movie, their storyline is interwoven with those of their boss, gangster Marsellus Wallace (Ving Rhames) ; his actress wife, Mia (Uma Thurman) ; struggling boxer Butch Coolidge (Bruce Willis) ; master fixer Winston Wolfe (Harvey Keitel) and a nervous pair of armed robbers, "Pumpkin" (Tim Roth) and "Honey Bunny" (Amanda Plummer).',
    Genre: {
      Name: "Crime/Thriller",
      year: "1994",
    },
    Director: {
      Name: "Quentin Tarantino",
      Bio: "Quentin Jerome Tarantino is an American film director, screenwriter, and actor. His films are characterized by stylized violence, extended dialogue including a pervasive use of profanity, and references to popular culture.",
      Birth: "March 27, 1963",
    },
  },
  {
    Title: "Saving Private Ryan",
    Description:
      "Captain John Miller (Tom Hanks) takes his men behind enemy lines to find Private James Ryan, whose three brothers have been killed in combat. Surrounded by the brutal realties of war, while searching for Ryan, each man embarks upon a personal journey and discovers their own strength to triumph over an uncertain future with honor, decency and courage.",
    Genre: {
      Name: "War/Action",
      year: "1998",
    },
    Director: {
      Name: "Steven Allan Spielberg",
      Bio: "American film director, producer and screenwriter. A major figure of the New Hollywood era and pioneer of the modern blockbuster, he is the most commercially successful director in history.",
      Birth: "December 18, 1946",
    },
  },
  {
    Title: "Raiders Of The Lost Ark",
    Description:
      "Epic tale in which an intrepid archaeologist tries to beat a band of Nazis to a unique religious relic which is central to their plans for world domination. Battling against a snake phobia and a vengeful ex-girlfriend, Indiana Jones is in constant peril, making hairs-breadth escapes at every turn in this celebration of the innocent adventure movies of an earlier era.",
    Genre: {
      Name: "Adventure/Action",
      year: "1981",
    },
    Director: {
      Name: "Steven Allan Spielberg",
      Bio: "American film director, producer and screenwriter. A major figure of the New Hollywood era and pioneer of the modern blockbuster, he is the most commercially successful director in history.",
      Birth: "December 18, 1946",
    },
  },
  {
    Title: "Die Hard",
    Description:
      "New York City policeman John McClane (Bruce Willis) is visiting his estranged wife (Bonnie Bedelia) and two daughters on Christmas Eve. He joins her at a holiday party in the headquarters of the Japanese-owned business she works for. But the festivities are interrupted by a group of terrorists who take over the exclusive high-rise, and everyone in it. Very soon McClane realizes that there is no one to save the hostages - but him.",
    Genre: {
      Name: "Action/Thriller",
      year: "1988",
    },
    Director: {
      Name: "John McTiernan",
      Bio: "John Campbell McTiernan Jr. is an American filmmaker. He is best known for his action films, including Predator, Die Hard, and The Hunt for Red October.",
      Birth: "January 8, 1951",
    },
  },
];

app.use(morgan("combined", { stream: accessLogStream }));
// app.use(express.static('public'));

// app.use(morgan("common"));
// app.use(accessLogStream);
// app.use(express.static(path.join(__dirname, 'public')));

// CREATE
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names")
  }

})

// UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);;
  } else {
    res.status(400).send("no such user");
  }
})

// CREATE
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
  } else {
    res.status(400).send("no such user")
  }
})

// Delete
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
  } else {
    res.status(400).send("no such user")
  }
})

// Delete
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user")
  }
})

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
  const genre = topMovies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

// READ
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find( movie => movie.Director.Name === directorName
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

