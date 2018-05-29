var colors = require('colors');
var logger = require('tracer').colorConsole({
                    format : "{{timestamp.green}} <{{title.yellow}}> {{message.cyan}} (in {{file.red}}:{{line}})",
                    dateformat : "HH:MM:ss.L"
                })
var MongoClient = require('mongodb').MongoClient
var mongodb = require('mongodb')
var url = 'mongodb://localhost:27017';
var database_name = "astrology"
// var database_name = "astr"

var SABIAN_SYMBOLS_AVAILABLE = [];
var SYMBOL_DATA_OBJ = {};

//TODO, make this an array ob objs to keep track of how many times each occurs
function gather_all_sabian_symbols(callback){
  SABIAN_SYMBOLS_AVAILABLE.length = 0
  SYMBOL_DATA_OBJ = {};
  // logger.log(module.exports.test)
  module.exports.findInCollection('profiles', {}, (profiles)=>{
    logger.log('Get all profiles')
    if(!profiles.message) return
    var data = profiles.message
    // logger.log(data)
    // logger.log(data.length)
    data.forEach((profile)=>{
      for( let symbol in profile.symbol_data){
        // logger.log(symbol+" : "+profile.symbol_data[symbol])
        // logger.log(profile.symbol_data[symbol])//the specific sabian symbol description
        if(SABIAN_SYMBOLS_AVAILABLE.indexOf(profile.symbol_data[symbol])== -1){
          // logger.log('adit')
          SABIAN_SYMBOLS_AVAILABLE.push(profile.symbol_data[symbol])
          SYMBOL_DATA_OBJ[profile.symbol_data[symbol]] = [{[profile.name]:symbol}]

        }else{
          SYMBOL_DATA_OBJ[profile.symbol_data[symbol]].push({[profile.name]:symbol})
          // logger.log('got it')
        }
      }
    })//symbols_available:array, symbol_count_data:SYMBOL_DATA_OBJ
    logger.log('returning all data')
    // logger.log({symbols_available:SABIAN_SYMBOLS_AVAILABLE, symbol_count_data:SYMBOL_DATA_OBJ})
    callback({symbols_available:SABIAN_SYMBOLS_AVAILABLE, symbol_count_data:SYMBOL_DATA_OBJ})

  })
}

// function check_for_new_symbols(data){
//   logger.log('check_for_new_symbols')
//   logger.log('---------  curent  ----------')
//   logger.log(SABIAN_SYMBOLS_AVAILABLE)
//   for (let symbol in data){
//     if(SABIAN_SYMBOLS_AVAILABLE.indexOf(data[symbol]) == -1){
//       logger.log('got a new on, add it to the SABIAN_SYMBOLS_AVAILABLE array')
//       SABIAN_SYMBOLS_AVAILABLE.push(data[symbol])
//     }else{
//       logger.log('nothing new here')
//       logger.log(data[symbol])
//     }
//   }
// }

function get_sabian_symbols_available(){
    gather_all_sabian_symbols()
    logger.log('THE MongoDB.get_sabian_symbols_available()')
    logger.log(SABIAN_SYMBOLS_AVAILABLE)

  return SABIAN_SYMBOLS_AVAILABLE;
}

function get_SYMBOL_DATA_OBJ(){
  return SYMBOL_DATA_OBJ;
}


function handleError(err){
  if(err){
    logger.log('-----HandleError helper function found an error------')
    logger.log(err)
    logger.log('------End of error-------')
    return false
  }else{
    return true
  }
}


function connectMongo(callback){
  MongoClient.connect(url, function(err, client) {
    if(handleError(err)){
        callback(client)
    }else{
      return false
    }
   })

}

function connectionToMongoCollection(collectionName, callback){
  connectMongo(function(client){
    var db = client.db(database_name)
    var col = db.collection(collectionName)
    callback(col, client)
  })
}
get_sabian_symbols_available
get_SYMBOL_DATA_OBJ

module.exports ={
  test:'test',
  connectMongo:connectMongo,
  connectionToMongoCollection:connectionToMongoCollection,
  insertIntoMongo:(collectionName, data, callback)=>{
    // logger.log(data)
    connectionToMongoCollection(collectionName, function(col, client){
        col.insert(data, function(err, resp){
          if(err){
            logger.log('Error Message form DataBaseFunctions insert into mongo')
            callback({errorMessage:err})
          }else{
            callback({message:resp})
          }
          client.close()

        })
    })
  },
  update:(collectionName, id, data, callback)=>{
    connectionToMongoCollection(collectionName, function(col, client){
      col.update({_id:id}, {$set:{symbol_data:data}} ,(err, resp)=>{
        if(err){
          logger.log('err')
          logger.log(err)
          callback({err:err})

        }else{
          logger.log('succesful update')
          callback({message:resp})

          // logger.log(resp)
        }
      })
    })
  },

  update_at:(collectionName, data, at, callback)=>{
    const id = new mongodb.ObjectID(data.id)
    var data = data.data
    connectionToMongoCollection(collectionName, function(col, client){
      col.update({_id:id}, {$set:{[at]:data}} ,(err, resp)=>{
        if(err){
          logger.log('err')
          logger.log(err)
          callback({err:err})

        }else{
          logger.log('succesful update')
          // logger.log(resp)
          callback({message:resp})

        }
      })
    })
  },

  findInCollection:(collectionName, objToFindInMongo, callback)=>{
    connectionToMongoCollection(collectionName, function(col, client){
      logger.log('collection name ' + col.s.name)
      col.find(objToFindInMongo).toArray(function(err, resultArray){
        if(err){callback({errorMessage:'collection Find Error'})
        }else{
          logger.log('found array - '+resultArray.length+" - total")
          if(resultArray.length ==0){//no result to return
              logger.log('resultArray length = '+resultArray.length)
              logger.log('couldnt find ')
              logger.log(objToFindInMongo)
              logger.log('=>aint in the'+col.s.name+' Collection.')
              client.close()
              callback({errorMessage:'result.length ='+resultArray.length})
          }else{
            logger.log(`findInCollection: ${collectionName} success`)
            // callback()
            // logger.log(resultArray.length)
            client.close()
            callback({message:resultArray})
          }
        }
      })
    })
  },

  findAndDeleteOneInCollection:(collectionName, objToDelete, callback)=>{
    logger.log('find an delete')
    connectionToMongoCollection(collectionName, (col, client)=>{
      logger.log('the objToDelete is ')
      logger.log(objToDelete)
      logger.log('type of = '+typeof(objToDelete))
      logger.log(objToDelete)
      const _id = new mongodb.ObjectID(objToDelete)
      logger.log(typeof(_id))
      col.deleteOne({_id:_id}, (err, resp)=>{
        if(err){
          logger.log('we got error')
          callback({err})
        }else{
          logger.log('we got delete?')
          // callback({resp})
          callback({message:resp})

        }
      })

    })

    },
    gather_all_sabian_symbols:gather_all_sabian_symbols,
    // get_sabian_symbols_available:get_sabian_symbols_available,
    // get_SYMBOL_DATA_OBJ:get_SYMBOL_DATA_OBJ


}

gather_all_sabian_symbols((data_obj)=>{return data_obj})

