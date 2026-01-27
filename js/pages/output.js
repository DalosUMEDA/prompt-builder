// pages/output.js
import { dbService } from '../db.js'
import { showMessage } from '../components/message.js'
import { setFooter } from '../components/footer.js'

let selectedJpWords = []
let jpInputEl, enOutputEl, copyBtn

export async function renderOutput(container) {
  setFooter({ mode: 'output' })
  selectedJpWords = []

  const wrapper = document.createElement('div')
  wrapper.className = 'output-page'

  jpInputEl = createTextarea('日本語入力')
  enOutputEl = createTextarea('英語出力')
  enOutputEl.readOnly = true

  const buttonsArea = document.createElement('div')
  buttonsArea.className = 'word-buttons'

  await renderWordButtons(buttonsArea)

  wrapper.append(jpInputEl, enOutputEl, buttonsArea)
  container.appendChild(wrapper)

  updateView()
}

function createTextarea(placeholder) {
  const ta = document.createElement('textarea')
  ta.placeholder = placeholder
  ta.readOnly = true
  ta.classList.add('output-area')
  ta.rows = 5
  return ta
}

async function renderWordButtons(container) {
  const words = await dbService.getAllWords()
  container.innerHTML = ''

  words.forEach(word => {
    const btn = createWordButton(word)

    container.appendChild(btn)
  })
}

function createWordButton(word) {
  const btn = document.createElement('button')
  btn.textContent = word.jp
  btn.dataset.jp = word.jp

  btn.onclick = () => {
    toggleWord(word.jp)
  }

  return btn
}

function toggleWord(jp) {
  const index = selectedJpWords.indexOf(jp)

  if (index >= 0) {
    // すでに選択されている → 削除
    selectedJpWords.splice(index, 1)
  } else {
    // 未選択 → 追加
    selectedJpWords.push(jp)
  }

  updateView()
}

function updateView() {
  // 入力欄
  jpInputEl.value = selectedJpWords.join('、')

  // ボタンの選択状態を同期
  document
    .querySelectorAll('.word-buttons button')
    .forEach(btn => {
      btn.classList.toggle(
        'selected',
        selectedJpWords.includes(btn.dataset.jp)
      )
    })

  // コピー可否
  copyBtn && (copyBtn.disabled = enOutputEl.value.length === 0)
}

export async function handleConvert() {
  if (selectedJpWords.length === 0) {
    showMessage({ type: 'error', text: '単語が選択されていません' })
    return
  }

  const result = []

  for (const jp of selectedJpWords) {
    const word = await dbService.findByJp(jp)
    if (word) result.push(word.en)
  }

  enOutputEl.value = result.join(', ')
  updateView()
}

export async function handleCopy() {
  if (!enOutputEl.value) return

  await navigator.clipboard.writeText(enOutputEl.value)
  showMessage({ type: 'success', text: 'コピーしました' })
}

