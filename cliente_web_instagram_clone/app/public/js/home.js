import { createFetch } from './createFetch.js'
const btnIncluir = document.getElementById('btn_incluir')
const btnCancelarPublicacao = document.getElementById('btn-cancelar-publicacao')
const containerTimeLine = document.getElementById('container_timeline')
const containerForm = document.getElementById('container_form')
const btnPublicar = document.getElementById('btn-publicar')
const arquivo = document.getElementById('arquivo')
const titulo = document.getElementById('titulo')
const formData = new FormData()
const mensagem = document.getElementById('mensagem')
const timeline = document.getElementById('container_timeline')
const buttonPostagem = document.getElementsByClassName('btn_postagem')
const btnRemoverComentario = document.getElementsByClassName('close')

btnIncluir.addEventListener('click', e => {
  containerTimeLine.style.display = 'none'
  containerForm.style.display = 'block'
})

btnCancelarPublicacao.addEventListener('click', e => {
  containerTimeLine.style.display = 'block'
  containerForm.style.display = 'none'
  return false
})

btnPublicar.addEventListener('click', e => {
  formData.append('arquivo', arquivo.files[0])
  formData.append('titulo', titulo.value)

  createFetch('http://localhost:8080/api', 'POST', formData)
    .then(response => response.text())
    .then(function (response) {
      mensagem.innerHTML = response
    })
    .catch(e => console.log(e.message))
})

setTimeout(_ => {
  for (let i = 0; i < buttonPostagem.length; i++) {
    buttonPostagem[i].addEventListener('click', e => {
      const id = buttonPostagem[i].value
      const idInputPostagem = `postagem_${id}`
      const comentario = document.getElementById(idInputPostagem).value
      createFetch(`http://localhost:8080/api/${id}`, 'PUT', JSON.stringify({ comentario }), { 'Content-Type': 'application/json' })
        .then(function () {
          window.location.href = '/home'
        })
    })
  }
}, 50)

setTimeout(_ => {
  for (let i = 0; i < btnRemoverComentario.length; i++) {
    btnRemoverComentario[i].addEventListener('click', e => {
      const idComentario = btnRemoverComentario[i].value
      createFetch(`http://localhost:8080/api/${idComentario}`, 'DELETE')
        .then(function () {
          window.location.href = '/home'
        })
    })
  }
}, 50)

function carregarPostagens () {
  createFetch('http://localhost:8080/api', 'GET')
    .then(response => response.json())
    .then(response => {
      response.forEach(el => {
        const publicacao = document.createElement('div')
        publicacao.classList.add('publicacao')
        publicacao.innerHTML = `
              <span class="titulo">${el.titulo}</span>
              <img src="http://localhost:8080/imagens/${el.urlImagem}">
              <div class="comentarios" id="comentarios_${el._id}"></div>
              <div class="comentar">
                <input type="text" class="form-control input_comentario" id="postagem_${el._id}" placeholder="Adicione um comentário...">
                <button type="button" value="${el._id}" class="btn btn-default btn_postagem">Comentar</button>
              </div>
          `
        timeline.appendChild(publicacao)

        if (el.comentarios) {
          el.comentarios.forEach(com => {
            const comment = document.createElement('div')
            const btnRemove = document.createElement('button')
            comment.classList.add('txt_comentario')
            comment.id = com.id_comentario
            comment.innerHTML = com.comentario
            btnRemove.classList.add('close')
            btnRemove.innerHTML = 'x'
            btnRemove.value = `${com.id_comentario}/${el._id}`
            document.getElementById(`comentarios_${el._id}`).appendChild(comment)
            document.getElementById(`${com.id_comentario}`).appendChild(btnRemove)
          })
        }
      })
    })
}

carregarPostagens()
