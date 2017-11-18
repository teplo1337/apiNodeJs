'use strict';

class router {
  static find(path, routes) {
        for (let route in routes) {
            if (path === route) return routes[route];
        }
        return false;
  }
}
module.exports = router;
