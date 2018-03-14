module.exports ={
  verify_full_obj:(obj)=>{
    for( let k in obj){
      if(!obj[k]){
        console.log(k)
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