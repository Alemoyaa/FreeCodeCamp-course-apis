// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/timestamp/", function (req, res) {
  res.json({
    "unix": Date.now(),
    "utc": Date()
  });
});

app.get("/api/timestamp/:date_string", function (req, res) {
  const { date_string } = req.params;
  if(/\d{5,}/.test(date_string)){
    var parameter = parseInt(date_string);
    res.json({
      "unix": date_string,
      "utc": new Date(parameter).toUTCString()
    });
  }else{
    let dateObject = new Date(date_string);
    if(dateObject.toString() === "Invalid Date"){
      res.json({
        "error": "Invalid Date"
      })
    }else{
      res.json({
        "unix": dateObject.valueOf(),
        "utc": dateObject.toUTCString()
      })
    }
  }
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
