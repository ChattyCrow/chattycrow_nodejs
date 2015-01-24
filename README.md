[![Chatty
Crow](https://avatars1.githubusercontent.com/u/9012750?v=3&s=200)](http://chattycrow.com)

# ChattyCrow - Node JS library

[![Build Status](https://travis-ci.org/ChattyCrow/chattycrow_nodejs.svg?branch=master)](https://travis-ci.org/ChattyCrow/chattycrow_nodejs)

This library makes easier to call ChattyCrow API (http://chattycrow.com/).

## Installation

```sh
npm install chattycrow
```

## Usage

```js
var chattycrow = require('chattycrow').createClient('token', 'default_channel');
```

### Optional parameters

Every sender and contacts methods header:

```js
send<Service>(payload, [contacts, options], callback);
```

**INFO:** *payload* and *calback* is required, but callback can be **null**.

### Example callback

```js
function chattyCrowResponse(err, body, res) {
  if (err) {
    console.log(err.message);
  } else {
    // It depends on request
  }
}
```

#### Notification response

ChattyCrow always try to send message to all contacts from contact list
or contacts specified in request.

```json
{
  "status": "OK",
  "msg": "15 of 15 notifications created.",
  "success" : 15,
  "total" : 15,
  "contacts" : []
}
```

```json
{
  "status": "PERROR",
  "msg": "12 of 15 notifications created.",
  "success" : 12,
  "total" : 15,
  "contacts" : [
      "test1", "test2", "test3"
  ]
}
```

#### Contact response

```json
{
  "status": "OK|ERROR|PERROR",
  "msg": "Status message",
  "stats" : {
      "success" : 15,
      "exists" : 28,
      "failed" : 12
  },
  "contacts" : {
      "exists" : [ "franta5", "franta6" ],
      "failed" : [ "franta1", "franta4" ]
  }
}
```

### Email notification - TODO

Not yet implemented!

### IOS Push notification

```js
chattycrow.sendIos({ payload: { 'hello' }}, [ 'contacts', 'contact2' ], {channel: 'other', token: 'not_default'}, chattyCrowResponse);
```

### Android Push notification

```js
chattycrow.sendAndroid({ payload: { data : { key1 : 'hello' }}, chattyCrowResponse);
```

### Skype notification

```js
chattycrow.sendSkype('Skype message', null);
```

### Jabber notification

```js
chattycrow.sendJabber('Jabber message', null);
```


### SMS notification (only Czech Republic yet)

```js
chattycrow.sendJabber('SMS message', chattyCrowResponse);
```

## Working with contacts via API

It's actually very usable, you can automatically add or remove contacts in your application after user was registered, it's great for example email notification subscription.


### Add contact

```js
function contactAddResult(err, body, response) {
  if (err) {
    console.log(err.message);
  } elsif (body) {
    console.log('Status: ' + body.status);
    console.log('Message: ' + body.msg);
    console.log('Stats: ' + body.stats.success + '/' + body.stats.exists + '/' + body.stats.failed);
  }
}

chattycrow.addContacts(['test1', 'test2'], contactAddResult);
```

### Remove contact

```js
function contactRemoveResult(err, body, response) {
  if (err) {
    console.log(err.message);
  } else if (body) {
    console.log('Status: ' + body.status);
    console.log('Message: ' + body.msg);
    console.log('Stats: ' + body.stats.success + '/' + body.stats.failed);
  }
}

// Add contacts
chattycrow.removeContacts(['test1', 'test2'], { channel: 'other than default' }, contactRemoveResult);
```
