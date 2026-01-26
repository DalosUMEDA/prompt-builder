// list.js
import { parseCSV, importCSV, exportCSV } from '../utils/csv.js'
import { dbService } from '../db.js'
import { showMessage } from '../components/message.js'
import { router } from '../router.js'
import { setFooter } from '../components/footer.js'

export async function renderList(container) {
  setFooter({ mode: 'list' })
  const wrapper = document.createElement('div')
  wrapper.className = 'list-page'

  const table = document.createElement('table')
  table.className = 'word-table'

  table.appendChild(createHeader())
  table.appendChild(await createBody())

  container.innerHTML = `
    <h2>単語一覧</h2>

    <input
      type="file"
      id="csv-file"
      accept=".csv"
    />

    <div id="list"></div>
  `

  wrapper.appendChild(table)
  container.appendChild(wrapper)
}

function createHeader() {
  const thead = document.createElement('thead')
  const tr = document.createElement('tr')

  ;['日本語', 'プロンプトワード', '操作'].forEach(text => {
    const th = document.createElement('th')
    th.textContent = text
    tr.appendChild(th)
  })

  thead.appendChild(tr)
  return thead
}

async function createBody() {
  const tbody = document.createElement('tbody')
  const words = await dbService.getAllWords()

  if (words.length === 0) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    td.colSpan = 3
    td.textContent = '登録された単語はありません'
    tr.appendChild(td)
    tbody.appendChild(tr)
    return tbody
  }

  words.forEach(word => {
    tbody.appendChild(createRow(word))
  })

  return tbody
}

function createRow(word) {
  const tr = document.createElement('tr')

  const jpTd = document.createElement('td')
  jpTd.textContent = word.jp

  const enTd = document.createElement('td')
  enTd.textContent = word.en

  const actionTd = document.createElement('td')

  const editBtn = document.createElement('button')
  editBtn.textContent = '編集'
  editBtn.onclick = () => {
    router.go('edit', { id: word.id })
  }

  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = '削除'
  deleteBtn.onclick = () => confirmDelete(word)

  actionTd.append(editBtn, deleteBtn)
  tr.append(jpTd, enTd, actionTd)

  return tr
}

async function confirmDelete(word) {
  showMessage({
    type: 'confirm',
    text: `本当に削除しますか？\n${word.jp}: ${word.en}`,
    onConfirm: async () => {
      await dbService.deleteWord(word.id)
      showMessage({ type: 'success', text: '削除しました' })
      router.go('list') // 再描画
    }
  })
}


const fileInput = document.createElement('input')
fileInput.type = 'file'
fileInput.accept = '.csv'

fileInput.onchange = async e => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const words = parseCSV(text)

    showMessage({
      type: 'confirm',
      text: `${words.length}件の単語を登録します。よろしいですか？`,
      onConfirm: async () => {
        await dbService.bulkAdd(words)
        showMessage({ type: 'success', text: 'CSVをインポートしました' })
        router.go('list')
      }
    })
  } catch (err) {
    showMessage({ type: 'error', text: err.message })
  }
}

export async function handleImport() {
  const file = document.getElementById('csv-file')?.files[0]
  if (!file) {
    showMessage({ type: 'error', text: 'CSVファイルを選択してください' })
    return
  }

  const rows = await importCSV(file)
  await dbService.bulkAdd(rows)
  showMessage({ type: 'success', text: `${rows.length}件インポートしました` })
}

export async function handleExport() {
  const words = await dbService.getAllWords()
  exportCSV(words)
}