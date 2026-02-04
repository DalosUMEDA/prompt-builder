import { handleRegister } from '../pages/register.js'
import { handleUpdate } from '../pages/edit.js'
import { handleConvert, handleCopy } from '../pages/output.js'

// components/footer.js

let fileInput, actionBtn, copyBtn

export function renderFooter() {
  const f = document.getElementById('footer')
  f.innerHTML = `
    <input
      type="file"
      id="csv-file"
      accept=".csv"
    />
    <button id="action"></button>
    <button id="copy">コピー</button>
  `
  fileInput = f.querySelector('#csv-file')
  actionBtn = f.querySelector('#action')
  copyBtn = f.querySelector('#copy')
}

export function setFooter({ mode }) {
  // 一旦全部非表示
  fileInput.style.display = 'none'
  actionBtn.style.display = 'none'
  copyBtn.style.display = 'none'
  actionBtn.onclick = null

  switch (mode) {
    case 'register':
      actionBtn.textContent = '登録'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = () =>
        import('../pages/register.js').then(m => m.handleRegister())
      break

    case 'edit':
      actionBtn.textContent = '更新'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = () =>
        import('../pages/edit.js').then(m => m.handleUpdate())
      break

    case 'output':
      actionBtn.textContent = '変換'
      copyBtn.textContent = 'コピー'
      actionBtn.style.display = 'inline-block'
      copyBtn.style.display = 'inline-block'
      actionBtn.onclick = () =>
        import('../pages/output.js').then(m => m.handleConvert())
      copyBtn.onclick = () =>
        import('../pages/output.js').then(m => m.handleCopy())
      break

    case 'list':
      actionBtn.textContent = 'CSVインポート'
      copyBtn.textContent = 'CSVエクスポート'

      fileInput.style.display = 'inline-block'
      actionBtn.style.display = 'inline-block'
      copyBtn.style.display = 'inline-block'

      actionBtn.onclick = () =>
        import('../pages/list.js').then(m => m.handleImport())

      copyBtn.onclick = () =>
        import('../pages/list.js').then(m => m.handleExport())
      break

    default:
      // list など：フッター無し
      break
  }
}
