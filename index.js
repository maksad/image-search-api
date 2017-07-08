const express = require('express');
const googleImages = require('google-images');
const monk = require('monk');
const morgan = require('morgan');
const path = require('path');

const port = process.env.PORT || 3500;
const CSE_ID = process.env.CSE_ID;
const G_API_KEY = process.env.G_API_KEY;
const DATABASE_URL = process.env.NODE_ENV === 'production' ?
  process.env.DATABASE_URL : 'localhost:27017/image-search';

const db = monk(process.env.DATABASE_URL);
const collection = db.get('usercollection');
const imagesSearch = new googleImages(CSE_ID, G_API_KEY);
const app = express();

app.use(morgan());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/api/images?*', (req, res) => {
  const q = req.query.q;
  const page = req.query.offset ? req.query.offset : 1;
  if (!q) {
    return res.status(400).send({error: 'q is not specified.'});
  }

  _addNewRecordToDb(q);

  imagesSearch.search(q, {page: page})
    .then(images => {
      res.json(images);
    })
    .catch(e => {
      res.json({
        error: 'something went wrong.',
        detail: e
      });
    })
});

app.get('/api/latest', (req, res) => {
  collection.find({},{}, function(e, docs) {
    if (e) {
      console.log(e);
      return res.json({error: 'Somethong went wrong.'})
    }

    res.json(docs);
  });
});


app.get('/', (req, res) => {
  res.render('index');
});

function _addNewRecordToDb(record) {
  collection.insert({
    term: record,
    when: new Date()
  });
}
app.listen(port);
