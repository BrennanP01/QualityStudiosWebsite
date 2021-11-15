const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById){
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser = async (email, attemptPassword, done) => {
        var user = await getUserByEmail(email)
        user = user[0]
        if (user == null){
            console.log("no user with that email")
            return done(null, false, {message: 'No user with that email'})
        }
        try{
            if(await bcrypt.compare(attemptPassword, user.password)){
                console.log("Authenticated")
                return done(null, user)
            }else{
                console.log("Wrong Password")
                return done(null, false, {message: 'Password Incorrect'})
            }
        } catch(e) {
            return done(e)
        }
    }))
    passport.serializeUser((user,done) => done(null, user.id))
    passport.deserializeUser((id,done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize