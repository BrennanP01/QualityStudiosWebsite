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

const Staff = mongoose.model("Staff", new mongoose.Schema(
   {
      name: {type: String, required:true},
      booksy: {type: String},
      site: {type: String},
      link: {type: String},
      number: {type: String},
      speciality: {type: String},
      instagram: {type: String},
      hours: {
         M: [String],
         T: [String],
         W: [String],
         TH: [String],
         F: [String],
         SA: [String],
         SU: [String],
      },
      pricing: {
         "Men's Haircut": [String],
         "Men's Haircut & Beard": [String],
         "Kid's Haircut": [String],
         "Beard/Hair Lineup": [String],
         "Eyebrows/Black Face Mask": [String],
         "Full Service w/ Hot Towel Shave & Eyebrows": [String],
         "Before/After Hours Services": [String],
         "Women’s Haircut": [String],
         "Men’s Haircut & Eyebrows": [String],
         "Men’s Haircut, Eyebrows & Beard": [String],
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

//Custom helpers (Will try to put them in a seperate file)
var hbs = expressHandlebars.create({});

hbs.handlebars.registerHelper("makeTable", function(staff) {
   //Declare variables
   let week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
   let week_abr = ['M', 'T', 'W', 'T', 'F', 'SA', 'SU']
   let start = {hour: 9, mins: '00', period: 'AM'}
   let end = {hour: 8, mins: '30', period: 'PM'}
   let step = {...start};
   let dom = ''
   //Make times
   times = []
   while (step.hour != end.hour || step.mins != end.mins || step.period != end.period) {
      times.push(step.hour + ':' + step.mins + ' ' + step.period)
      if (step.mins == '00') {
         step.mins = '30'
      } else if (step.mins = '30') {
         step.hour++
         step.mins = '00'
         if (step.hour == 12) {
            step.period = 'PM'
         }
         if (step.hour == 13) {
            step.hour = 1
         }
      }
   }
   //console.log(times)
   //Make table
   week.forEach((day, i) => {
      dom += '<table style="width: 100%">'
      dom += '<tr>'
      dom += '<th style="background-color: gold; color: white">' + day + '</th>'
      times.forEach((hour, j) => {
         if (j % 2 == 0) {
            dom += '<th colspan="2" style="background-color: silver">' + hour + '</th>'
         }
       })
       dom += '</tr>'
       Object.values(this).forEach(person => {
         if (person.hours) {
            dom += '<tr>'
            dom += '<td style="background-color: silver">' + person.name + '</td>'
            let cell_color = 'black'
            times.forEach(hour => {
               if (person.hours[week_abr[i]] && person.hours[week_abr[i]][0]) { //If person has week day and if person day doesn't equal N/A (Might make a fileWriter next sprint)
                  if (hour == person.hours[week_abr[i]][0]) {
                  cell_color = 'white'
                  } else if (hour == person.hours[week_abr[i]][1]) {
                  cell_color = 'black'
                  }
               }      
               dom += '<td style="background-color: ' + cell_color + '"></td>'
            })
         }     
         dom += '</tr>'
       })
       dom += '</table>'
   })
   return dom
});

/*This will load the homepage of the Website*/
app.get('/',(req,res)=>{
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
   const staff = await Staff.find({}).lean()
   res.render('staff', {
      style: '/css/staff.css',
      user: req.user,
      staff
   })
 })

  // Forces the user to log in to schedule an appointment
  app.get('/schedule', async (req,res)=>{
   const staff = await Staff.find({}).lean()
   res.render('schedule', {
      style: '/css/schedule.css',
      script:'/scripts/schedule.js',
      staff,
      user: req.user
   })
   })
 app.get('/about',(req,res)=>{
    res.render('about', {user: req.user})
 })

 app.get('/login', checkNotAuthenticated,(req,res)=>{
   res.render('login', {style: "/css/login.css"})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
   successRedirect: '/',
   failureRedirect: '/login',
   failureFlash: true
}))

app.get('/register', checkNotAuthenticated,(req,res)=>{
   res.render('register', {style: "/css/login.css"})
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
