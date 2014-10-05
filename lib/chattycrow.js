
/*
Chatty Crow API call library (2014, MIT)
@author: Strnadj
@webiste: http://chattycrow.com/
 */
var ChattyCrow, EventEmitter, fs, request,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

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

  ChattyCrow.MESSAGES = {
    invalid_payload: 'Invalid payload',
    payload_must_be_object_with_keys: 'Payload require object data with some keys',
    payload_must_be_object_or_string: 'Payload must be object or string',
    contacts_must_be_an_array: 'Contacts must be an array and have to contains at least 1 contact',
    ios: {
      alert: '{ "aps" : { "alert" } } must be object or string',
      badge: '{ "aps" : { "badge" } } must be a number',
      sound: '{ "aps" : { "sound" } } must be a string',
      content_available: '{ "aps" : { "content-available" } } must be a number',
      body: '{ "aps" : { "alert" : { "body" } } } must be a string or object',
      action_loc_key: '{ "aps" : { "alert" : { "action-loc-key" } } } must be a string or null',
      loc_key: '{ "aps" : { "alert" : { "loc-key" } } } must be a string',
      loc_args: '{ "aps" : { "alert" : { "loc-args" } } } must be an array',
      launch_image: '{ "aps" : { "alert" : { "launch-image" } } } must be a string'
    },
    responses: {
      invalid_attributes: 'Invalid attributes',
      unauthorized_request: 'Unauthorized request',
      channel_not_found: 'Channel not found',
      unexcepted_return: 'Unexcepted return',
      invalid_body: 'Invalid body'
    }
  };

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

  ChattyCrow.prototype.sendIos = function() {
    var alert, alert_type, aps, callback, cb, contacts, options, payload, _arg, _i;
    payload = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    contacts = _arg[0], options = _arg[1];
    callback = this._callback(cb);
    if (typeof payload !== 'object' && typeof payload !== 'string') {
      return callback(new Error(ChattyCrow.MESSAGES.payload_must_be_object_or_string));
    }
    if (typeof payload === 'string') {
      payload = {
        aps: {
          alert: payload
        }
      };
    } else if (payload.aps !== void 0) {
      aps = payload.aps;
      if ((alert_type = typeof aps.alert) !== 'undefined') {
        if (alert_type === 'object') {
          alert = aps.alert;
          if (alert.body !== void 0 && typeof alert.body !== 'string') {
            return callback(new Error(this.constructor.MESSAGES.ios.body));
          }
          if (alert.action_loc_key !== void 0) {
            alert['action-loc-key'] = alert.action_loc_key;
            delete alert.action_loc_key;
          }
          if (alert['action-loc-key'] !== void 0 && alert['action-loc-key'] !== null && typeof alert['action-loc-key'] !== 'string') {
            return callback(new Error(this.constructor.MESSAGES.ios.action_loc_key));
          }
          if (alert.loc_key !== void 0) {
            alert['loc-key'] = alert.loc_key;
            delete alert.loc_key;
          }
          if (alert['loc-key'] !== void 0 && typeof alert['loc-key'] !== 'string') {
            return callback(new Error(this.constructor.MESSAGES.ios.loc_key));
          }
          if (alert.loc_args !== void 0) {
            alert['loc-args'] = alert.loc_args;
            delete alert.loc_args;
          }
          if (alert['loc-args'] !== void 0 && Object.prototype.toString.call(alert['loc-args']) !== '[object Array]') {
            return callback(new Error(this.constructor.MESSAGES.ios.loc_args));
          }
          if (alert.launch_image !== void 0) {
            alert['launch-image'] = alert.launch_image;
            delete alert.launch_image;
          }
          if (alert['launch-image'] !== void 0 && typeof alert['launch-image'] !== 'string') {
            return callback(new Error(this.constructor.MESSAGES.ios.launch_image));
          }
        } else if (alert_type !== 'string') {
          return callback(new Error(this.constructor.MESSAGES.ios.alert));
        }
      }
      if (aps.badge !== void 0 && typeof aps.badge !== 'number') {
        return callback(new Error(this.constructor.MESSAGES.ios.badge));
      }
      if (aps.sound !== void 0 && typeof aps.sound !== 'string') {
        return callback(new Error(this.constructor.MESSAGES.ios.sound));
      }
      if (aps.content_available !== void 0) {
        aps['content-available'] = aps.content_available;
        delete aps.content_available;
      }
      if (aps['content-available'] !== void 0 && typeof aps['content-available'] !== 'number') {
        return callback(new Error(this.constructor.MESSAGES.ios.content_available));
      }
    }
    return this._sendData(payload, contacts, options, callback);
  };

  ChattyCrow.prototype.sendAndroid = function() {
    var callback, cb, contacts, options, payload, _arg, _i;
    payload = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    contacts = _arg[0], options = _arg[1];
    callback = this._callback(cb);
    if (typeof payload !== 'object' || payload.data === void 0 || typeof payload.data !== 'object' || Object.keys(payload.data).length === 0) {
      return callback(new Error(this.constructor.MESSAGES.payload_must_be_object_with_keys));
    }
    return this._sendData(payload, contacts, options, callback);
  };

  ChattyCrow.prototype.sendSkype = function() {
    var callback, cb, contacts, options, payload, _arg, _i;
    payload = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    contacts = _arg[0], options = _arg[1];
    callback = this._callback(cb);
    if (typeof payload !== 'string') {
      return callback(new Error(this.constructor.MESSAGES.invalid_payload));
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, contacts, options, callback);
  };

  ChattyCrow.prototype.sendJabber = function() {
    var callback, cb, contacts, options, payload, _arg, _i;
    payload = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    contacts = _arg[0], options = _arg[1];
    callback = this._callback(cb);
    if (typeof payload !== 'string') {
      return callback(new Error(ChattyCrow.MESSAGES.invalid_payload));
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, contacts, options, callback);
  };

  ChattyCrow.prototype.sendSMS = function() {
    var callback, cb, contacts, options, payload, _arg, _i;
    payload = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    contacts = _arg[0], options = _arg[1];
    callback = this._callback(cb);
    if (typeof payload !== 'string') {
      return callback(new Error(ChattyCrow.MESSAGES.invalid_payload));
    }
    payload = {
      body: payload
    };
    return this._sendData(payload, contacts, options, callback);
  };

  ChattyCrow.prototype.addContacts = function() {
    var callback, cb, contacts, options, _arg, _i;
    contacts = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    options = _arg[0];
    callback = this._callback(cb);
    return this._sendData(null, contacts, options, 'POST', 'contacts', callback);
  };

  ChattyCrow.prototype.removeContacts = function() {
    var callback, cb, contacts, options, _arg, _i;
    contacts = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    options = _arg[0];
    callback = this._callback(cb);
    return this._sendContactData(null, contacts, options, 'DELETE', 'contacts', callback);
  };

  ChattyCrow.prototype._callback = function(callback) {
    var that;
    that = this;
    return function(err) {
      if (callback) {
        return callback.apply(that, arguments);
      } else if (err) {
        return that.emit('error', arguments);
      }
    };
  };

  ChattyCrow.prototype._sendData = function() {
    var callback, contacts, httpMethod, httpUrl, options, payload, request_body, _arg, _i;
    payload = arguments[0], contacts = arguments[1], options = arguments[2], _arg = 5 <= arguments.length ? __slice.call(arguments, 3, _i = arguments.length - 1) : (_i = 3, []), callback = arguments[_i++];
    if (contacts == null) {
      contacts = [];
    }
    if (options == null) {
      options = {};
    }
    httpMethod = _arg[0], httpUrl = _arg[1];
    if (!httpMethod) {
      httpMethod = 'POST';
    }
    if (!httpUrl) {
      httpUrl = 'notification';
    }
    if (httpUrl === 'notification') {
      request_body = {
        payload: payload
      };
      if (Object.prototype.toString.call(contacts) === '[object Array]' && contacts.length > 0) {
        request_body.contacts = contacts;
      }
    } else {
      if (Object.prototype.toString.call(contacts) !== '[object Array]' || contacts.length === 0) {
        return callback(new Error(ChattyCrow.MESSAGES.contacts_must_be_an_array));
      }
      request_body = {
        contacts: contacts
      };
    }
    options = {
      method: httpMethod,
      url: "" + this.host + httpUrl,
      json: request_body,
      timeout: this.timeout,
      headers: {
        'Token': options.token || this.token,
        'Channel': options.channel || this.channel,
        'Accept': 'application/json'
      }
    };
    return request(options, function(err, response, body) {
      if (err) {
        return callback(err, body, response, payload);
      }
      if (body === void 0) {
        return callback(new Error(ChattyCrow.MESSAGES.responses.invalid_body), body, response, request_body);
      }
      switch (response.statusCode) {
        case 200:
        case 201:
          if (httpUrl === 'notification') {
            body.failed_contacts = body.contacts;
          }
          return callback(null, body, response, request_body);
        case 400:
          return callback(new Error(ChattyCrow.MESSAGES.responses.invalid_attributes), body, response, request_body);
        case 401:
          return callback(new Error(ChattyCrow.MESSAGES.responses.unauthorized_request), body, response, request_body);
        case 404:
          return callback(new Error(ChattyCrow.MESSAGES.responses.channel_not_found), body, response, request_body);
        default:
          return callback(new Error(ChattyCrow.MESSAGES.responses.unexcepted_return), body, response, request_body);
      }
    });
  };

  return ChattyCrow;

})(EventEmitter);

module.exports = ChattyCrow;
