const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
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
    password: bcrypt.hashSync("purple-monkey-dinosaur" ,10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
}

let urlDatabase = {
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
  let filteredDatabase = [];
  for(let shortkey in urlDatabase){
      if(id === urlDatabase[shortkey].userID){
        let data = urlDatabase[shortkey];
        data['shortURL'] = shortkey
         filteredDatabase.push (data);
      }
  }
  return filteredDatabase;
}


function userEmailExists(user_email){
  for (let key in users ){
    if(users[key]['email'] === user_email){
      user_id = users[key]['id'];
      return user_id
    }
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(6);
}

//Routes

app.get("/", (req, res) => {
  if(!req.session.user_id){
    res.redirect("/login");
  }
  else{
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  if(!req.session.user_id){
    res.render("./partials/_header.ejs");
  }
  else {
    let filteredData = urlsForUser(req.session.user_id)
    let templateVars = {
      filteredDatabase: filteredData,
      user: users[req.session.user_id]
    }
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];
  let templateVars = {
    user: users[req.session.user_id]
  }
  if(!req.session.user_id){
    res.redirect("/login");
  }
  else{
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let user_id = req.session.user_id
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL :req.body.longURL,
    userID  : user_id
  }
  res.redirect(`/urls/${shortURL}` )
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]){
    res.send("URL for the given ID does not exist")
  }
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    user: users[req.session.user_id]
  };
  let shortURL = req.params.id;
  if(!urlDatabase[shortURL]){
    res.send("URL for given ID does not exist");
  }
  else if(!req.session.user_id){
    res.send("Can not view becuase user is not logged in ")
  }
  else if(req.session.user_id === urlDatabase[shortURL].userID){
  res.render("urls_show", templateVars);
  }
  else{
    res.send("You cannot acesss a URL that is not yours");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  if(req.session.user_id === urlDatabase[shortURL].userID){
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  else{
    res.send("You cannot delete a url that is not yours");
  }
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let updatedlongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if(!req.session.user_id){
    res.render("login");
  }
  else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let userEmail = req.body.userEmail;
  let userPassword = req.body.password;


  let user_id = userEmailExists(userEmail);
  if(!userEmail || !userPassword){
    return res.status(400).send(" Both fields are required");
  }


  else if (!user_id){
    return res.status(403).send("User not registered")
  }

  else if(!bcrypt.compareSync(userPassword, users[user_id]['password'])){
    return res.status(403).send("password is wrong");
  }

  else {
  req.session.user_id = user_id;
  res.redirect("/urls");
  }

});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if(!req.session.user_id){
    res.render("user_register");
  }
  else{
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  let id = generateRandomString();

  //Handling Errors
  if(!userEmail || !userPassword){
   return res.status(400).send("Both fields are required");
  }
  for (let key in users ){
    if(users[key]['email'] === userEmail){
       return res.status(400).send("User already exists");
    }
  }

  users[id] = {
  "id" : id,
  "email": userEmail,
  "password" : hashedPassword
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});