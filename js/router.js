import { renderRegister } from './pages/register.js'
import { renderList } from './pages/list.js'
import { renderEdit } from './pages/edit.js'
import { renderOutput } from './pages/output.js'

export const ROUTES = {
  REGISTER: 'register',
  LIST: 'list',
  EDIT: 'edit',
  OUTPUT: 'output'
}

const app = document.getElementById('app')

export const router = {
  go
}

function go(route, params = {}) {
  app.innerHTML = ''

  switch (route) {
    case ROUTES.REGISTER:
      renderRegister(app)
      break
    case ROUTES.LIST:
      renderList(app)
      break
    case ROUTES.EDIT:
      renderEdit(app, params)
      break
    case ROUTES.OUTPUT:
      renderOutput(app)
      break
  }
}
