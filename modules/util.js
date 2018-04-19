var colors = require('colors');
var logger = require('tracer').colorConsole({
                    format : "{{timestamp.green}} <{{title.yellow}}> {{message.cyan}} (in {{file.red}}:{{line}})",
                    dateformat : "HH:MM:ss.L"
                })



module.exports ={
  verify_full_obj:(obj)=>{
    for( let k in obj){
      if(!obj[k]){
        logger.log(k)
        return false
      }
    }
    return "object_is_full"
  }
}


// var test_obj ={
//   a:'a',
//   b:'b',
//   1:'',
//   2:2,
//   c:undefined,
//   d:null
// }

//   function verify_full_obj(obj){
//     for( let k in obj){
//       if(!obj[k]) return false
//     }

//   }