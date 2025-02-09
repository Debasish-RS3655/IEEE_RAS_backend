//Import Express
import express from 'express';
const app = express()
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { eventRouter } from './routes/event.js';
import path from 'path';
import { prisma } from './lib/prisma.js';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { fileURLToPath } from "url";
import { coverPictureRouter } from './routes/upload.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from "helmet";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// headers for CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, event, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false); //no cookies needed
    next(); //pass to the next layer of middleware
});

app.use(morgan("combined"));
app.use(helmet());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
}));

// This is the basic express session({..}) initialization.
app.use(passport.initialize());
// init passport on every route call.
app.use(passport.session());
// allow passport to use "express-session".
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/upload', coverPictureRouter);
app.use('/files', express.static(path.join(__dirname, 'uploads')));

app.listen(8080, () => console.log('IEEE RAS Server running.'));