const nano = require('nano');

// require('dotenv').load();
// let username = process.env.cloudant_username || "nodejs";
// let password = process.env.cloudant_password;
// let url = "https://"+username+":"+password+"@"+username+".cloudant.com"
// let cloudant = nano("https://"+username+".cloudant.com");

/* cloudant.auth(username, password, function (err, body, headers) {
  if (!err) {
    cookies[username] = headers['set-cookie'];
    cloudant = nano({
      url: "https://"+username+".cloudant.com",
      cookie: cookies[username]
    });
    
    // ping to ensure we're logged in
    cloudant.request({
      path: 'test_porter'
    }, function (err, body, headers) {
      if (!err) {
        console.log(body, headers);
      }
      else {
        console.log("Could not connect to server.")
      }
    });
  }
}); */

let url = 'https://58dce9f5-340c-4123-93a2-19fb379d26a7-bluemix:0a5c5e9b39efbd7f725d6d9f758385f6237578d58479e793b73de7822df0d1e5@58dce9f5-340c-4123-93a2-19fb379d26a7-bluemix.cloudant.com';

let account = nano(url);
let db = account.use('user_details');


exports.getDatabase = function() {
  return db; 
}