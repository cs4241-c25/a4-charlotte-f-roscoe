const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User');

module.exports = function(passport) {

    // storing user id in session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // retrieving user id
    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    // local strategy
    passport.use(new LocalStrategy(function(username, password, done) {
        (async () => {
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    // If no user exists, you might choose to auto-register.
                    const newUser = new User({ username, password });
                    await newUser.save();
                    return done(null, newUser);
                } else {
                    if (password !== user.password) {
                        // Return an error if the password is incorrect.
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        })();
    }));

    // GitHub authentication
    passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        function(accessToken, refreshToken, profile, done) {
            (async () => {
                try {
                    let user = await User.findOne({ githubId: profile.id });
                    if (user) {
                        return done(null, user);
                    } else {
                        const newUser = new User({
                            username: profile.username,
                            githubId: profile.id,
                            password: 'github' // Placeholder value
                        });
                        await newUser.save();
                        return done(null, newUser);
                    }
                } catch (err) {
                    return done(err);
                }
            })();
        }
    ));
};
