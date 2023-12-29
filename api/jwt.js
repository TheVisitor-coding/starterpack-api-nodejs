var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// Token JWT

/**
 * Secret conservé côté serveur pour signer les JWT
 */
const SECRET = 'mysecretkey'

/* Fonction middleware de Vérification du token */
const checkTokenMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  // Présence d'un token
  if (!token) {
    return res.status(401).json({ "msg": "Vous n'êtes pas autorisé·e à accéder à cette ressource" });
  }

  const options = {
    clockTolerance: 10 * 60, // tolérance de 10 minutes pour les jetons expirés
  };

  jwt.verify(token, 'mysecretkey', options, (err, decodedToken) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(401).json({ "msg": "Vous n'êtes pas autorisé·e à accéder à cette ressource" });
    } else {
      req.user = decodedToken;
      return next();
    }
  });
};


module.exports = { router, checkTokenMiddleware };