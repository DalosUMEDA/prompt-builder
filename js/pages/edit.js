// pages/edit.js
import { dbService } from '../db.js'
import { showMessage } from '../components/message.js'
import { router } from '../router.js'
import { setFooter } from '../components/footer.js'

let editingWord = null
let jpInput, enInput, tagsInput

export async function renderEdit(container, params) {
  setFooter({ mode: 'edit' })
  const { id } = params

  editingWord = await dbService.getWordById(id)

  if (!editingWord) {
    showMessage({ type: 'error', text: 'データが見つかりません' })
    router.go('list')
    return
  }

  jpInput = document.createElement('input')
  jpInput.value = editingWord.jp

  enInput = document.createElement('input')
  enInput.value = editingWord.en

  tagsInput = document.createElement('input')
  tagsInput.value = (editingWord.tags ?? []).join(",")
  tagsInput.placeholder = 'タグ（カンマ区切り）'

  const wrapper = document.createElement('div')
  wrapper.className = 'edit-page'
  wrapper.append(jpInput, enInput, tagsInput)

  container.appendChild(wrapper)
}

export async function handleUpdate() {
  const jp = jpInput.value.trim()
  const en = enInput.value.trim()
  const tags = parseTags(tagsInput.value)

  // 両方空 → 削除
  if (!jp && !en) {
    showMessage({
      type: 'confirm',
      text: 'この単語を削除しますか？',
      onConfirm: async () => {
        await dbService.deleteWord(editingWord.id)
        showMessage({ type: 'success', text: '削除しました' })
        router.go('list')
      }
    })
    return
  }

  // 片方だけ空
  if (!jp || !en) {
    showMessage({ type: 'error', text: '日本語と英語は両方入力してください' })
    return
  }

  if (jp.includes('、') || en.includes('、')) {
    showMessage({ type: 'error', text: '「、」は使用できません' })
    return
  }

  await dbService.updateWord(editingWord.id, { jp, en, tags })

  showMessage({ type: 'success', text: '更新しました' })
  router.go('list')
}

function parseTags(input) {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .filter((t, i, arr) => arr.indexOf(t) === i) // 重複除外
}
