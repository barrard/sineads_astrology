var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var mongodb = require('mongodb')

//my modules
var MongoDB = require('./modules/database.js');
var Util = require('./modules/util.js');

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
  if(Util.verify_full_obj(data)){
    MongoDB.insertIntoMongo("inputs", data, (resp)=>{
      console.log(resp)
      res.send(resp)

    })
  }else{
    res.send('fail')

  }

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


app.post('/delete_description', (req, res)=>{
  console.log('delete_description route hit?')
  console.log(req.body)
  var data = req.body
  MongoDB.findAndDeleteOneInCollection("inputs", data._id, (resp)=>{
    console.log('//////')
    console.log(resp)
    console.error(resp)
    res.send('resp')

  })
})




app.post('/add_new_sabian_symbol_profile', (req, res)=>{
  const symbols = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Descendant', 'Midheaven', 'Nadir', 'North Node', 'South Node'];
  var symbol_data = {}
  symbols.forEach((key)=>{  symbol_data[key]=''  })

  console.log(req.body)
  let name = req.body.name
  MongoDB.insertIntoMongo("profiles", {name:name, symbol_data:symbol_data}, (resp)=>{
    console.log('//////')
    console.log(resp)
    res.send(resp)

  })
})


app.post('/get_all_profiles', (req, res)=>{
  console.log(req.body)
  MongoDB.findInCollection("profiles", {}, (resp)=>{
    console.log('//////')
    console.log(resp)
    res.send(resp)

  })
})

app.post('/delete_profile', (req, res)=>{
  console.log(req.body)
  let id = req.body._id
  MongoDB.findAndDeleteOneInCollection("profiles", id, (resp)=>{
    console.log('//////')
    console.log(resp)
    res.send('ok')

  })
})

app.post('/get_sabian_profile', (req, res)=>{
  console.log(req.body._id)
  const _id = new mongodb.ObjectID(req.body._id)
  MongoDB.findInCollection("profiles", {_id:_id}, (resp)=>{
    console.log('//////')
    console.log(resp)
    res.send(resp)

  })
})



  // var data = {test:"test"}

// MongoDB.insertIntoMongo("test", data, (resp)=>{console.log(resp)})



app.listen(8491)

console.log('listening on port 8491')