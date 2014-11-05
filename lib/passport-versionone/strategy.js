/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2 = require('oauth').OAuth2
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError
  , urljoin = require('url-join')
  , _ = require('underscore');


/**
 * `Strategy` constructor.
 *
 * The VersionOne authentication strategy authenticates requests by delegating to
 * VersionOne using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your VersionOne application's client id
 *   - `clientSecret`  your VersionOne application's client secret
 *   - `callbackURL`   URL to which VersionOne will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new VersionOneStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/versionone/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  
  if (!options.instanceURL) { throw new Error('instanceUrl is a required option'); }

  options.authorizationURL = options.authorizationURL || urljoin(options.instanceURL, '/oauth.v1/auth');
  options.tokenURL = options.tokenURL || urljoin(options.instanceURL, '/oauth.v1/token');
  
  options.scope = options.scope || 'query-api-1.0';
  this.options = options;

  OAuth2Strategy.call(this, options, verify);
  this.name = 'versionone';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from VersionOne.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `versionone`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var profileURL = urljoin(this.options.instanceURL, '/query.v1?query=from%3A%20Member%0Aselect%3A%0A%20%20-%20Name%0A%20%20-%20Email%0Awhere%3A%0A%20%20IsSelf%3A%20true');
  var clientID = this.options.clientID;
  
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.get(profileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err, body)); }
    
    try {
      var json = JSON.parse(body);
      if (!Array.isArray(json) || !Array.isArray(json[0])) { return done(new Error('No profile information provided by VersionOne')); } 
      var userJson = json[0][0];

      var profile = { provider: 'versionone' };
      profile.id = userJson._oid;
      profile.displayName = userJson.Name;
      profile.emails = [{ value: userJson.Email }];
      profile.clientID = clientID;

      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

Strategy.prototype.authenticate = function(req, options, verify) {
  if (options) {
    options.authorizationURL = options.authorizationURL || urljoin(options.instanceURL, '/oauth.v1/auth');
    options.tokenURL = options.tokenURL || urljoin(options.instanceURL, '/oauth.v1/token');

    this.options = _.extend(this.options, options);

    this._oauth2 = new OAuth2(this.options.clientID, this.options.clientSecret, '', this.options.authorizationURL, this.options.tokenURL, this.options.customHeaders);
  }
  
  OAuth2Strategy.prototype.authenticate.call(this, req, this.options);
}
/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
