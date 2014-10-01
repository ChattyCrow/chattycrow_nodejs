var ChattyCrow, EventEmitter, fs, request,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

request = require('request');

fs = require('fs');

EventEmitter = require('events').EventEmitter;

ChattyCrow = (function(_super) {
  var channel, host, timeout, token;

  __extends(ChattyCrow, _super);

  function ChattyCrow() {
    return ChattyCrow.__super__.constructor.apply(this, arguments);
  }

  host = 'https://chattycrow.com/api/v1/';

  token = null;

  channel = null;

  timeout = 30 * 1000;

  ChattyCrow.createClient = function(token, channel) {
    var instance;
    instance = new this();
    instance.token = token;
    instance.channel = channel;
    return instance;
  };

  ChattyCrow.prototype.getHost = function() {
    return this.host;
  };

  ChattyCrow.prototype.setHost = function(host) {
    this.host = host;
  };

  ChattyCrow.PACKAGE = function() {
    return JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));
  };

  ChattyCrow.prototype.sendIos = function(payload, callback, contacts, options) {
    if (callback == null) {
      callback = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof payload !== 'object' && typeof payload !== 'string') {
      throw new Error('Invalid iOS payload');
    }
    return this._sendData(payload, callback, contacts, options);
  };

  ChattyCrow.prototype.sendAndroid = function(payload, callback, contacts, options) {
    if (callback == null) {
      callback = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof payload !== 'object' || payload.data === void 0 || typeof payload.data !== 'object' || Object.keys(payload.data).length === 0) {
      throw new Error('Invalid android payload');
    }
    return _sendData(payload, callback, contacts, options);
  };

  ChattyCrow.prototype.sendSkype = function(payload, callback, contacts, options) {
    if (callback == null) {
      callback = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof payload !== 'string') {
      throw new Error('Invalid payload type');
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, callback, contacts, options);
  };

  ChattyCrow.prototype.sendJabber = function(payload, callback, contacts, options) {
    if (callback == null) {
      callback = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof payload !== 'string') {
      throw new Error('Invalid payload type');
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, callback, contacts, options);
  };

  ChattyCrow.prototype.sendSMS = function(payload, callback, contacts, options) {
    if (callback == null) {
      callback = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof payload !== 'string') {
      throw new Error('Invalid payload type');
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, callback, contacts, options);
  };

  ChattyCrow.prototype._callback = function(cb) {
    var that;
    that = this;
    return function(res, body, err) {
      if (err) {
        that.emit('error', err);
      }
      if (cb) {
        return cb.apply(that, arguments);
      }
    };
  };

  ChattyCrow.prototype._sendData = function(payload, cb, contacts, options) {
    var body, callback;
    if (cb == null) {
      cb = null;
    }
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    callback = this._callback(cb);
    body = {
      payload: payload
    };
    if (Object.prototype.toString.call(contacts) === '[object Array]' && contacts.length > 0) {
      body.contacts = contacts;
    }
    options = {
      method: 'POST',
      url: "" + this.host + "notification",
      json: body,
      timeout: this.timeout,
      headers: {
        'Token': options.token || this.token,
        'Channel': options.channel || this.channel,
        'Accept': 'application/json'
      }
    };
    return request(options, function(err, res, body) {
      if (err) {
        return callback(res, body, err);
      }
      if (body === void 0) {
        return callback(res, body, new Error('Invalid body'));
      }
      switch (res.statusCode) {
        case 200:
        case 201:
          body.failed_contacts = body.contacts;
          return callback(res, body);
        case 400:
          return callback(res, body, new Error('Invalid attributes'));
        case 401:
          return callback(res, body, new Error('Unauthorized request'));
        case 404:
          return callback(res, body, new Error('Channel not found'));
        default:
          return callback(res, body, new Error('Unexcepted return'));
      }
    });
  };

  ChattyCrow.prototype.getContacts = function(callback, options) {
    if (callback == null) {
      callback = null;
    }
    if (options == null) {
      options = {};
    }
    return this._sendContactData(null, callback, options, 'GET');
  };

  ChattyCrow.prototype.addContacts = function(contacts, callback, options) {
    if (contacts == null) {
      contacts = [];
    }
    if (callback == null) {
      callback = null;
    }
    if (options == null) {
      options = {};
    }
    if (Object.prototype.toString.call(contacts) !== '[object Array]' && contacts.length === 0) {
      throw new Error('Contacts must be an array and have to contains at least 1 contact');
    }
    return this._sendContactData(contacts, callback, options, 'POST');
  };

  ChattyCrow.prototype.removeContacts = function(contacts, callback, options) {
    if (contacts == null) {
      contacts = [];
    }
    if (callback == null) {
      callback = null;
    }
    if (options == null) {
      options = {};
    }
    if (Object.prototype.toString.call(contacts) !== '[object Array]' && contacts.length === 0) {
      throw new Error('Contacts must be an array and have to contains at least 1 contact');
    }
    return this._sendContactData(contacts, callback, options, 'DELETE');
  };

  ChattyCrow.prototype._sendContactData = function(contacts, cb, options, httpMethod) {
    var body, callback;
    if (cb == null) {
      cb = null;
    }
    if (options == null) {
      options = {};
    }
    if (httpMethod == null) {
      httpMethod = 'GET';
    }
    callback = this._callback(cb);
    body = {
      contacts: contacts
    };
    options = {
      method: httpMethod,
      url: "" + this.host + "contacts",
      json: body,
      timeout: this.timeout,
      headers: {
        'Token': options.token || this.token,
        'Channel': options.channel || this.channel,
        'Accept': 'application/json'
      }
    };
    return request(options, function(err, res, body) {
      if (err) {
        return callback(res, body, err);
      }
      if (body === void 0) {
        return callback(res, body, new Error('Invalid body'));
      }
      switch (res.statusCode) {
        case 200:
        case 201:
          return callback(res, body);
        case 400:
          return callback(res, body, new Error('Invalid attributes'));
        case 401:
          return callback(res, body, new Error('Unauthorized request'));
        case 404:
          return callback(res, body, new Error('Channel not found'));
        default:
          return callback(res, body, new Error('Unexcepted return'));
      }
    });
  };

  return ChattyCrow;

})(EventEmitter);

module.exports = ChattyCrow;
