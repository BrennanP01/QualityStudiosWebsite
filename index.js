// Used express to get the file to display
var express = require('express')
var app = express()
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}))


app.set('view engine', 'handlebars')
// Gets the current directory, and adds the "public" file
// This will display the html in the root directory of public. (no need to put it in the views folder)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

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

 app.get('/staff',(req,res)=>{
    res.render('staff')
 })

 app.get('/about',(req,res)=>{
    res.render('about')
 })

app.listen(port, ()=>console.log(
    `Express started on http://localhost:${port}; ` +
    `press Ctrl-C to terminate.`
))
