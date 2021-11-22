if(process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}

// Used express to get the file to display
const express = require('express')
const bcrypt = require('bcryptjs')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const LocalStrategy = require('passport-local').Strategy

// mongodb library
const mongoose = require('mongoose')


const dbURL = 'mongodb+srv://qsUser:hum2B2XhbxAg98b@cluster0.rmx4o.mongodb.net/qualityStudios-db?retryWrites=true&w=majority'

const User = mongoose.model("User", new mongoose.Schema(
   {
      firstName: {
          type: String,
          required: true
      },
      lastName: {
          type: String,
          required: true
      },
      email: {
          type: String,
          required: true
      },
      password: {
          type: String,
          required: true
      }
  }
))

passport.use(
   new LocalStrategy({usernameField: 'email'}, (email, attemptPassword, done) => {
      User.findOne({email: email})
         .then(user => {
            if(!user){
               console.log("No user with that email")
               return done(null, false, {message: 'No user with that email'})
            }
            else{
               try{
                  if (bcrypt.compare(attemptPassword, user.password)) {
                     return done(null, user)
                  } else {
                     console.log("Wrong password")
                     return done(null, false, {message: "Wrong password"})
                  }
               }catch(err){
                  console.log(err)
               }
            }
         })
}))
passport.serializeUser((user,done) => done(null, user.id))
passport.deserializeUser((id,done) => {
   User.findById(id, function(err, user){
      done(null, {
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email
      })
   })
})

console.log("Attempting connection to database...")
mongoose.connect(dbURL)
   .then(()=> {
      console.log("Connected to database")
   })
   .catch((err) => console.log(err))

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}))

app.set('view engine', 'handlebars')
// Gets the current directory, and adds the "public" file
// This will display the html in the root directory of public. (no need to put it in the views folder)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



//Reads staff directory file
function readFile() {
   return new Promise((resolve, reject) => {
      fs.readFile('public/files/staff.txt', 'utf8', function(err, data) {
         if(err) return reject (err)
         let arr = data.toString().replace(/\r/g, '').split('\n')
         const staff = {}
         let new_person, list
         for(i in arr) {
            let line = arr[i]
            let parts =line.split('\t')
            let section = parts[0].toLowerCase()
            switch (section) {
               case 'name':
                  new_person = parts[1].split(' ')[0].toLowerCase()
                  staff[new_person] = {name: parts[1]}
                  break
               case 'photo':
               case 'booksy':
               case 'link':
               case 'number':
               case 'specialty':
               case 'instagram':
               case 'site':
                  if (parts[1] == 'N/A'){
                     staff[new_person][section] = undefined
                  }else{
                     staff[new_person][section] = parts[1]
                  }
                  break
               case 'hours':
               case 'pricing':
                  list = section
                  staff[new_person][list] = {}
                  break
               case '':
                  staff[new_person][list][parts[1]] = parts.slice(2)
            }
         }
         //console.log(staff)
         resolve(staff)
      })
   })
}

/*This will load the homepage of the Website*/
app.get('/',(req,res)=>{
   // console.log(req)
   // console.log(res)
   res.render('home', {user: req.user})
})

app.get('/map',(req,res)=>{
    res.render('map', {user: req.user})
 })

 app.get('/social',(req,res)=>{
    res.render('social', {user: req.user})
 })

 app.get('/portfolio',(req,res)=>{
    res.render('portfolio', {user: req.user})
 })
 app.get('/reviews' ,(req,res)=>{
    res.render('reviews', {user: req.user})
 })

 app.get('/staff', async (req,res)=>{
      const staff = await readFile()
      res.render('staff', {
         style: "/css/staff.css",
         user: req.user,
         staff
      })
 })
 

  // Forces the user to log in to schedule an appointment
  app.get('/schedule', checkAuthenticated, (req,res)=>{
   res.render('schedule', {user: req.user})
})

 app.get('/about',(req,res)=>{
    res.render('about', {user: req.user})
 })

 app.get('/login', checkNotAuthenticated,(req,res)=>{
   res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
   successRedirect: '/',
   failureRedirect: '/login',
   failureFlash: true
}))

app.get('/register', checkNotAuthenticated,(req,res)=>{
   res.render('register')
})

app.post('/register', checkNotAuthenticated, (req,res)=>{
   try{
      // add user to the database
      const salt = bcrypt.genSaltSync(10)
      const hashedPassword = bcrypt.hashSync(String(req.body.password), salt)
      var fName = String(req.body.firstName)
      var lName = String(req.body.lastName)
      var emai = String(req.body.email)

      const userEntry = new User({
         firstName: fName,
         lastName: lName,
         email: emai,
         password: hashedPassword
      })
      userEntry.save()
         .then((result)=>{
            res.redirect('/login')
         })
         .catch((err)=>{
            console.log(err)
         })
   }catch(e){
      console.log(e)
      res.redirect('/register')
   }
})

app.delete('/logout', (req, res) => {
   req.logOut()
   res.redirect('/')
})

function checkAuthenticated(req, res, next) {
   if(req.isAuthenticated()){
      return next()
   }else{
      res.redirect('/login')
   }
}

function checkNotAuthenticated(req, res, next) {
   if(req.isAuthenticated()){
      return res.redirect('/')
   }else{
      next()
   }
}

app.listen(port, ()=>console.log(
   `Express started on http://localhost:${port}; ` +
   `press Ctrl-C to terminate.`
))