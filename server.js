'use strict';
const
  http    = require('http'),
  url     = require('url'),
  fs      = require('fs'),
  router  = require('./app/routes/router'),
  main    = require('./app/handlers/main'),
  myIp    = '192.168.1.195';

class Server {

  static start(port) {
    this.getRoutes(port).then(this.createServer);
  }

  static getRoutes(port) {
    return new Promise(function(resolve) {
      fs.readFile('./app/routes/routes.json', { encoding: 'utf8' }, function(error, routes) {
        if (!error) {
          resolve({
            port: port,
            routes: JSON.parse(routes)
          });
        }
      });
    });
  }

  static createServer(settings) {
    http.createServer(function(request, response) {
      const path = url.parse(request.url).pathname;
      const route = router.find(path, settings.routes)
      try {
        const handler = require('./app/handlers/' + route.handler);
        handler[route.action](request, response);
      }
      catch(e) {
        response.writeHead(500);
        response.end()
      }
    }).listen(settings.port, myIp);
  }
}

Server.start(80);
console.log("Listen " + myIp);
