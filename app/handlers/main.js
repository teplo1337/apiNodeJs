'use strict';
const cookie      = require('../cookie/cookie'),
{sign, unsign}    = require('cookie-signature'),
config            = require('../db/config'),
url               = require('url'),
pug               = require('pug'),
MongoClient       = require('mongodb').MongoClient,
fs                = require('fs');

class main {

  static index(request, response) {
    fs.readFile('./app/HTML/index.html', { encoding: 'utf8' }, function(error, view) {
      if (!error) {
        response.writeHead(200, { 'Content-Type': 'text/html'});
        response.write(view);
        response.end();
      }
    });
  }

  static auth(request, response) {
    var query = url.parse(request.url, true).query;
    MongoClient.connect(config.db.uri, function(err, db) {
      const collection = db.collection('userCollection');
      collection.findOne({"login" : query.login, "password" : query.password }, function(err, result) {
        if (!result) {
          console.log('error');
          main.index(request, response);
        }
        else {
          cookie.set(response, 'login', sign(query.login, 'secret'));
          main.redirect(response, '/profile');
        }
      });
    });
  }

  static profile(request, response) {
    try {
      const cookieValue = cookie.get(request, 'login');
      const cookieLogin = unsign(cookieValue, 'secret');
      MongoClient.connect(config.db.uri, function(err, db) {
       const collection = db.collection('userCollection');
       collection.findOne({ "login" : cookieLogin }, function(err, result) {
        if (!result) {
          cookie.set(response, 'login', null);
          main.index(request, response);
        }
        else {
          const options = {
            login : result.login,
            password : result.password,
            country : result.country
          }
          const html = pug.renderFile('./app/pug/profile.pug', options );
          response.writeHeader(200, {"Content-Type": "text/html"});
          response.write(html);
          response.end();
        }
      });
    });
   }
   catch(e) {
     main.index(request, response);
   }
 }

  static changes(request, response) {
    try {
      const cookieValue = cookie.get(request, 'login');
      const cookieLogin = unsign(cookieValue, 'secret');
      var query = url.parse(request.url, true).query;
      console.log(query);
      MongoClient.connect(config.db.uri, function(err, db) {
       const collection = db.collection('userCollection');
       collection.findOne({ "login" : cookieLogin }, function(err, result) {
        if (!result) {
          cookie.set(response, 'login', null);
          main.index(request, response);
        }
        else {
          collection.findOne({ "login" : query.login }, function(err, result2) {
           if (result2 === null || query.login === cookieLogin) {
              collection.updateOne({"login" : cookieLogin}, {
                "login" : query.login,
                "password" : query.password,
                "country" : query.country
              });
              console.log("created");
              cookie.set(response, 'login', null);
              main.index(request, response);
           }
           else {
              console.log('login sushestvuet')
             }
           });
          }
        });
      });
     }
     catch(e) {
        main.index(request, response);
     }
  }

  static redirect (response, uri) {
    response.writeHead(302, {'Location': uri});
    return response.end();
  }
}

module.exports = main;
