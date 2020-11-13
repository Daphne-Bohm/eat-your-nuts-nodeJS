//***************************************************IMPORT STUFF ETC**************************************************************//
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const db = require('./database');
const bcrypt = require('bcryptjs');

const port = process.env.PORT || 3003;

dotenv.config( { path: './.env'} );

//Authentication middelware import
const session = require('express-session');
const passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);

const mysql = require('mysql');

const app = express();

//********************************************************MIDDELWARES*****************************************************//

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Flash
app.use(flash());

// Cookie Parser
app.use(cookieParser());

// Creates a database in mysql automatic
const options = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
}

const sessionStore = new MySQLStore(options);

// Express session (creates a session):
app.use(session({
    secret: process.env.COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

// Passport for user authentication
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})

//************************************************FRONT END STUFF************************************************************//
// View engine
app.set('view engine', 'hbs');
app.use('/views', express.static(path.resolve(__dirname, 'views')));

// Stylesheets, images, JS, etc.
app.use(express.static(__dirname + '/public'));

// Partials
hbs.registerPartials(__dirname + '/views/partials');

//*************************************************ROUTES************************************************************//
app.use('/', require('./routes/index.js'));//localhost:3003/
app.use('/users', require('./routes/users.js'));
app.use('/profile', require('./routes/profile.js'));
app.use('/shop', require('./routes/shoppingcart.js'));


//*******************************************************PORT********************************************************//
app.listen(port, () =>{
    console.log(`Server is up and running on ${port}`);
})