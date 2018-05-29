var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var mongodb = require('mongodb')

var colors = require('colors');
var logger = require('tracer').colorConsole({
                    format : "{{timestamp.green}} <{{title.yellow}}> {{message.cyan}} (in {{file.red}}:{{line}})",
                    dateformat : "HH:MM:ss.L"
                })

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
  logger.log(req.body)
  var data = req.body
  if(Util.verify_full_obj(data)){
    MongoDB.insertIntoMongo("inputs", data, (resp)=>{
      logger.log(resp)
      res.send(resp)

    })
  }else{
    res.send('fail')

  }

})


app.post('/input_edit', (req, res)=>{
  logger.log('input_edit route hit?')
  logger.log(req.body)
  var data = req.body
  var at = data.section+"-description"
  MongoDB.update_at("inputs", data, at, (resp)=>{
    logger.log('//////')
    // logger.log(resp)
    if (resp.err){
      res.send({err:'Sorry there was an error trying to Save, please contact Dave'})

    }else{
      res.send({message:"Saved!"})
    }

  })
})

app.post('/output', (req, res)=>{
  logger.log('output route hit?')
  logger.log(req.body)
  var data = req.body
  MongoDB.findInCollection("inputs", data, (resp)=>{
    logger.log('//////')
    // logger.log(resp)
    res.send(resp)

  })
})


app.post('/delete_description', (req, res)=>{
  logger.log('delete_description route hit?')
  logger.log(req.body)
  var data = req.body
  MongoDB.findAndDeleteOneInCollection("inputs", data._id, (resp)=>{
    logger.log('//////')
    logger.log('deleted description callback')
    // logger.log(resp)
    // console.error(resp)
    res.send('resp')

  })
})




app.post('/add_new_sabian_symbol_profile', (req, res)=>{
  const symbols = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Descendant', 'Midheaven', 'Nadir', 'North Node', 'South Node'];
  var symbol_data = {}
  symbols.forEach((key)=>{  symbol_data[key]=''  })

  logger.log(req.body)
  let name = req.body.name
  MongoDB.insertIntoMongo("profiles", {name:name, symbol_data:symbol_data}, (resp)=>{
    logger.log('//////')
    const id = new mongodb.ObjectID(resp.message.insertedIds[0])

    if(!resp.errorMessage){
      MongoDB.findInCollection("profiles", {_id:id}, (resp)=>{
        logger.log('//////')
        logger.log(resp)
        res.send(resp)

      })
    }
    // logger.log(resp)
    // res.send(resp)

  })
})

app.post('/save_sabian_symbol_profile', (req, res)=>{
  const data = req.body.data
  const name = req.body.name
  const id = new mongodb.ObjectID(req.body.id)

  if(!data || !name)return
  logger.log('save_sabian_symbol_profile')
  logger.log('name')
  logger.log('id')
  logger.log(name)
  logger.log(id)
  // logger.log(data)
  MongoDB.update("profiles", id, data, (resp)=>{
    // logger.log(resp)
    if(resp.err){
      res.send({err:'The save didnt work, please contact Dave'})
    }else if(resp.message){
      // var array = MongoDB.get_sabian_symbols_available()
      // var SYMBOL_DATA_OBJ = MongoDB.get_SYMBOL_DATA_OBJ()
      MongoDB.gather_all_sabian_symbols((data)=>{res.send(data)})
    }
  })
})


app.post('/get_all_profiles', (req, res)=>{
  logger.log(req.body)
  MongoDB.findInCollection("profiles", {}, (resp)=>{
    logger.log('get_all_profiles')
    // logger.log(resp)
    res.send(resp)

  })
})

app.post('/delete_profile', (req, res)=>{
  logger.log('/delete profile route')
  logger.log(req.body)
  var id = req.body._id
  MongoDB.findAndDeleteOneInCollection("profiles", id, (resp)=>{
    logger.log('delete_profile')
    logger.log(resp)
    res.send('ok')

  })
})

app.post('/get_sabian_profile', (req, res)=>{
  logger.log(req.body._id)
  const _id = new mongodb.ObjectID(req.body._id)
  MongoDB.findInCollection("profiles", {_id:_id}, (resp)=>{
    logger.log('get_sabian_profile')
    logger.log(resp)
    res.send(resp)

  })
})

app.get('/get_sabian_symbols_availale_array', (req, res)=>{
  // var array = MongoDB.get_sabian_symbols_available()
  logger.log('get_sabian_symbols_availale_array')
  // var SYMBOL_DATA_OBJ = MongoDB.get_SYMBOL_DATA_OBJ()
  MongoDB.gather_all_sabian_symbols((data)=>{res.send(data)})
  

})



  // var data = {test:"test"}

// MongoDB.insertIntoMongo("test", data, (resp)=>{logger.log(resp)})



app.listen(8491)

logger.log('listening on port 8491')