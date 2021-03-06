const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const userRoutes = require('./routes/user.routes');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// JWT
app.get('*', checkUser);
app.get('/jwtid', requireAuth , (req, res) => {
    res.status(200).send(res.locals.user._id);
});

// Routes
app.use('/api/user', userRoutes);

// Server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});