// pages/output.js
import { dbService } from '../db.js'
import { showMessage } from '../components/message.js'
import { setFooter } from '../components/footer.js'
import { sortWords, SORT_TYPES } from '../utils/sort.js'

let selectedJpWords = []
let selectedTags = []
let currentSort = SORT_TYPES.JP_ASC
let jpInputEl, enOutputEl, copyBtn
let allWords = []
const TAG_COLLAPSE_LIMIT = 8
let isTagExpanded = false

export async function renderOutput(container) {
  setFooter({ mode: 'output' })

  const wrapper = document.createElement('div')
  wrapper.className = 'output-page'

  jpInputEl = createTextarea('日本語入力')
  enOutputEl = createTextarea('英語出力')
  enOutputEl.readOnly = true

  allWords = await dbService.getAllWords()

  const sortSelect = createSortSelect()

  const tagsButtonArea = document.createElement('div')
  tagsButtonArea.className = 'tag-buttons'
  const wordsButtonsArea = document.createElement('div')
  wordsButtonsArea.className = 'word-buttons'
  await renderTagButtons(tagsButtonArea, wordsButtonsArea, allWords)

  // 初回のみすべてのタグを表示
  await renderWordButtons(wordsButtonsArea, allWords)

  wrapper.append(
    jpInputEl,
    enOutputEl,
    sortSelect,
    document.createElement('hr'),
    tagsButtonArea,
    document.createElement('hr'),
    wordsButtonsArea
  )
  container.appendChild(wrapper)

  updateView()
  updateWordView()
}

function createTextarea(placeholder) {
  const ta = document.createElement('textarea')
  ta.placeholder = placeholder
  ta.readOnly = true
  ta.classList.add('output-area')
  ta.rows = 5
  return ta
}

function createSortSelect() {
  const sortSelect = document.createElement('select')
  sortSelect.innerHTML = `
    <option value="jp-asc">日本語（昇順）</option>
    <option value="jp-desc">日本語（降順）</option>
    <option value="en-asc">英語（昇順）</option>
    <option value="en-desc">英語（降順）</option>
  `
  sortSelect.value = 'jp-asc'

  sortSelect.onchange = e => {
    currentSort = e.target.value
    updateWordView()
  }
  return sortSelect
}

function updateWordView() {
  const filtered = filterWordsByTag(allWords, selectedTags)
  const sorted = sortWords(filtered, currentSort)
  const container = document.querySelector('.word-buttons')

  renderWordButtons(container, sorted)
}

async function renderWordButtons(container, words) {
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
  // 選択済みの単語は引き続き選択状態にする
  if (selectedJpWords.includes(word.jp)) {
    btn.classList.add('selected')
  }

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

  document
    .querySelectorAll('.tag-buttons button')
    .forEach(btn => {
      btn.classList.toggle(
        'selected',
        selectedTags.includes(btn.dataset.tag)
      )
    })

  // 全解除ボタン制御
  document.querySelector('#clear-words')?.toggleAttribute(
    'disabled',
    selectedJpWords.length === 0
  )
  document.querySelector('#clear-tags')?.toggleAttribute(
    'disabled',
    selectedTags.length === 0
  )

  // コピー可否
  copyBtn && (copyBtn.disabled = enOutputEl.value.length === 0)
}

async function renderTagButtons(tagContainer, wordContainer, words) {
  const allTags = await dbService.getAllTags()
  tagContainer.innerHTML = ''

  const visibleTags = isTagExpanded
    ? allTags
    : allTags.slice(0, TAG_COLLAPSE_LIMIT)

  visibleTags.forEach(tag => {
    const btn = createTagButton(wordContainer, words, tag)

    tagContainer.appendChild(btn)
  })

  if (allTags.length > TAG_COLLAPSE_LIMIT) {
    const toggleBtn = document.createElement('button')
    toggleBtn.className = 'tag-toggle'

    toggleBtn.textContent = isTagExpanded
      ? '− 折りたたむ'
      : `＋ 他${allTags.length - TAG_COLLAPSE_LIMIT}件`

    toggleBtn.onclick = () => {
      isTagExpanded = !isTagExpanded
      renderTagButtons(tagContainer, wordContainer, words)
      updateView()
    }

    tagContainer.appendChild(toggleBtn)
  }
}

function createTagButton(wordContainer, allWords, tag) {
  const btn = document.createElement('button')
  btn.textContent = tag
  btn.dataset.tag = tag

  // 選択状態の同期（DOM生成時）
  if (selectedTags.includes(tag)) {
    btn.classList.add('selected')
  }

  btn.onclick = () => {
    const index = selectedTags.indexOf(tag)
    if (index >= 0) {
      selectedTags.splice(index, 1)
    } else {
      selectedTags.push(tag)
    }
    updateView()
    updateWordView(wordContainer, allWords)
  }

  return btn
}

function filterWordsByTag(words, selectedTags) {
  if (selectedTags.length === 0) return words
  return words.filter(word =>
    selectedTags.some(tag => word.tags.includes(tag))
  )
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

export function clearAllWords() {
  selectedJpWords = []
  console.log("aaa")
  updateView()
  updateWordView()
}

export function clearAllTags() {
  selectedTags = []
  updateView()
  updateWordView()
}

