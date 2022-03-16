
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser')
const helmet = require("helmet");
const hpp = require('hpp');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const model = require('../model/connection');
const credentials = require('../middleware/credentials')

const routes = require('../routes');

const app = express();


app.use(fileUpload());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: false })); //Parse URL-encoded bodies
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(hpp());
app.use(cookieParser())
app.use(express.static('public'));


app.use(credentials)
// cors
const whitelist = ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://impact-server-api.herokuapp.com/', 'https://impact-help-frontend.vercel.app/']
const corsOptions = {
  origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
  }
}
app.use(cors(corsOptions))
// app.use(cors())




//controller-routes
routes.map(item => app.use(item.path, item.controller))


module.exports = app;
