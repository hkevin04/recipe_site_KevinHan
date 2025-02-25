const express = require('express');
const app = express();
const db = require('./database');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const recipeRoutes = require('./routes/index');
app.use('/', recipeRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
