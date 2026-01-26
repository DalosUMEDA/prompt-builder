import { router, ROUTES } from '../router.js'

export function renderHeader() {
  const h = document.getElementById('header')
  h.innerHTML = `
    <strong>Prompt Builder</strong>
    <button>登録</button>
    <button>一覧</button>
    <button>出力</button>
  `
  const [r, l, o] = h.querySelectorAll('button')
  r.onclick = () => router.go(ROUTES.REGISTER)
  l.onclick = () => router.go(ROUTES.LIST)
  o.onclick = () => router.go(ROUTES.OUTPUT)
}
