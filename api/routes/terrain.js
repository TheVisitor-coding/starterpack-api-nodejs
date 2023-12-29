var express = require('express');
var router = express.Router();
var db = require('../db');
const hal = require('../hal');

router.get('/terrains', async (req, res, next) => {
  const conn = await db.mysql.createConnection(db.dsn);

  // Construire la requête SQL pour récupérer les terrains
  let query = 'SELECT field_name, id_field, is_flooded FROM field';
  const queryParams = [];

  // Ajouter le filtre pour les terrains non inondés si la query ?isFlooded=0 est présente
  if (req.query.isFlooded === '0') {
    query += ' WHERE is_flooded = 0';
  }

  // Exécuter la requête SQL
  const [rows] = await conn.execute(query, queryParams);
  try {
    const terrainLinks = rows.map(terrain => {
      return {
        nom_terrain: terrain.field_name,
        reservations: hal.halLinkObject('/terrains/' + terrain.id_field + '/reservations'),
        flooded: hal.halLinkObject('/terrains/' + terrain.id_field + '/flooded'),
      };
    });
    res.status(200).set('Content-Type', 'application/json')
      .send({
        _links: {
          self: hal.halLinkObject('/terrains'),
          home: hal.halLinkObject('/'),
          login: hal.halLinkObject('/login'),
          reservations: hal.halLinkObject('/terrains/{id}/reservations', 'string', "Réservation du terrain à une horaire choisie", true),
          flooded: hal.halLinkObject('/terrains/{id}/flooded', 'string', "Vérification de l'état du terrain", true),

        },
        _embedded: {
          terrains: terrainLinks,
        }
      }
      );
  }
  catch (error) {
    console.error('Error during login: ' + error.stack);
    res.status(500).render('login', { error: "Erreur lors de l'authentification." });
  } finally {
    // Ferme la connexion après utilisation
    if (conn) {
      await conn.end();
    }
  }
})

module.exports = router;