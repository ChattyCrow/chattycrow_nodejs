###
Chatty Crow API call library (2014, MIT)
@author: Strnadj
@webiste: http://chattycrow.com/
###

request = require 'request'
fs = require 'fs'
EventEmitter = require('events').EventEmitter

class ChattyCrow extends EventEmitter
  # Default settings
  host    = 'https://chattycrow.com/api/v1/'
  token   = null
  channel = null
  timeout = 30 * 1000

  # Error messages
  @MESSAGES:
    invalid_payload: 'Invalid payload'
    payload_must_be_object_with_keys: 'Payload require object data with some keys'
    payload_must_be_object_or_string: 'Payload must be object or string'
    contacts_must_be_an_array: 'Contacts must be an array and have to contains at least 1 contact'
    ios:
      alert: '{ "aps" : { "alert" } } must be object or string'
      badge: '{ "aps" : { "badge" } } must be a number'
      sound: '{ "aps" : { "sound" } } must be a string'
      content_available: '{ "aps" : { "content-available" } } must be a number'
      body: '{ "aps" : { "alert" : { "body" } } } must be a string or object'
      action_loc_key: '{ "aps" : { "alert" : { "action-loc-key" } } } must be a string or null'
      loc_key: '{ "aps" : { "alert" : { "loc-key" } } } must be a string'
      loc_args: '{ "aps" : { "alert" : { "loc-args" } } } must be an array'
      launch_image: '{ "aps" : { "alert" : { "launch-image" } } } must be a string'
    responses:
      invalid_attributes: 'Invalid attributes'
      unauthorized_request: 'Unauthorized request'
      channel_not_found: 'Channel not found'
      unexcepted_return: 'Unexcepted return'
      invalid_body: 'Invalid body'

  # Empty constructor
  @createClient: (token, channel) ->
    instance = new this()
    instance.token = token
    instance.channel = channel
    return instance

  # Get host
  getHost: () ->
    @host

  # Set host
  setHost: (@host) ->

  # Get package informations
  @PACKAGE: ->
    JSON.parse fs.readFileSync(__dirname + '/../package.json', 'utf8')

  # Send Android message
  sendIos: (payload, [contacts, options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Validate payload
    if typeof(payload) != 'object' && typeof(payload) != 'string'
      return callback new Error ChattyCrow.MESSAGES.payload_must_be_object_or_string

    # When payload is string send as { 'aps' : { 'alert' : string } }
    if typeof(payload) == 'string'
      payload = { aps: { alert: payload } }
    else if payload.aps != undefined
      # If payload contains 'aps' object, its structure is specified on:
      # https://developer.apple.com/library/IOs/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html
      aps = payload.aps
      if (alert_type = typeof(aps.alert)) != 'undefined'
        if alert_type == 'object'
          # Persist alert for validations
          alert = aps.alert

          # Validate body
          if alert.body != undefined && typeof(alert.body) != 'string'
            return callback new Error @constructor.MESSAGES.ios.body

          # Validate & copy action-loc-key
          if alert.action_loc_key != undefined
            alert['action-loc-key'] = alert.action_loc_key
            delete(alert.action_loc_key)

          if alert['action-loc-key'] != undefined && alert['action-loc-key'] != null && typeof(alert['action-loc-key']) != 'string'
            return callback new Error @constructor.MESSAGES.ios.action_loc_key

          # Loc-key must be string
          if alert.loc_key != undefined
            alert['loc-key'] = alert.loc_key
            delete(alert.loc_key)

          if alert['loc-key'] != undefined && typeof(alert['loc-key']) != 'string'
            return callback new Error @constructor.MESSAGES.ios.loc_key

          # Loc-args must be an array of string
          if alert.loc_args != undefined
            alert['loc-args'] = alert.loc_args
            delete(alert.loc_args)

          if alert['loc-args'] != undefined && Object.prototype.toString.call(alert['loc-args']) != '[object Array]'
            return callback new Error @constructor.MESSAGES.ios.loc_args

          # launch-image must be string
          if alert.launch_image != undefined
            alert['launch-image'] = alert.launch_image
            delete(alert.launch_image)

          if alert['launch-image'] != undefined && typeof(alert['launch-image']) != 'string'
            return callback new Error @constructor.MESSAGES.ios.launch_image

        else if alert_type != 'string'
          # String is allowed!
          return callback new Error @constructor.MESSAGES.ios.alert

      # Badge must be NUMBER
      if aps.badge != undefined && typeof(aps.badge) != 'number'
        return callback new Error @constructor.MESSAGES.ios.badge

      # Sound must be STRING
      if aps.sound != undefined && typeof(aps.sound) != 'string'
        return callback new Error @constructor.MESSAGES.ios.sound

      # Move content-available
      if aps.content_available != undefined
        aps['content-available'] = aps.content_available
        delete(aps.content_available)

      # Content-available must be a number!
      if aps['content-available'] != undefined && typeof(aps['content-available']) != 'number'
        return callback new Error @constructor.MESSAGES.ios.content_available

    # Send request!
    @_sendData(payload, contacts, options, callback)


  # Send Android message
  sendAndroid: (payload, [contacts, options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Validate payload
    if typeof(payload) != 'object' || payload.data == undefined || typeof(payload.data) != 'object' || Object.keys(payload.data).length == 0
      return callback new Error @constructor.MESSAGES.payload_must_be_object_with_keys

    # Send request!
    @_sendData(payload, contacts, options, callback)

  # Send skype
  sendSkype: (payload, [contacts, options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Validate payload!
    if typeof(payload) != 'string'
      return callback new Error @constructor.MESSAGES.invalid_payload

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, contacts, options, callback)

  # Send jabber
  sendJabber: (payload, [contacts, options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Validate payload!
    if typeof(payload) != 'string'
      return callback new Error ChattyCrow.MESSAGES.invalid_payload

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, contacts, options, callback)

  # Send SMS
  sendSMS: (payload, [contacts, options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Validate payload!
    if typeof(payload) != 'string'
      return callback new Error  ChattyCrow.MESSAGES.invalid_payload

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, contacts, options, callback)

  # Add contacts
  addContacts: (contacts, [options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Send
    @_sendData(null, contacts, options, 'POST', 'contacts', callback)

  # Remove contacts
  removeContacts: (contacts, [options]..., cb) ->
    # Prepare callback
    callback = @_callback(cb)

    # Send
    @_sendContactData(null, contacts, options, 'DELETE', 'contacts', callback)

  # Callback with event emitor
  _callback: (callback) ->
    that = this
    (err) ->
      if callback
        callback.apply that, arguments
      else if err
        that.emit('error', arguments)

  # Method sends data
  # Method returns payload for TESTs
  _sendData: (payload, contacts = [], options = {}, [httpMethod, httpUrl]..., callback) ->
    # Set default httpMethod and httpUrl
    httpMethod = 'POST'         unless httpMethod
    httpUrl    = 'notification' unless httpUrl

    # Prepare body
    if httpUrl == 'notification'
      request_body =
        payload: payload

      # Add Contacts
      if Object.prototype.toString.call(contacts) == '[object Array]' && contacts.length > 0
        request_body.contacts = contacts
    else
      # Validate contacts array to not be empty!
      if Object.prototype.toString.call(contacts) != '[object Array]' || contacts.length == 0
        return callback new Error ChattyCrow.MESSAGES.contacts_must_be_an_array

      # Create body
      request_body =
        contacts: contacts

    # Prepare request headers
    options =
      method: httpMethod
      url: "#{@host}#{httpUrl}"
      json: request_body
      timeout: @timeout
      headers:
        'Token' : options.token || @token
        'Channel' : options.channel || @channel
        'Accept' : 'application/json'

    # Async send
    request options, (err, response, body) ->
      # Error raised by Request
      if err
        return callback err, body, response, payload

      # Invalid body
      if body == undefined
        return callback new Error(ChattyCrow.MESSAGES.responses.invalid_body), body, response, request_body

      # Get return codes
      switch response.statusCode
        when 200, 201
          # Modify callback
          body.failed_contacts = body.contacts if httpUrl == 'notification'

          # Call callback
          callback null, body, response, request_body
        when 400
          callback new Error(ChattyCrow.MESSAGES.responses.invalid_attributes), body, response, request_body
        when 401
          callback new Error(ChattyCrow.MESSAGES.responses.unauthorized_request), body, response, request_body
        when 404
          callback new Error(ChattyCrow.MESSAGES.responses.channel_not_found), body, response, request_body
        else
          callback new Error(ChattyCrow.MESSAGES.responses.unexcepted_return), body, response, request_body

module.exports = ChattyCrow
