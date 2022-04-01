require('dotenv').config()
var express = require('express')
var app = express()
var host = process.env.URL_LISTENER
var port = process.env.PORT

app.set('view engine', 'ejs')

app.use('/public', express.static(__dirname + '/public'))

app.use(require('./routes/api'))


var server = app.listen(port, function () {

  console.log(`Server listening at http://${host}:${port}`)
})