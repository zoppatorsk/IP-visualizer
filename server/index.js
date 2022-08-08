require('dotenv').config(); //provides access to env variables loaded from .env file
require('express-async-errors'); //Patches async routes so don't have to put try/catch block on each.
const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const expressErrorHandler = require('./middleware/expressErrorHandler'); //middleware that cathes express errors
const app = express();

app.set('query parser', false); //No query parser needed
if (process.env.USE_PROXY || process.env.MODE == 'prod') app.set('trust proxy', true); //if USE_PROXY is set, then trust proxy headers

//Routes for the endpoints...
const data = require('./routes/data');

//Middleware that's always used -- gets in between the request and response (request -> middleware -> route handler -> response)
app.use(helmet()); //Setting some headers, helps prevent attacks by not announce system is running on node and such.
app.use(compression()); //use compression to compress responses
if (process.env.NEED_CORS && process.env.MODE !== 'prod') app.use(cors()); //add cors to allow cross-origin requests
app.use(express.json()); //for parsing req.body into a json object

app.use(cors()); //add cors to allow cross-origin requests

//register the routes
app.use('/api/data', data); //when starts with /api/data then use the "data" route that is required from routes/user folder
app.use(express.static(path.join(__dirname, 'public'))); //serve static files from the public folder so can run frontend on the same server

app.use(expressErrorHandler); //Error handler middleware. Always shld be last cuz errors boubble up.

const port = process.env.MODE == 'prod' ? process.env.PROD_API_PORT : process.env.API_PORT;
if (process.env.MODE == 'prod') app.listen(port, 'localhost', () => console.log(`localhost listening on port ${port}`));
else app.listen(port, () => console.log(`listening on port ${port}`));
