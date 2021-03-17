export function createFetch (url, method, body = null, headers) {
  function headleError (response) {
    if (!response.ok) {
      console.log('erro')
      throw Error(response.status + ': ' + response.statusText)
    }

    return response
  }

  return fetch(url, {
    method,
    body,
    headers: headers
  })

    .then(response => headleError(response))
}
