should = require('chai').should()
chattycrow = require('../index')
nock = require('nock')

# Http settings
default_url = 'http://chattycrow.com'
default_api = '/api/v1/'

# Mock notification helper
mockNotitifcation = (code, content = {}) ->
  nock("#{default_url}").post("#{default_api}notification").reply(code, content)


describe 'Chatty Crow', ->
  cc_instance = null

  beforeEach (done) ->
    cc_instance = chattycrow.createClient('test_token', 'default_channel')
    cc_instance.setHost("#{default_url}#{default_api}")
    done()


  describe '#host', ->
    it 'change host', ->
      test_host = 'test_host12'
      cc_instance.setHost(test_host)
      cc_instance.getHost().should.equal(test_host)
      cc_instance.setHost(default_url)

  describe '#sendIos', ->
    it 'payload is a number', (done) ->
      cc_instance.sendIos 5, (err) ->
        err.message.should.equal chattycrow.MESSAGES.payload_must_be_object_or_string
        done()

    it 'create aps alert object when string is as payload', (done) ->
      mockNotitifcation 400
      test_alert = 'test_alert'
      cc_instance.sendIos test_alert, (err, res, body, req_body) ->
        req_body.payload.aps.alert.should.equals test_alert
        done()

  describe '#senderNotifications', ->
    it 'Add contacts to payload if present', (done) ->
      mockNotitifcation 400
      contacts = [ 'test1', 'test2' ]
      cc_instance.sendSkype 'skype', contacts, (err, body, response, req_body) ->
        req_body.contacts.should.eql contacts
        done()

    it 'Dont add contacts if they are empty', (done) ->
      mockNotitifcation 400
      contacts = []
      cc_instance.sendSkype 'skype', contacts, (err, body, response, req_body) ->
        (req_body.contacts == undefined).should.be.true
        done()

    it 'Return invalid attributes when server responds 400', (done) ->
      mockNotitifcation 400
      cc_instance.sendSkype 'skype', (err) ->
        err.message.should.equal chattycrow.MESSAGES.responses.invalid_attributes
        done()

    it 'Return unauthorized request when server responds 401', (done) ->
      mockNotitifcation 401
      cc_instance.sendSkype 'skype', (err) ->
        err.message.should.equal chattycrow.MESSAGES.responses.unauthorized_request
        done()

    it 'Return channel not found when server responds 404', (done) ->
      mockNotitifcation 404
      cc_instance.sendSkype 'skype', (err) ->
        err.message.should.equal chattycrow.MESSAGES.responses.channel_not_found
        done()

