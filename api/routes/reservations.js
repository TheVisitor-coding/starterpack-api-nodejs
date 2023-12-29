var express = require('express');
var router = express.Router();
var db = require('../db');
const hal = require('../hal');
const { checkTokenMiddleware } = require('../jwt');
const jwt = require('jsonwebtoken');

// Affichage Formulaire de réservation
router.get('/terrains/:id/reservations', checkTokenMiddleware, async (req, res, next) => {
  conn = await db.mysql.createConnection(db.dsn);

  try {

    const { id } = req.params;
    const terrain = await conn.execute('SELECT * FROM field WHERE id_field = ?', [id]);
    if (terrain[0][0].is_flooded[0] === 1) {
      res.status(400).json({
        _message: 'Ce terrain est indisponible pour cause d\'innondation',
        _links: {
          self: hal.halLinkObject('/terrains/' + id + '/reservations'),
          home: hal.halLinkObject('/'),
          login: hal.halLinkObject('/login'),
          terrains: hal.halLinkObject('/terrains'),
        },

      })
    }
    const horaires = [
      { dateName: '2023-12-30 10h-10h45', date: '2023-12-30T10:00:00' },
      { dateName: '2023-12-30 10h45-11h30', date: '2023-12-30T10:45:00' },
      { dateName: '2023-12-30 11h30-12h15', date: '2023-12-30T11:30:00' },
      { dateName: '2023-12-30 12h15-13h00', date: '2023-12-30T12:15:00' },
      { dateName: '2023-12-30 13h-13h45', date: '2023-12-30T13:00:00' },
      { dateName: '2023-12-30 13h45-14h30', date: '2023-12-30T13:45:00' },
      { dateName: '2023-12-30 14h30-15h15', date: '2023-12-30T14:30:00' },
      { dateName: '2023-12-30 15h15-16h00', date: '2023-12-30T15:15:00' },
      { dateName: '2023-12-30 16h-16h45', date: '2023-12-30T16:00:00' },
      { dateName: '2023-12-30 16h45-17h30', date: '2023-12-30T16:45:00' },
      { dateName: '2023-12-30 17h30-18h15', date: '2023-12-30T17:30:00' },
      { dateName: '2023-12-30 18h15-19h00', date: '2023-12-30T18:15:00' },
      { dateName: '2023-12-30 19h-19h45', date: '2023-12-30T19:00:00' },
      { dateName: '2023-12-30 19h45-20h30', date: '2023-12-30T19:45:00' },
      { dateName: '2023-12-30 20h30-21h15', date: '2023-12-30T20:30:00' },
      { dateName: '2023-12-30 21h15-22h00', date: '2023-12-30T21:15:00' }
    ];
    res.render('reservation', { id, horaires });
  } catch (error) {
    console.error('Error during login: ' + error.stack);
    res.status(500).render('error', { error: "Erreur " });
  }
});

// Création d'une réservation pour un terrain
router.post('/terrains/:id/reservations', async (req, res, next) => {
  const horaire = req.body.horaire;
  const horaire_begin = horaire.toString().slice(0, 19).replace("T", " ");
  const horaireBeginDate = new Date(horaire);
  const horaireEndDate = new Date(horaireBeginDate.getTime() + 45 * 60000);
  const horaire_end = horaireEndDate.toISOString().slice(0, 19).replace("T", " ");

  const terrain = req.params.id;
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Récupération de l'id de l'adhérent
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, 'mysecretkey');
    const id_adherent = decodedToken.userId;

    isBooked = await conn.execute('SELECT * FROM reservation WHERE id_field = ? AND begin_date = ?', [terrain, horaire_begin]);
    if (isBooked[0].length !== 0) {
      res.status(400).json({
        _message: 'Ce créneau est déjà réservé',
        _links: {
          self: hal.halLinkObject('/terrains'),
          home: hal.halLinkObject('/'),
          login: hal.halLinkObject('/login'),
          reservations: hal.halLinkObject('/terrains/' + terrain + '/reservations', 'string', "Réservation du terrain à une horaire choisie", true),
          flooded: hal.halLinkObject('/terrains/{id}/flooded', 'string', "Vérification de l'état du terrain", true),
        },
      });
    }

    conn.execute('INSERT INTO reservation (id_field, id_adherent, begin_date, end_date) VALUES (?, ?, ?, ?)', [terrain, id_adherent, horaire_begin, horaire_end]);
    res.status(201).json({
      message: 'Réservation créée avec succès',
      _links: {
        self: hal.halLinkObject('/terrains/' + terrain + '/reservations'),
        home: hal.halLinkObject('/'),
        login: hal.halLinkObject('/login'),
        terrains: hal.halLinkObject('/terrains', 'string', "Liste des Terrains, ?isFlooded=0 permet de n'afficher que les terrains non innondés", true),
        flooded: hal.halLinkObject('/terrains/{id}/flooded', 'string', "Vérification de l'état du terrain", true),
      }
    });
  } catch (error) {
    console.error('Error during login: ' + error.stack);
    res.status(500).render('error', { error: "Erreur " });
  }
});


module.exports = router;