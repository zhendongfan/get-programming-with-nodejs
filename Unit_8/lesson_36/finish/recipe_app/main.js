'use strict';

const express = require( 'express' ),
  layouts = require( 'express-ejs-layouts' ),
  app = express(),
  router = require( './routes/index' ),

  bodyParser = require( 'body-parser' ),
  mongoose = require( 'mongoose' ),
  methodOverride = require( 'method-override' ),

  cookieParser = require( 'cookie-parser' ),
  connectFlash = require( 'connect-flash' ),
  expressSession = require( 'express-session' ),

  expressValidator = require( 'express-validator' ),
  passport = require( 'passport' ),
  morgan = require( 'morgan' ),

  User = require( './models/user' );

mongoose.Promise = global.Promise;

if ( process.env.NODE_ENV === 'test' ) mongoose.connect( 'mongodb://localhost/recipe_test_db' );
else mongoose.connect( process.env.MONGODB_URI || 'mongodb://localhost/recipe_db' );
const db = mongoose.connection;

db.once( 'open', () => {
  console.log( 'Successfully connected to MongoDB using Mongoose!' );
} );

if (process.env.NODE_ENV === 'test') app.set( 'port', 3001 );
else app.set( 'port', process.env.PORT || 3000 );

app.set( 'view engine', 'ejs' );

app.use( cookieParser( 'secret_passcode' ) );
app.use( expressSession( {
  secret: 'secret_passcode',
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
} ) );

app.use( layouts );
app.use( passport.initialize() );
app.use( passport.session() );

passport.use( User.createStrategy() );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

app.use( connectFlash() );

app.use( methodOverride( '_method', {
  methods: [ 'POST', 'GET' ]
} ) );

app.use( express.static( 'public' ) );

app.use( bodyParser.urlencoded( {
  extended: false
} ) );
app.use( bodyParser.json() );
app.use( expressValidator() );

app.use( morgan( 'combined' ) );


app.use( ( req, res, next ) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
} );

app.use( '/', router );

const server = app.listen( app.get( 'port' ), () => {
    console.log( `Server running at http://localhost:${app.get( 'port' )}` );
  } ),
  io = require( 'socket.io' )( server );

require( './controllers/chatController' )( io );

module.exports = app;
