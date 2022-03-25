const mongoose = require('mongoose');
require('dotenv').config({path: './config/.env'});

// Connexion à MongoDb
mongoose
    .connect(process.env.DATABASE_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Failed to connect to MongoDB ', err))