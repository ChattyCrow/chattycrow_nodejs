var chattycrow, default_api, default_url, mockNotitifcation, nock, should;

should = require('chai').should();

chattycrow = require('../index');

nock = require('nock');

default_url = 'http://chattycrow.com';

default_api = '/api/v1/';

mockNotitifcation = function(code, content) {
  if (content == null) {
    content = {};
  }
  return nock("" + default_url).post("" + default_api + "notification").reply(code, content);
};

describe('Chatty Crow', function() {
  var cc_instance;
  cc_instance = null;
  beforeEach(function(done) {
    cc_instance = chattycrow.createClient('test_token', 'default_channel');
    cc_instance.setHost("" + default_url + default_api);
    return done();
  });
  describe('#host', function() {
    return it('change host', function() {
      var test_host;
      test_host = 'test_host12';
      cc_instance.setHost(test_host);
      cc_instance.getHost().should.equal(test_host);
      return cc_instance.setHost(default_url);
    });
  });
  describe('#sendIos', function() {
    it('payload is a number', function(done) {
      return cc_instance.sendIos(5, function(err) {
        err.message.should.equal(chattycrow.MESSAGES.payload_must_be_object_or_string);
        return done();
      });
    });
    return it('create aps alert object when string is as payload', function(done) {
      var test_alert;
      mockNotitifcation(400);
      test_alert = 'test_alert';
      return cc_instance.sendIos(test_alert, function(err, res, body, req_body) {
        req_body.payload.aps.alert.should.equals(test_alert);
        return done();
      });
    });
  });
  return describe('#senderNotifications', function() {
    it('Add contacts to payload if present', function(done) {
      var contacts;
      mockNotitifcation(400);
      contacts = ['test1', 'test2'];
      return cc_instance.sendSkype('skype', contacts, function(err, body, response, req_body) {
        req_body.contacts.should.eql(contacts);
        return done();
      });
    });
    it('Dont add contacts if they are empty', function(done) {
      var contacts;
      mockNotitifcation(400);
      contacts = [];
      return cc_instance.sendSkype('skype', contacts, function(err, body, response, req_body) {
        (req_body.contacts === void 0).should.be["true"];
        return done();
      });
    });
    it('Return invalid attributes when server responds 400', function(done) {
      mockNotitifcation(400);
      return cc_instance.sendSkype('skype', function(err) {
        err.message.should.equal(chattycrow.MESSAGES.responses.invalid_attributes);
        return done();
      });
    });
    it('Return unauthorized request when server responds 401', function(done) {
      mockNotitifcation(401);
      return cc_instance.sendSkype('skype', function(err) {
        err.message.should.equal(chattycrow.MESSAGES.responses.unauthorized_request);
        return done();
      });
    });
    return it('Return channel not found when server responds 404', function(done) {
      mockNotitifcation(404);
      return cc_instance.sendSkype('skype', function(err) {
        err.message.should.equal(chattycrow.MESSAGES.responses.channel_not_found);
        return done();
      });
    });
  });
});
