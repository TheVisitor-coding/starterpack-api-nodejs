var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
var loginRouter = require('./routes/login');
var reservationsRouter = require('./routes/reservations');
var dispoTerrainRouter = require('./routes/terrain');
var floodedRouter = require('./routes/flooded');
const hal = require('./hal');



var app = express();

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Home
 */
app.get('/', async function (req, res, next) {
  res.status(200).set('Content-Type', 'application/json')
    .send({
      _links: {
        self: hal.halLinkObject('/'),
        login: hal.halLinkObject('/login'),
        terrains: hal.halLinkObject('/terrains'),
        reservations: hal.halLinkObject('/terrains/{id}/reservations', 'string', "Réservation du terrain à une horaire choisie", true),
      },
      description: 'Bienvenue sur le système de réservation de terrain badminton !'
    }
    );
});


/**
 * Enregistrement des routes
 */
app.use('/', loginRouter);
app.use('/', reservationsRouter);
app.use('/', dispoTerrainRouter)
app.use('/', floodedRouter)


/**
 * Configuration Swagger, exposition de la doc sur la route /doc
 */
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Error');
});

module.exports = app;
