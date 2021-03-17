/* importar o módulo do framework express */
const express = require('express')

/* importar o módulo do consign */
const consign = require('consign')

/* importar o módulo do express-validator */
// const expressValidator = require('express-validator')

/* iniciar o objeto do express */
const app = express()

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs')
app.set('views', './app/views')

/* configurar o middleware express.static */
app.use(express.static('./app/public'))

/* configurar o middleware body */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* configurar o middleware express-validator */
// app.use(expressValidator())

/* efetua o autoload das rotas, dos models e dos controllers para o objeto app */
consign()
  .include('app/routes')
  .then('app/models')
  .then('app/controllers')
  .into(app)

/* middleware que configura páginas de status */
app.use((req, res, next) => {
  res.status(404).render('errors/404')
  next()
})

/* middleware que configura msgs de erro internos */
app.use((err, req, res, next) => {
  res.status(500).render('errors/500')
  console.log(err)
  next()
})

/* exportar o objeto app */
module.exports = app
