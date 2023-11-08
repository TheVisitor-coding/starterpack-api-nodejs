var express = require("express");
var router = express.Router();
var db = require("../db");

/* GET home page. */
router.get("/", async function (req, res,) {
  // #swagger.summary = "Page d'accueil"

  const conn = await db.mysql.createConnection(db.dsn);

  try {
    const [rows] = await conn.execute("SELECT * FROM User");

    const users = rows.map((element) => {
      return {
        firstName: element.first_name,
      };
    });
    res.render("index", { title: "RESTful web api", users: users });
  } catch (error) {
    console.error("Error connecting: " + error.stack);
    res.status(500).json({
      msg: "Nous rencontrons des difficultés, merci de réessayer plus tard.",
    });
  }
});

router.get("/users/:id", async function (req, res) {
  const conn = await db.mysql.createConnection(db.dsn);
  const id = req.params.id;
  if (Number(id)) {
    try {
      const row = await conn.execute("SELECT * FROM User WHERE id = ?", [id]);
      console.log("ID from URL:", id);

      const user = {
        firstName: row[0][0].first_name,
      };

      res.render("user", {
        title: "Fiche User",
        user: user,
        id: id,
      });
    } catch (error) {
      console.error("Error connecting: " + error.stack);
      res.status(500).json({
        msg: "Identifiant Inconnu",
      });
    }
  } else {
    res.status(400).json({
      msg: "Identifiant Invalide",
    });
  }
});

module.exports = router;
