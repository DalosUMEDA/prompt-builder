import { dbService } from '../db.js'
import { showMessage } from '../components/message.js'
import { setFooter } from '../components/footer.js'

let rows = []
let allTags = []
let activeRowIndex = 0

export function renderRegister(container) {
  setFooter({ mode: 'register' })
  document.querySelector('#action').textContent = '登録'
  document.querySelector('#action').dataset.page = 'register'

  rows = [{ jp: '', en: '', tags: [] }]
  loadAllTags()

  container.innerHTML = `
    <div class="register-page">
      <div id="rows"></div>
      <button id="add-row">＋ 行を追加</button>
      <div class="tag-selector">
        <p>登録済みタグ</p>
        <div class="tag-buttons"></div>
      </div>
    </div>
  `

  renderRows()
  loadAndRenderTags()
  document.getElementById('add-row').onclick = addRow
}

async function loadAllTags() {
  allTags = await dbService.getAllTags()
}

function renderRows() {
  const box = document.getElementById('rows')
  box.innerHTML = ''

  rows.forEach((row, i) => {
    const div = document.createElement('div')
    div.className = 'input-row'
    div.innerHTML = `
      <div class="input-row">
        <input placeholder="日本語">
        <input placeholder="英語">
        <input placeholder="タグ（カンマ区切り）">
        ${rows.length > 1 ? `<button data-i="${i}" class="delete-row" title="行を削除">✕</button>` : ''}
      </div>
    `

    const [jp, en, tags] = div.querySelectorAll('input')
    const tagButtons = div.querySelector('.register-tags')

    renderTagButtons(tagButtons)
    jp.value = row.jp
    en.value = row.en
    tags.value = row.tags.join(",")

    jp.onfocus = () => {
      activeRowIndex = i
      renderTagButtons()
    }
    en.onfocus = () => {
      activeRowIndex = i
      renderTagButtons()
    }
    tags.onfocus = () => {
      activeRowIndex = i
      renderTagButtons()
    }

    jp.oninput = e => (rows[i].jp = e.target.value)
    en.oninput = e => (rows[i].en = e.target.value)
    tags.oninput = e => {
      rows[i].tags = parseTags(e.target.value)
      renderTagButtons()
    }

    const del = div.querySelector('button')
    if (del) {
      del.onclick = () => {
        rows.splice(i, 1)
        renderRows()
      }
    }

    box.appendChild(div)
  })
}

function addRow() {
  rows.push({ jp: '', en: '', tags: [] })
  activeRowIndex = rows.length - 1
  renderRows()
}

function parseTags(input) {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .filter((t, i, arr) => arr.indexOf(t) === i) // 重複除外
}

export async function handleRegister() {
  let added = 0
  let updated = 0
  const errors = []

  rows.forEach((r, i) => {
    if (!r.jp && !r.en) return  // 完全空行は無視

    if (!r.jp || !r.en) {
      errors.push(i + 1)
    }
  })

  if (errors.length > 0) {
    showMessage({
      type: 'error',
      text: `${errors.join(', ')}行目：日本語と英語を両方入力してください`
    })
    return
  }

  for (const r of rows) {
    if (!r.jp || !r.en) continue

    const existing = await dbService.findByJp(r.jp)
    if (existing && existing.en !== r.en) {
      const ok = confirm(`「${r.jp}」は既に登録されています。上書きしますか？`)
      if (!ok) continue
    }

    const result = await dbService.addOrUpdateByJp(r)
    if (result.type === 'add') added++
    if (result.type === 'update') updated++
  }

  showMessage({
    type: 'success',
    text: `追加 ${added}件 / 更新 ${updated}件`
  })
}

async function loadAndRenderTags() {
  allTags = await dbService.getAllTags()
  renderTagButtons()
}

function renderTagButtons() {
  const container = document.querySelector('.tag-buttons')
  if (!container) return

  container.innerHTML = ''

  allTags.forEach(tag => {
    const btn = document.createElement('button')
    btn.textContent = tag

    btn.classList.toggle(
      'selected',
      rows[activeRowIndex]?.tags.includes(tag)
    )

    btn.onclick = () => toggleTagForActiveRow(tag)

    container.appendChild(btn)
  })
}

function toggleTagForActiveRow(tag) {
  const row = rows[activeRowIndex]
  if (!row) return

  const index = row.tags.indexOf(tag)
  if (index >= 0) {
    row.tags.splice(index, 1)
  } else {
    row.tags.push(tag)
  }

  renderRows()
  renderTagButtons()
}
