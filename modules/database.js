var MongoClient = require('mongodb').MongoClient
var mongodb = require('mongodb')
var url = 'mongodb://localhost:27017';
var database_name = "astrology"

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
        }else{
          console.log('succesful update')
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
        }else{
          console.log('succesful update')
          // console.log(resp)
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
    connectionToMongoCollection(collectionName, (col, client)=>{
      console.log(typeof(objToDelete))
      const _id = new mongodb.ObjectID(objToDelete)
      console.log(typeof(_id))
      col.deleteOne({_id:_id}, (err, resp)=>{
        if(err){
          console.log('we got error')
          callback({err})
        }else{
          console.log('we got delete?')
          // callback({resp})
        }
      })

    })

    }


}