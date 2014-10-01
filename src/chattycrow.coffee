request = require 'request'
fs = require 'fs'

class ChattyCrow
  host    = 'https://chattycrow.com/api/v1/'
  token   = null
  channel = null
  timeout = 30 * 1000

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
  sendIos: (payload, callback = null, contacts = [], options = {}) ->
    # Validate payload
    if typeof(payload) != 'object' && typeof(payload) != 'string'
      throw new Error 'Invalid iOS payload'

    # Send request!
    @_sendData(payload, callback, contacts, options)


  # Send Android message
  sendAndroid: (payload, callback = null, contacts = [], options = {}) ->
    # Validate payload
    if typeof(payload) != 'object' || payload.data == undefined || typeof(payload.data) != 'object' || Object.keys(payload.data).length == 0
      throw new Error 'Invalid android payload'

    # Send request!
    _sendData(payload, callback, contacts, options)

  # Send skype
  sendSkype: (payload, callback = null, contacts = [], options = {}) ->
    # Validate payload!
    if typeof(payload) != 'string'
      throw new Error 'Invalid payload type'

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, callback, contacts, options)

  # Send jabber
  sendJabber: (payload, callback = null, contacts = [], options = {}) ->
    # Validate payload!
    if typeof(payload) != 'string'
      throw new Error 'Invalid payload type'

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, callback, contacts, options)

  # Send SMS
  sendSMS: (payload, callback = null, contacts = [], options = {}) ->
    # Validate payload!
    if typeof(payload) != 'string'
      throw new Error 'Invalid payload type'

    # If string cover if it is not object
    payload =
      body: payload

    # Send request!
    @_sendData(payload, callback, contacts, options)


  # Callback
  _callback: (cb) ->
    that = this

    (res, body, err) ->
      if err
        that.emit('error', err)

      if cb
        cb.apply that, arguments

  # Method sends data
  _sendData: (payload, cb = null, contacts = [], options = {}) ->
    # Prepare callback
    callback = @_callback(cb)

    # Prepare body
    body =
      payload: payload

    # Contacts?
    if Object.prototype.toString.call(contacts) == '[object Array]' && contacts.length > 0
      body.contacts = contacts

    # Prepare request headers
    options =
      method: 'POST'
      url: "#{@host}notification"
      json: body
      timeout: @timeout
      headers:
        'Token' : options.token || @token
        'Channel' : options.channel || @channel
        'Accept' : 'application/json'

    # Async send
    request options, (err, res, body) ->
      # Error raised by Request
      if err
        return callback res, body, err

      # Invalid body
      if body == undefined
        return callback res, body, new Error 'Invalid body'

      # Get return codes
      switch res.statusCode
        when 200, 201
          # Modify callback
          body.failed_contacts = body.contacts

          # Call callback
          callback res, body
        when 400
          callback res, body, new Error 'Invalid attributes'
        when 401
          callback res, body, new Error 'Unauthorized request'
        when 404
          callback res, body, new Error 'Channel not found'
        else
          callback res, body, new Error 'Unexcepted return'


  #############################################
  #               CONTACTS                    #
  #############################################

  # Get contacts
  getContacts: (callback = null, options = {}) ->
    # Send get contacts request!
    @_sendContactData(null, callback, options, 'GET')

  # Add contacts
  addContacts: (contacts = [], callback = null, options = {}) ->
    # Validate contacts array to not be empty!
    if Object.prototype.toString.call(contacts) != '[object Array]' && contacts.length == 0
      throw new Error 'Contacts must be an array and have to contains at least 1 contact'

    # Send
    @_sendContactData(contacts, callback, options, 'POST')

  # Remove contacts
  removeContacts: (contacts = [], callback = null, options = {}) ->
    # Validate contacts array to not be empty!
    if Object.prototype.toString.call(contacts) != '[object Array]' && contacts.length == 0
      throw new Error 'Contacts must be an array and have to contains at least 1 contact'

    # Send
    @_sendContactData(contacts, callback, options, 'DELETE')

  # Method sends data
  _sendContactData: (contacts, cb = null, options = {}, httpMethod = 'GET') ->
    # Prepare callback
    callback = @_callback(cb)

    # Prepare body
    body =
      contacts: contacts

    # Prepare request headers
    options =
      method: httpMethod
      url: "#{@host}contacts"
      json: body
      timeout: @timeout
      headers:
        'Token' : options.token || @token
        'Channel' : options.channel || @channel
        'Accept' : 'application/json'

    # Async send
    request options, (err, res, body) ->
      # Error raised by Request
      if err
        return callback res, body, err

      # Invalid body
      if body == undefined
        return callback res, body, new Error 'Invalid body'

      # Get return codes
      switch res.statusCode
        when 200, 201
          # Call callback
          callback res, body
        when 400
          callback res, body, new Error 'Invalid attributes'
        when 401
          callback res, body, new Error 'Unauthorized request'
        when 404
          callback res, body, new Error 'Channel not found'
        else
          callback res, body, new Error 'Unexcepted return'

module.exports = ChattyCrow
