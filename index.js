const express = require('express');
const morgan = require('morgan');

const port = process.env.PORT || 3500;

const app = express();
app.use(morgan());

app.get('/', (req, res) => {
  res.json({message: 'this is it'})
});


app.listen(port);
