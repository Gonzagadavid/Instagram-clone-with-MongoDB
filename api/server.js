const express = require('express')
const multiparty = require('connect-multiparty')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'
const objectId = require('mongodb').ObjectId
const { ObjectId } = require('bson')
const app = express()
const port = 8080

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(multiparty())
app.listen(port)
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

console.log(`Servidor HTTP esta escutando na porta ${port}`)

app.get('/', (req, res) => res.send({ msg: 'Olá' }))

// Post(crate)
app.post('/api', (req, res) => {
  const date = new Date()
  const timeStamp = date.getTime()

  const urlImagem = `${timeStamp}_${req.files.arquivo.originalFilename}`

  const pathOrigem = req.files.arquivo.path
  const pathDestino = `./uploads/${urlImagem}`

  fs.rename(pathOrigem, pathDestino, err => {
    if (err) return res.status(500).json({ error: err })

    const dados = {
      urlImagem,
      titulo: req.body.titulo
    }

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) { res.json(err); return client.close() }
      const dbo = client.db('instagram')
      dbo.collection('postagens').insertOne(dados, (err, records) => {
        if (err) { res.json(`erro: ${err}`); return client.close() }
        res.json({ status: 'inclusao realizada com sucesso' })
        client.close()
      })
    })
  })
})

// GET(ready)
app.get('/api', (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) { res.json(err); return client.close() }
    const dbo = client.db('instagram')
    dbo.collection('postagens').find({}).toArray((err, results) => {
      if (err) { res.json(err); return client.close() }
      res.json(results)
      client.close()
    })
  })
})

// GET by id(ready)
app.get('/api/:id', (req, res) => {
  const id = objectId(req.params.id)
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) { res.json(err); return client.close() }
    const dbo = client.db('instagram')
    dbo.collection('postagens').findOne(id, (err, results) => {
      if (err) { res.json(err); return client.close() }
      res.json(results)
      client.close()
    })
  })
})

app.get('/imagens/:imagem', (req, res) => {
  const img = req.params.imagem
  fs.readFile(`./uploads/${img}`, (err, content) => {
    if (err) return res.status(400).json(err)
    res.writeHead(200, { 'content-type': 'image/png' })
    res.end(content)
  })
})

// PUT by id(update)
app.put('/api/:id', (req, res) => {
  const id = objectId(req.params.id)
  const comentario = req.body.comentario
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) { res.json(err); return client.close() }
    const dbo = client.db('instagram')
    dbo.collection('postagens').updateOne(
      { _id: id },
      {
        $push: {
          comentarios: {
            id_comentario: new ObjectId(),
            comentario: comentario
          }
        }
      },
      (err, records) => {
        if (err) { res.json(err); return client.close() }
        res.json(records)
        client.close()
      })
  })
})

// DELETE by id(remove)
app.delete('/api/:id/:id_post', (req, res) => {
  const id = objectId(req.params.id)
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) { res.json(err); return client.close() }
    const dbo = client.db('instagram')
    dbo.collection('postagens').updateMany(
      { _id: objectId(req.params.id_post) },
      {
        $pull: {
          comentarios: {
            id_comentario: id
          }
        }
      },
      (err, results) => {
        if (err) { res.json(err); return client.close() }
        res.json(results)
        client.close()
      })
  })
})
