var express = require('express');
var router = express.Router();
var db = require('../db');
const hal = require('../hal');
const jwt = require('jsonwebtoken');

const SECRET = 'mysecretkey'

router.get('/login', async (req, res, next) => {
  // Middleware pour vérifier que l'utilisateur n'est pas déjà authentifié
  res.render('login');
});

router.post('/login', async (req, res, next) => {
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    const { pseudo } = req.body;
    // Gestion Adhérent
    if (!pseudo) {
      res.status(400).render('login', { error2: "Le pseudo est obligatoire." });
      return;
    } else {
      const user = await conn.execute('SELECT id_adherent FROM adherent WHERE pseudo = ?', [pseudo]);
      if (user[0].length == 0) {
        res.status(400).render('login', { error2: "Le pseudo n'existe pas." });
        return;
      } else {
        const token = jwt.sign({
          userId: user[0][0].id_adherent,
          username: user.pseudo,
          is_admin: user.is_admin,
        }, SECRET, { expiresIn: 120000 })
        res.cookie('token', token, { maxAge: 120000, httpOnly: true });
        return res.status(201).json({
          "_links": {
            "self": hal.halLinkObject('/login'),
            "home": hal.halLinkObject('/'),
            "terrains": hal.halLinkObject('/terrains', 'string', "Liste des Terrains, ?isFlooded=0 permet de n'afficher que les terrains non innondés", true),
            "reservations": hal.halLinkObject('/terrains/{id}/reservations', 'string', "Réservation du terrain à une horaire choisie", true),
            "flooded": hal.halLinkObject('/terrains/{id}/flooded', 'string', "Vérification de l'état du terrain", true),
          }
        })
      }
    }

  }
  catch (error) {
    console.error('Error during login: ' + error.stack);
    res.status(500).render('login', { error2: "Erreur lors de l'authentification." });
  } finally {
    // Ferme la connexion après utilisation
    if (conn) {
      await conn.end();
    }
  }
});

module.exports = router;
