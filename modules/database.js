var MongoClient = require('mongodb').MongoClient
var mongodb = require('mongodb')
var url = 'mongodb://localhost:27017';
var database_name = "astrology"

var SABIAN_SYMBOLS_AVAILABLE = [];

//TODO, make this an array ob objs to keep track of how many times each occurs
function gather_all_sabian_symbols(){

  // console.log(module.exports.test)
  module.exports.findInCollection('profiles', {}, (profiles)=>{
    console.log('Get all profiles')
    if(!profiles.message) return
    var data = profiles.message
    // console.log(data)
    console.log(data.length)
    data.forEach((profile)=>{
      for( let symbol in profile.symbol_data){
        // console.log(symbol+" : "+profile.symbol_data[symbol])
        // console.log(profile.symbol_data[symbol])//the specific sabian symbol description
        if(SABIAN_SYMBOLS_AVAILABLE.indexOf(profile.symbol_data[symbol])== -1){
          // console.log('adit')
          SABIAN_SYMBOLS_AVAILABLE.push(profile.symbol_data[symbol])
        }else{
          // console.log('got it')
        }
      }
    })
    // return SABIAN_SYMBOLS_AVAILABLE;

  })
}

function check_for_new_symbols(data){
  console.log('check_for_new_symbols')
  console.log('---------  curent  ----------')
  console.log(SABIAN_SYMBOLS_AVAILABLE)
  for (let symbol in data){
    if(SABIAN_SYMBOLS_AVAILABLE.indexOf(data[symbol]) == -1){
      console.log('got a new on, add it to the SABIAN_SYMBOLS_AVAILABLE array')
      SABIAN_SYMBOLS_AVAILABLE.push(data[symbol])
    }else{
      console.log('nothing new here')
      console.log(data[symbol])
    }
  }
}

function get_sabian_symbols_available(){
  if(!SABIAN_SYMBOLS_AVAILABLE.length){
    gather_all_sabian_symbols()
    console.log('THE MongoDB.get_sabian_symbols_available()')
    console.log(SABIAN_SYMBOLS_AVAILABLE)

  }
  return SABIAN_SYMBOLS_AVAILABLE;
}


function handleError(err){
  if(err){
    console.log('-----HandleError helper function found an error------')
    console.log(err)
    console.log('------End of error-------')
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

module.exports ={
  test:'test',
  connectMongo:connectMongo,
  connectionToMongoCollection:connectionToMongoCollection,
  insertIntoMongo:(collectionName, data, callback)=>{
    // console.log(data)
    connectionToMongoCollection(collectionName, function(col, client){
        col.insert(data, function(err, resp){
          if(err){
            console.log('Error Message form DataBaseFunctions insert into mongo')
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
          console.log('err')
          console.log(err)
          callback({err:err})

        }else{
          console.log('succesful update')
          callback({message:resp})

          // console.log(resp)
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
          console.log('err')
          console.log(err)
          callback({err:err})

        }else{
          console.log('succesful update')
          // console.log(resp)
          callback({message:resp})

        }
      })
    })
  },

  findInCollection:(collectionName, objToFindInMongo, callback)=>{
    connectionToMongoCollection(collectionName, function(col, client){
      console.log('collection name ' + col.s.name)
      col.find(objToFindInMongo).toArray(function(err, resultArray){
        if(err){callback({errorMessage:'collection Find Error'})
        }else{
          console.log('found array '+resultArray)
          if(resultArray.length ==0){//no result to return
              console.log('resultArray length = '+resultArray.length)
              console.log('couldnt find ')
              console.log(objToFindInMongo)
              console.log('=>aint in the'+col.s.name+' Collection.')
              client.close()
              callback({errorMessage:'result.length ='+resultArray.length})
          }else{
            console.log('Handle results and pass data back to the callback')
            // callback()
            console.log(resultArray.length)
            client.close()
            callback({message:resultArray})
          }
        }
      })
    })
  },

  findAndDeleteOneInCollection:(collectionName, objToDelete, callback)=>{
    console.log('find an delete')
    connectionToMongoCollection(collectionName, (col, client)=>{
      console.log('the objToDelete is ')
      console.log(objToDelete)
      console.log('type of = '+typeof(objToDelete))
      console.log(objToDelete)
      const _id = new mongodb.ObjectID(objToDelete)
      console.log(typeof(_id))
      col.deleteOne({_id:_id}, (err, resp)=>{
        if(err){
          console.log('we got error')
          callback({err})
        }else{
          console.log('we got delete?')
          // callback({resp})
          callback({message:resp})

        }
      })

    })

    },
    get_sabian_symbols_available:get_sabian_symbols_available,
    check_for_new_symbols:check_for_new_symbols


}

gather_all_sabian_symbols()

