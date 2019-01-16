var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
function generateRandomString() {
return Math.random().toString(36).substring(6);
}

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
 let templateVars = { urls: urlDatabase, shortURL: req.params.id };
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});