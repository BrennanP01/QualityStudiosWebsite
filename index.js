if(process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}

// Used express to get the file to display
const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
// mongodb library
const mongoose = require('mongoose')
const User = require('./models/user')


const initializePassport = require('./passport-config')
initializePassport(
   passport, 
   email = async () => {
      try{
         return await User.find({email: "w@w"})
      } catch {
         console.log("err")
         return null;
      }
   },
   id = async () => {
      try{
         return await User.findById(id).result
      }catch{
         console.log("err")
         return null;
      }
   }
)

const dbURL = 'mongodb+srv://qsUser:hum2B2XhbxAg98b@cluster0.rmx4o.mongodb.net/qualityStudios-db?retryWrites=true&w=majority'

console.log("Attempting connection to database...")
mongoose.connect(dbURL)
   .then((result)=> {
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
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
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
                  staff[new_person][section] = parts[1]
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
         // console.log(staff)
         resolve(staff)
      })
   })
}
/*This will load the homepage of the Website*/
app.get('/',(req,res)=>{
   res.render('home')
})

app.get('/map',(req,res)=>{
    res.render('map')
 })

 app.get('/social',(req,res)=>{
    res.render('social')
 })

 app.get('/portfolio',(req,res)=>{
    res.render('portfolio')
 })

 app.get('/staff', async (req,res)=>{
      const staff = await readFile()
      res.render('staff', {
         style: "/css/staff.css",
         staff
      })
 })

 // Forces the user to log in to schedule an appointment
 app.get('/schedule', checkAuthenticated, (req,res)=>{
   res.render('schedule')
})

 app.get('/about',(req,res)=>{
    res.render('about')
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
//--
app.post('/register', checkNotAuthenticated, async (req,res)=>{
   try{
      // add user to the database
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const userEntry = new User({
         firstName: req.body.firstName,
         lastName: req.body.lastName,
         email: req.body.email,
         password: hashedPassword
      })
      userEntry.save()
         .then((result)=>{
            res.redirect('/login')
         })
         .catch((err)=>{
            console.log(err)
         })
   }catch{
      res.redirect('/register')
   }
})
/
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