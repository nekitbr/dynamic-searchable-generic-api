var express = require('express');
var router = express.Router();
const
[ paisesController, estadosController, cidadesController ] =
[ require('../controllers/paisesController'), require('../controllers/estadosController'), require('../controllers/cidadesController') ]

router.use(function timeLog(req, res, next) {
  console.log(`Connection at ${process.env.URL_LISTENER}${req.url}`);
  next();
});

router.route('/paises/:id?/')
.get(paisesController.get)

router.route('/estados/:id?/')
.get(estadosController.get)

router.route('/cidades/:id?/')
.get(cidadesController.get)



module.exports = router;