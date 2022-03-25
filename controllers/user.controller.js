const UserModel = require('../models/user.model');
const objectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');

// Durée de vie du token de connexion
const maxAge =  3 * 24 * 60 *60 * 1000;

// Fonction pour créer un token pour de connexion
const createToken = (id) => {
    return jwt.sign({id}, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    });
};

// Méthode qui permet à l'utilisateur de s'inscrire
module.exports.signUp = async (req, res) => {
    // Récupération des éléments envoyés par le formulaire
    const { pseudo , email, password} = req.body;
    try {
        // Inscription de l'utilisateur
        const user = await UserModel.create({pseudo, email, password});
        // Réponse
        res.status(201).json({ user: user._id });
    } catch (err) {
        // Ciblage de l'erreur de mongo
        const errors = signUpErrors(err);
        // Envoi de l'erreur
        res.status(200).send({ errors });
    }
};

// Méthode qui permet à l'utilisateur de se connecter
module.exports.signIn = async (req, res) => {
    // Récupération des éléments envoyés par le formulaire
    const { email, password} = req.body;
    try {
        // Vérification de l'email et du mot de passe
        const user = await UserModel.login(email, password);
        // Création du token
        const token = createToken(user._id);
        // Création du cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge:maxAge });
        // Réponse
        res.status(200).json({ user: user._id});
    } catch (err) {
        // Ciblage de l'erreur de mongo
        const errors = signInErrors(err);
        // Envoi de l'erreur
        res.status(200).send({ errors });
    }
};

// Méthode qui permet à l'utilisateur de se déconnecter
module.exports.logout = async (req, res) => {
    // Disparition du cookie au bout d'une milliseconde
    res.cookie('jwt', '', {maxAge: 1});
    // Redirection
    res.redirect('/');
};

// Méthode qui permet de récupérer tous les utilisateurs
module.exports.getAllUsers = async (req, res) => {
    // Récupération des utilisateurs sans le mot de passe
    const users = await UserModel.find().select('-password');
    // Réponse
    res.status(200).json(users);
};

// Méthode qui permet de récupérer un utilisateur
module.exports.getOneUser = async (req, res) => {
    // Vérification de l'existence de l'id dans la bdd
    if (!objectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknowm :' + req.params.id)
    } else {
        // Récupération de l'utilisateur sans le mot de passe
        UserModel.findById(req.params.id, (err, docs) => {
            if (!err) {
                // Réponse
                res.send(docs);
            } else {
                // Envoi de l'erreur
                console.log('ID unknowm :' + req.params.id);
            }
        }).select('-password');
    };
};

// Méthode qui permet de modifier un utilisateur
module.exports.updateUser = async (req, res) => {
    // Vérification de l'existence de l'id dans la bdd
    if (!objectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknowm :' + req.params.id)
    } else {
        try {
            // Modification de la bio de l'utilisateur
            UserModel.findOneAndUpdate(
                {_id: req.params.id},
                {
                    $set: {
                        bio: req.body.bio
                    }
                },
                { new: true, upsert: true, setDefaultsOnInsert: true},
                (err, docs) => {
                    if (!err) {
                        // Réponse
                        return res.send(docs);
                    } else if (err) {
                        // Envoi de l'erreur
                        return res.status(500).send({ message: err});
                    };
                }
            )
        } catch (err) {
            // Envoi de l'erreur
            return res.status(500).json({ message : err});
        }
    }
};

// Méthode qui permet de supprimer un utilisateur
module.exports.deleteUser = async (req, res) => {
    // Vérification de l'existence de l'id dans la bdd
    if (!objectId.isValid(req.params.id)) {
        // Envoi d'un message d'ereur
        return res.status(400).send('ID unknowm :' + req.params.id)
    } else {
        try {
            // Suppression de l'utilisateur
            await UserModel.deleteOne({ _id: req.params.id }).exec();
            // Réponse
            res.status(200).json({ message: "Successfully deleted"})
        } catch (err) {
            // Renvoi de l'erreur
            return res.status(500).json({ message: err});
        }
    }
};

// Méthode qui permet de suivre un utilisateur
module.exports.follow = async (req, res) => {
    // Vérification de l'existence des id dans la bdd
    if ( !objectId.isValid(req.params.id) || !objectId.isValid(req.body.idToFollow)) {
        // Envoi d'un message d'ereur
        return res.status(400).send("ID unknown : " + req.params.id);
    }
    if ( req.params.id === req.body.idToFollow) {
        // Envoi d'un message d'ereur
        return res.status(400).send("Impossible de se follow soit même");
    }
    try {
        // Modification de l'utilsateur à suivre
        UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true },
            (err, docs) => {
                if (!err) {
                    // Réponse
                    res.status(201).json(docs);
                } else {
                    // Envoi d'un message d'erreur
                    return res.status(400).json(err);
                }
            }
        );
        // Modification de l'utilisateur qui est suivi
        UserModel.findByIdAndUpdate(
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true },
            (err, docs) => {
                // Envoi d'un message d'ereur
                if (err) return res.status(400).json(err);
            }
        );
    } catch (err) {
        // Envoi d'un message d'erreur
        return res.status(500).json({ message: err });
    }
};

// Méthode qui permet de ne plus suivre un utilisateur
module.exports.unfollow = async (req, res) => {
    // Vérification de l'existence des id dans la bdd
    if ( !objectId.isValid(req.params.id) || !objectId.isValid(req.body.idToUnfollow)) {
        // Envoi d'un message d'ereur
        return res.status(400).send("ID unknown : " + req.params.id);
    }
    try {
        // Modification de l'utilsateur à suivre
        UserModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow } },
            { new: true, upsert: true },
            (err, docs) => {
                if (!err) {
                    // Réponse
                    res.status(201).json(docs);
                } else {
                    // Envoi d'un message d'erreur
                    return res.status(400).json(err);
                }
            }
        );
        // Modification de l'utilisateur qui est suivi
        UserModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } },
            { new: true, upsert: true },
            (err, docs) => {
                // Envoi d'un message d'ereur
                if (err) return res.status(400).json(err);
            }
        );  
    } catch (err) {
        // Envoi d'un message d'ereur
        return res.status(500).json({ message: err});
    }
};