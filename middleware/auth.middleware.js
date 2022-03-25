const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

// Méthode afin de vérifier les information de l'utilisateur
module.exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        // Vérification du cookie
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                res.cookie("jwt", "", { maxAge: 1 });
                next();
            } else {
                let user = await UserModel.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

// Méthode qui permet de garder l'utilisateur connecter
module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.send(200).json('no token');
      } else {
        console.log(decodedToken.id + ' conected');
        next();
      }
    });
  } else {
    console.log('No token');
  }
};
  