import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as oauth2 from 'passport-oauth2';

export default function authentication(config) {
  const app = express();

  passport.use(new oauth2.Strategy({
    authorizationURL: config.oauthAuthorizationURL,
    tokenURL: config.oauthTokenURL,
    clientID: config.oauthClientID,
    clientSecret: config.oauthClientSecret
  },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, {accessToken, refreshToken, profile});
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, cb) => {
    cb(null, user.accessToken);
  });

  passport.deserializeUser((accessToken, cb) => {
    cb(null, {accessToken});
  });

  app.get('/auth/login', passport.authenticate('oauth2'));

  app.get('/auth/login/callback', passport.authenticate('oauth2'), (req, res) => {
    res.redirect('/');
  });

  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use((req, _res, next) => {
    if (req.isAuthenticated()) {
      req.rawToken = jwt.decode(req.session.passport.user);
    }

    next();
  });

  app.use((req, res, next) => {
    if (req.isAuthenticated() && req.rawToken) {
      req.sessionOptions.expires = req.rawToken.exp;
    }

    next();
  });

  app.use((req, res, next) => {
    if (req.isAuthenticated() && !isExpired(req)) {
      req.accessToken = req.session.passport.user;
      next();
    } else {
      req.session = null;
      res.redirect('/auth/login');
    }
  });

  return app;
}

function isExpired(req) {
  if (!req.rawToken || !req.rawToken.exp) {
    return true;
  }

  return Math.floor(Date.now() / 1000) > req.rawToken.exp;
}
