# Passport-VersionOne

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [VersionOne](http://www.versionone.com/) using the OAuth 2.0 API.

This module lets you authenticate using VersionOne in your Node.js applications.  By
plugging into Passport, VersionOne authentication can be easily and unobtrusively
integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-versionone

## Usage

#### Configure Strategy

The VersionOne authentication strategy authenticates users using an VersionOne
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

The client ID and secret are obtained by registering an application at your
Member Detail Page (profile) on the Permitted Apps tab. The instance url is
required and can be obtained in the address bar of your browser when using
the application.

    passport.use(new VersionOneStrategy({
        clientID: VERSIONONE_CLIENT_ID,
        clientSecret: VERSIONONE_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/versionone/callback",
        instanceURL: 'http://v1host.com/versionone/' //example, replace with your instance URL
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ versiononeId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'versionone'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/versionone',
      passport.authenticate('versionone'));

    app.get('/auth/versionone/callback', 
      passport.authenticate('versionone', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/versionone/passport-versionone/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

## Credits

  - [Dan Lash](http://github.com/danlash)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Code based on [passport-amazon](http://github.com/jaredhanson/passport-amazon), Copyright (c) 2013 Jared Hanson [http://jaredhanson.net/](http://jaredhanson.net/)
