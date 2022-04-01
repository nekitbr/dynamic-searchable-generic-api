const Estado = require('../models/Estado')

exports.get = (req, res) => {
    const existingKeys = Object.keys(Estado[0])
    const queryKeys = Object.keys(req.query)
    const queryValues = Object.values(req.query)
    console.log(queryKeys, queryValues)
    const notSupportedKeys = []

    if(queryKeys.length > existingKeys.length){
        res.send('You used too many search parameters')
        return
    }

    for (let i = 0; i < queryKeys.length; i++) {
        const key = queryKeys[i]
        if(!existingKeys.includes(key))
            notSupportedKeys.push(key)
    }

    if(notSupportedKeys.length > 0){
        res.send(`The parameters "${(notSupportedKeys).toString().replaceAll(',', ', ')}" does not exist in the database. \nSupported query parameters: "${(existingKeys).filter(e=>e!='id').toString().replaceAll(',', ', ')}".`)
        return
    }

    if(queryKeys.includes('id')){
        res.send(`You are passing the ID through query parameters, if you wish to get a specific ID you should use the :id option within the URI`)
        return
    }
    const id = req?.params?.id
    const withoutId = !id
    const response = []


    if(!id && queryKeys.length < 1){
        res.send(Estado)
        return
    }

    if(id && queryKeys.length < 1){
        res.send(Estado[id-1])
        return
    }

    for (let i = 0; i < Object.keys(Estado).length; i++) {
        const estado = Estado[i]
        let isTrueMatch = false

        for (let k = 0; k < queryKeys.length; k++) {
            if((estado[queryKeys[k]] == queryValues[k] || queryValues[k].includes(estado[queryKeys[k]].toString())) && (estado.id == id || withoutId))
                isTrueMatch = true
            else
                isTrueMatch = false; continue
        }

        if(isTrueMatch)
            response.push(estado)
    }

    res.send(response)
}