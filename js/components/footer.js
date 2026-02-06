import { handleRegister } from '../pages/register.js'
import { handleUpdate } from '../pages/edit.js'
import { handleConvert, handleCopy, clearAllWords, clearAllTags } from '../pages/output.js'
import { handleImport, handleExport } from '../pages/list.js'

// components/footer.js

let fileInput, actionBtn, copyBtn, clearWordsBtn, clearTagsBtn

export function renderFooter() {
  const f = document.getElementById('footer')
  f.innerHTML = `
    <button id="clear-words"></button>
    <button id="clear-tags"></button>
    <input
      type="file"
      id="csv-file"
      accept=".csv"
    />
    <button id="action"></button>
    <button id="copy">コピー</button>
  `
  clearWordsBtn = f.querySelector('#clear-words')
  clearTagsBtn = f.querySelector('#clear-tags')
  fileInput = f.querySelector('#csv-file')
  actionBtn = f.querySelector('#action')
  copyBtn = f.querySelector('#copy')
}

export function setFooter({ mode }) {
  // 一旦全部非表示
  fileInput.style.display = 'none'
  actionBtn.style.display = 'none'
  copyBtn.style.display = 'none'
  clearWordsBtn.style.display = 'none'
  clearTagsBtn.style.display = 'none'
  actionBtn.onclick = null

  switch (mode) {
    case 'register':
      actionBtn.textContent = '登録'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = handleRegister
      break

    case 'edit':
      actionBtn.textContent = '更新'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = handleUpdate
      break

    case 'output':
      actionBtn.textContent = '変換'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = handleConvert

      copyBtn.textContent = 'コピー'
      copyBtn.style.display = 'inline-block'
      copyBtn.onclick = handleCopy

      clearWordsBtn.textContent = 'ワード全解除'
      clearWordsBtn.style.display = 'inline-block'
      clearWordsBtn.onclick = clearAllWords

      clearTagsBtn.textContent = 'タグ全解除'
      clearTagsBtn.style.display = 'inline-block'
      clearTagsBtn.onclick = clearAllTags
      break

    case 'list':
      fileInput.style.display = 'inline-block'

      actionBtn.textContent = 'CSVインポート'
      actionBtn.style.display = 'inline-block'
      actionBtn.onclick = handleImport

      copyBtn.textContent = 'CSVエクスポート'
      copyBtn.style.display = 'inline-block'
      copyBtn.onclick = handleExport
      break

    default:
      // list など：フッター無し
      break
  }
}
