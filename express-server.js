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
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID : "userRandomID"
  },
  "9sm5xK": {
   longURL: "http://www.google.com",
   userID : "userRandomID"
  }
};


function generateRandomString() {
return Math.random().toString(36).substring(6);
}

//Routes
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  var user = users[req.cookies.user_id];
  let templateVars = {
    user: users[req.cookies.user_id]
  };
if(typeof(user) === "undefined" && !user){
  res.redirect("/login");
}
else{
  res.render("urls_new", templateVars);
}
});

app.post("/urls", (req, res) => {
var user_id = req.cookies.user_id
var shortURL = generateRandomString();
 urlDatabase[shortURL] = {
  longURL :req.body.longURL,
  userID  : user_id
}

  res.redirect(`/urls/${shortURL}` )
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL][longURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
   let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    user: users[req.cookies.user_id]
  };
  var shortURL = req.params.id;
  if(req.cookies.user_id === urlDatabase[shortURL].userID){
  res.render("urls_show", templateVars);
  }
  else{
    res.send("You cannot edit a url that is not yours");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  if(req.cookies.user_id === urlDatabase[shortURL].userID){
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
    user: users[req.cookies.user_id]
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
  if(users[user_id]['password'] !== userPassword){
    return res.status(403).send("password is wrong");
  }
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
       return res.status(400).send("User already exists");
      }
    }

  users[id]= {
  "id" : id,
  "email": userEmail,
  "password" : userPassword
  }
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});