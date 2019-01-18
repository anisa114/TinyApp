const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieSession({
  name: 'session',
  keys: [ "0446774859", "7275461180" ],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID : "userRandomID"
  },
  "9sm5xK": {
   longURL: "http://www.google.com",
   userID : "user2RandomID"
  }
};


function urlsForUser(id){
  var filteredDatabase = [];
  for(var shortkey in urlDatabase){
      if(id === urlDatabase[shortkey].userID){
        let data = urlDatabase[shortkey];
        data['shortURL']= shortkey
         filteredDatabase.push (data);
      }
  }
  return filteredDatabase;
}
function generateRandomString() {
return Math.random().toString(36).substring(6);
}

//Routes
app.get("/urls", (req, res) => {
  if(req.session.user_id === undefined){
    res.render("./partials/_header.ejs");
  }
  else {
  let filteredData = urlsForUser(req.session.user_id)
  let templateVars = {
    filteredDatabase: filteredData,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  var user = users[req.session.user_id];
  let templateVars = {
    user: users[req.session.user_id]
  };
if(typeof(user) === undefined && !user){
  res.redirect("/login");
}
else{
  res.render("urls_new", templateVars);
}
});

app.post("/urls", (req, res) => {
var user_id = req.session.user_id
var shortURL = generateRandomString();
 urlDatabase[shortURL] = {
  longURL :req.body.longURL,
  userID  : user_id
}
  res.redirect(`/urls/${shortURL}` )
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
   let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    user: users[req.session.user_id]
  };
  var shortURL = req.params.id;
  if(req.session.user_id === urlDatabase[shortURL].userID){
  res.render("urls_show", templateVars);
  }
  else{
    res.send("You cannot edit a url that is not yours");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  if(req.session.user_id === urlDatabase[shortURL].userID){
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  }
  else{
    res.send("You cannot delete a url that is not yours");
  }
});

app.post("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  var updatedlongURL = req.body.longURL;
  urlDatabase[shortURL].longURL= updatedlongURL;

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
let templateVars = {
    user: users[req.session.user_id]
  };
res.render("login");
});

app.post("/login", (req, res) => {
  var userEmail = req.body.userEmail;
  var userPassword = req.body.password;
  var user_id = "";
  var flag = true;
 if(!userEmail || !userPassword){
   return res.status(400).send(" Both fields are required");
  }
  for (var key in users ){
      if(users[key]['email'] === userEmail){
        user_id = users[key]['id'];
        flag = false;
      }
  }
  if(flag){
    return res.status(403).send("User not registered")
  }
  if(!bcrypt.compareSync(userPassword, users[user_id]['password'])){
    return res.status(403).send("password is wrong");
  }
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
  });
  app.get("/register", (req, res) => {
  res.render("user_register");
});

app.post("/register", (req, res) => {
  var userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  var id = generateRandomString();

  //Handling Errors
  if(!userEmail || !userPassword){
   return res.status(400).send("Both fields are required");
  }

    for (var key in users ){
      if(users[key]['email'] === userEmail){
       return res.status(400).send("User already exists");
      }
    }

  users[id]= {
  "id" : id,
  "email": userEmail,
  "password" : hashedPassword
  }

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});