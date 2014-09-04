var vows = require('vows');
var assert = require('assert');
var util = require('util');
var VersionOneStrategy = require('passport-versionone/strategy');


vows.describe('VersionOneStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new VersionOneStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named versionone': function (strategy) {
      assert.equal(strategy.name, 'versionone');
    },
  },
  
  'strategy when loading user profile from api': {
    topic: function() {
      var strategy = new VersionOneStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // NOTE: This response is received if the user profile is requested from
      //       the following endpoint:
      //         https://<host>/query.v1?query=from%3A%20Member%0Aselect%3A%0A%20%20-%20Name%0A%20%20-%20Email%0Awhere%3A%0A%20%20IsSelf%3A%20true
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '[ [ { "_oid": "Member:42", "Name": "Dan Lash ツ", "Email": "danlash@example.com" } ] ]';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'versionone');
        assert.equal(profile.id, 'Member:42');
        assert.equal(profile.displayName, 'Dan Lash ツ');
        assert.equal(profile.emails[0].value, 'danlash@example.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new VersionOneStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
