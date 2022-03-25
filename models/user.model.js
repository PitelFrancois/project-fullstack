const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 50,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            validate: [isEmail],
            unique: true
        },
        password: {
            type: String,
            required: true,
            maxlength: 255,
            minlength: 6
        },
        picture: {
            type: String,
            default: "./uploads/profil/random-user.png"
        },
        bio: {
            type: String,
            maxlength: 1024
        },
        followers: {
            type: [String]
        },
        following: {
            type: [String]
        },
        likes: {
            type: [String]
        },
        role: {
            type: String,
            default: "user"
        },
        activ: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    }
);

// Fonction qui permet de crypté le mot de passe
userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Fonction pour qui permet de comparer les mots de passe
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password !');
    }
    throw Error('incorrect email');
};

const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;