var express = require('express');
var router = express.Router();
var db = require('../db');
const hal = require('../hal');
const { checkTokenMiddleware } = require('../jwt');
const jwt = require('jsonwebtoken');

router.get('/terrains/:id/flooded', async (req, res, next) => {
  const conn = await db.mysql.createConnection(db.dsn);
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, 'mysecretkey');
  const id_user = decodedToken.userId;
  const is_admin = await conn.execute('SELECT isAdmin FROM adherent WHERE id_adherent = ?', [id_user]);

  const { id } = req.params;

  if (is_admin[0][0].isAdmin[0] === 0) {
    res.status(400).json({
      _message: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
      _links: {
        self: hal.halLinkObject('/terrains/' + id + '/flooded'),
        home: hal.halLinkObject('/'),
        login: hal.halLinkObject('/login'),
        terrains: hal.halLinkObject('/terrains', 'string', "Liste des Terrains, ?isFlooded=0 permet de n'afficher que les terrains non innondés", true),
        reservations: hal.halLinkObject('/terrains/{id}/reservations', 'string', "Réservation du terrain à une horaire choisie", true),

      },
    })
    return;
  } else {
    res.render('flooded', { id });
  }
})

router.post('/terrains/:id/flooded', checkTokenMiddleware, async (req, res, next) => {
  const conn = await db.mysql.createConnection(db.dsn);
  const { id } = req.params;

  try {
    // Vérifier si le terrain est déjà inondé
    const terrain_isFlooded = await conn.execute('SELECT is_flooded FROM field WHERE id_field = ?', [id]);
    console.log(terrain_isFlooded)
    if (terrain_isFlooded[0][0].is_flooded[0] === 1) {
      res.status(400).json({
        _message: "Ce terrain est déjà inondé",
        _links: {
          self: hal.halLinkObject('/terrains/' + id + '/flooded'),
          home: hal.halLinkObject('/'),
          login: hal.halLinkObject('/login'),
          terrains: hal.halLinkObject('/terrains'),
        },
      });
    }

    // Mettre à jour l'état isFlooded du terrain
    await conn.execute('UPDATE field SET is_flooded = 1 WHERE id_field = ?', [id]);

    res.status(200).json({
      _message: 'Ce terrain est désormais inondé',
      _links: {
        self: hal.halLinkObject('/terrains/' + id + '/flooded'),
        home: hal.halLinkObject('/'),
        login: hal.halLinkObject('/login'),
        terrains: hal.halLinkObject('/terrains'),
      },
    });
  } catch (error) {
    console.error('Error during request: ' + error.stack);
    res.status(500).json({
      _message: 'Erreur serveur',
    });
  } finally {
    // Fermer la connexion après utilisation
    if (conn) {
      await conn.end();
    }
  }
});

module.exports = router;