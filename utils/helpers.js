function getQueryURL(req) {
  try {
    if (Object.keys(req?.query).length) {
      // handles GET requests
      return ('?' + Object.keys(req.query).map(key => key + '=' + req.query[key]).join('&').replace(' ', '%20'))
    } else if (Object.keys(req?.body).length) {
      // handles POST requests (pagination etc)
      return ('?' + Object.keys(req.body).map(key => key + '=' + req.body[key]).join('&').replace(' ', '%20'))
    }
    return null
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getQueryURL
}