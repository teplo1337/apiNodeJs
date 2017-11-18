'use strict';

module.exports.get = function(req, name) {
    var header = req.headers.cookie,
        cookie = header && header.match(new RegExp('(?:^|;\\s)' + encodeURIComponent(name) + '=([^;]*)'));

    return cookie && decodeURIComponent(cookie[1]);
}

module.exports.set = function(res, name, value, options) {
    var header = res.getHeader('Set-Cookie') || [],
        cookie = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];

    if (value === null || value === undefined) {
        options = options || {};
        options.expires = new Date(0);
    }

    if (options) {
        if (options.path) cookie.push('path=' + options.path);
        if (options.expires) cookie.push('expires=' + options.expires.toUTCString());
        if (options.maxAge) cookie.push('max-age=' + options.maxAge);
        if (options.domain) cookie.push('domain=' + options.domain);
        if (options.secure) cookie.push('secure');
        if (options.httpOnly) cookie.push('httponly');
    }

    res.setHeader('Set-Cookie', [].concat(header, cookie.join('; ')));
};
