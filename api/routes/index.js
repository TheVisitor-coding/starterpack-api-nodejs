var express = require("express");
var router = express.Router();
var db = require("../db");
const hal = require("../hal");

/* GET home page. */
router.get("/", async function (req, res) {
  res
    .status(200)
    .set("Content-Type", "application/hal+json")
    .send({
      // Naviguation
      _links: {
        self: hal.halLinkObject("/"),
        concerts: hal.halLinkObject("/concerts"),
      },
      //Etat actuel de ma ressource "Page d'accueil"
      description: "A RESTful concerts ticketing system",
      nbConcerts: "?",
    });
});

// GET /concerts
router.get("/concerts", async function (req, res) {
  const conn = await db.mysql.createConnection(db.dsn);
  try {
    const concert_list = await conn.execute(
      "SELECT artist, music_style, id_concert from Concert WHERE date_start > NOW() GROUP BY id_concert;"
    );
    res
      .status(200)
      .set("Content-Type", "application/hal+json")
      .send({
        _links: {
          self: hal.halLinkObject("/concerts"),
          home: hal.halLinkObject("/"),
        },
        _embedded: {
          concerts: concert_list[0].map((concert) => ({
            artist: concert.artist,
            music_style: concert.music_style,
            _links: {
              self: hal.halLinkObject("/concerts/" + concert.id_concert),
            },
          })),
        },
      });
  } catch (error) {
    console.error("Error connecting: " + error.stack);
    res.status(500).json({
      msg: "Nous rencontrons des difficultés, merci de réessayer plus tard.",
    });
  }
});

// GET /concerts/:id
router.get("/concerts/:id", async function (req, res) {
  const id_concert = req.params.id;
  const conn = await db.mysql.createConnection(db.dsn);
  try {
    const info_concert = await conn.execute(
      `SELECT * from Concert WHERE id_concert = ${id_concert} ;`
    );
    res
      .status(200)
      .set("Content-Type", "application/hal+json")
      .send({
        _links: {
          self: hal.halLinkObject("/concerts/" + id_concert),
          concerts: hal.halLinkObject("/concerts"),
          home: hal.halLinkObject("/"),
        },
        _embedded: {
          artist: info_concert[0][0].artist,
          music_style: info_concert[0][0].music_style,
          location: info_concert[0][0].location,
          description: info_concert[0][0].description,
          date_start: info_concert[0][0].date_start,
          nb_seats: info_concert[0][0].nb_seats,
          _links: {
            self: hal.halLinkObject(
              "/concerts/" + id_concert + "/reservations"
            ),
          },
        },
      });
  } catch (error) {
    console.error("Error connecting: " + error.stack);
    res.status(500).json({
      msg: "Nous rencontrons des difficultés, merci de réessayer plus tard.",
    });
  }
});

// GET /concerts/:id/reservations
router.get("/concerts/:id/reservations", async function (req, res) {
  const id_concert = req.params.id;
  const conn = await db.mysql.createConnection(db.dsn);
  try {
    const reservations_list =
      await conn.execute(`SELECT statut, artist, id_user from Reservation 
      INNER JOIN Concert ON Reservation.id_concert = Concert.id_concert 
      WHERE Concert.id_concert = ${id_concert}`);
    console.log(reservations_list);
    res
      .status(200)
      .set("Content-Type", "application/hal+json")
      .send({
        _links: {
          self: hal.halLinkObject("/concerts/" + id_concert + "/reservations"),
          concerts: hal.halLinkObject("/concerts"),
          home: hal.halLinkObject("/"),
          info_concert: hal.halLinkObject("/concerts/" + id_concert),
        },
        _embedded: {
          reservations: reservations_list[0].map((reservation) => ({
            statut: reservation.statut,
            artist: reservation.artist,
            nom_reservation: reservation.id_user
          })),
        },
      });
  } catch (error) {
    console.error("Error connecting: " + error.stack);
    res.status(500).json({
      msg: "Nous rencontrons des difficultés, merci de réessayer plus tard.",
    });
  }
});

module.exports = router;
