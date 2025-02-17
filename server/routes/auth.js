const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login
router.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            console.log(" Invalid login attempt");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            console.log("Login successful for user:", user.username);
            res.json({ message: "Login successful", user });
        });
    })(req, res, next);
});

// GitHub Authentication
router.get('/github', passport.authenticate('github'));
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Logout 
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully" });
        });
    });
});

module.exports = router;