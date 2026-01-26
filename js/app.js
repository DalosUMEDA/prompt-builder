import { dbService } from './db.js'
import { router, ROUTES } from './router.js'
import { renderHeader } from './components/header.js'
import { renderFooter } from './components/footer.js'

async function init() {
  await dbService.init()
  renderHeader()
  renderFooter()
  router.go(ROUTES.REGISTER)
}

init()
