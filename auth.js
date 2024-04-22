const jwtSecret = 'your_jwt_secret'; // Same key used in the JWTStrategy
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // This is the username encodine in JWT
        expiresIn: '7d', // Specifies that the token will expire in 7 days
        algorithm: 'HS256' // Algorithm used to "sign" or encode the values of the JWT
    });
}

/* POST login. */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        console.log('Inside /login route');
        passport.authenticate('local', { session: false }, 
            (error, user) => {
                console.log('Inside passport.authenticate callback');
                if (error || !user) {
                    return res.status(400).json({
                        message: 'Something is not right',
                        user: user
                    });
                }
                req.login(user, { session: false }, (error) => {
                    if (error) {
                        console.log('Error during login:', error);
                        res.send(error);
                    }
                    let token = generateJWTToken(user.toJSON());
                    console.log('Generated token:', token);
                    return res.json({ user, token });
                });
            })(req, res);
        });
    }
 
