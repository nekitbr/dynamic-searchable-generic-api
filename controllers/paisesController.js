const Query = require('../searchEngine/query')

exports.get = (req, res) => {
    const response = Query.GETgeneric('Pais', req)
    if(typeof response === 'object'){

        res.status(Object.keys(response).length > 0 ? 200 : 404).json(
            {
                data: response
            }
        )
    } else if(typeof response === 'string'){
        res.status(400).send('bad request')
    } else {
        res.status(400).send('bad request')
    }
}