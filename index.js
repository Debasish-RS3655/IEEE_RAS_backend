//Import Express
import express from 'express';
const app = express()
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local'

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, event, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false); //no cookies needed
    next(); //pass to the next layer of middleware
});

app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
}))
// This is the basic express session({..}) initialization.
app.use(passport.initialize())
// init passport on every route call.
app.use(passport.session())
// allow passport to use "express-session".


passport.use(new LocalStrategy(authUser))

