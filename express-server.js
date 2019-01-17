const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


function generateRandomString() {
return Math.random().toString(36).substring(6);
}


//Routes
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL]= req.body.longURL;
  res.redirect(`/urls/${shortURL}` )
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
   let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  var updatedlongURL = req.body.longURL;
  urlDatabase[shortURL]= updatedlongURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  var username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
  });

  app.get("/register", (req, res) => {
  res.render("user_register");
});

app.post("/register", (req, res) => {
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  var id = generateRandomString();

  //Handling Errors
  if(!userEmail || !userPassword){
   return res.status(400).send("Both fields are required");
  }

    for (var key in users ){
      if(users[key]['email'] === userEmail){
      res.status(400).send("User already exists");
      }
    }

  users[id]= {
  "id" : id,
  "email": userEmail,
  "password" : userPassword
  }
  res.cookie("user_id", users[id]['id']);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});