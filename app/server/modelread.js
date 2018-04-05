const fs = require('fs');
let dbm = require('./db').getModelDatabase();

let object = fs.readFileSync('./server/model.json');
let obj = JSON.parse(object);
/* aa.insert({"modeljson" : obj}, "test", function(err, body, header){
  console.log(err);
  console.log('ok')
}) */

/* aa.get("test", function(err, body, header) {
  console.log(body.modeljson);
}); */

/* aa.get("test", function(err, body, header) {
  let newObject = fs.readFileSync('./server/model.json');
  body.modeljson = JSON.parse(newObject);
  aa.insert(body, function(err, body, header) {
    console.log(body);
    console.log("ok");
  });
}); */