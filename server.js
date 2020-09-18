'use strict';

var express = require('express');
var mongoose = require('mongoose');
var shortId = require('shortid');
var bodyParser = require('body-parser');
var validUrl = require('valid-url');
var cors = require('cors');
var app = express();

var port = process.env.PORT || 3000;

const url = 'mongodb+srv://user:user@cluster0.v3sgu.mongodb.net/course?retryWrites=true&w=majority';
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});
mongoose.connection.once('open', () => {
  console.log("Connection successfully")
});

const urlShortener = mongoose.model("urlShortener", new mongoose.Schema({
  realUrl: String,
  shortUrl: String
}));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cors());
app.use(express.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.post('/api/shorturl/new', async (req, res) => {

  const url = req.body.url_input;
  const urlCode = shortId.generate();

  // Its valid the url ?
  if (!validUrl.isWebUri(url)) {
    res.status(401).json({
      error: 'Invalid URL'
    })
  } else {
    try {
      // Existed in the db ?
      let findOne = await urlShortener.findOne({
        original_url: url
      })
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      } else {
        // Otherwise create new an return this
        findOne = new URL({
          original_url: url,
          short_url: urlCode
        })
        await findOne.save()
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json('Error in server')
    }
  }
})

app.get('/api/shorturl/:short_url?',
    async (req, res) => {
      try {
        const urlParams = await urlShortener.findOne({
          short_url: req.params.short_url
        })
        if (urlParams) {
          return res.redirect(urlParams.original_url)
        } else {
          return res.status(404).json('No URL found')
        }
      } catch (err) {
        console.log(err)
        res.status(500).json('Server error')
      }
    }
)

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.listen(port, function () {
  console.log('Node.js listening in ', port + '...');
});
