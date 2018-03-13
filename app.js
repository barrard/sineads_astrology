var express = require('express');
var bodyParser = require('body-parser')
var app = express();

//my modules
var MongoDB = require('./modules/database.js');

app.enable('trust proxy');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static(__dirname+'/client'))


app.get('/', (req, res)=>{
  res.sendFile(__dirname+'/client/index.html')
})

app.post('/input', (req, res)=>{
  console.log(req.body)
  var data = req.body
  MongoDB.insertIntoMongo("inputs", data, (resp)=>{
    console.log(resp)
  })
  res.send('OK')
})


app.post('/output', (req, res)=>{
  console.log('output route hit?')
  console.log(req.body)
  var data = req.body
  MongoDB.findInCollection("inputs", data, (resp)=>{
    console.log('//////')
    // console.log(resp)
    res.send(resp)

  })
})


  // var data = {test:"test"}

// MongoDB.insertIntoMongo("test", data, (resp)=>{console.log(resp)})



app.listen(8491)

console.log('listening on port 8491')