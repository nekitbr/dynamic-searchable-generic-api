require('dotenv').config()
var express = require('express')
var app = express()
var host = process.env.URL_LISTENER
var port = process.env.PORT_LISTENER

app.use(express.static('public'))

app.use(require('./routes/api'))

var server = app.listen(port, function () {

  console.log(`Server listening at http://${host}:${port}`)
})