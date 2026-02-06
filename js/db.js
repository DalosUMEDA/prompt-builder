const DB_NAME = 'PromptBuilderDB'
const DB_VERSION = 2
const STORE = 'words'
let db

export const dbService = {
  init,
  addOrUpdateByJp,
  getAllWords,
  getWordById,
  updateWord,
  deleteWord,
  findByJp,
  bulkAdd,
  getAllTags
}

function init() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = event.target.result

      // 既存 store の取得
      let store
      if (!db.objectStoreNames.contains(STORE)) {
        store = db.createObjectStore(STORE, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('jp', 'jp', { unique: false })
      } else {
        store = event.target.transaction.objectStore(STORE)
      }

      if (event.oldVersion < 2) {
        // 全ての既存レコードに {} → tags: []
        store.openCursor().onsuccess = e => {
          const cursor = e.target.result
          if (!cursor) return

          const data = cursor.value
          if (!Array.isArray(data.tags)) data.tags = []
          cursor.update(data)
          cursor.continue()
        }
      }
    }

    req.onsuccess = e => {
      db = e.target.result
      resolve()
    }

    req.onerror = () => reject(req.error)
  })
}

function tx(mode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

async function addOrUpdateByJp({ jp, en, tags = [] }) {
  const store = tx('readwrite')
  const index = store.index('jp')

  return new Promise((resolve, reject) => {
    const req = index.get(jp)

    req.onsuccess = () => {
      const existing = req.result

      if (existing) {
        // 上書き更新
        store.put({
          ...existing,
          en,
          tags: tags.length ? tags : [],
          updatedAt: Date.now()
        })
        resolve({ type: 'update' })
      } else {
        // 新規追加
        store.add({
          jp,
          en,
          tags: tags.length ? tags : existing?.tags || [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        resolve({ type: 'add' })
      }
    }

    req.onerror = () => reject(req.error)
  })
}

function getAllWords() {
  return request(tx('readonly').getAll())
}

function getWordById(id) {
  return request(tx('readonly').get(id))
}

function updateWord(id, { jp, en, tags }) {
  return getWordById(id).then(word =>
    request(tx('readwrite').put({
      ...word,
      jp,
      en,
      tags: tags ?? word.tags ?? [],
      updatedAt: Date.now()
    }))
  )
}

function deleteWord(id) {
  return request(tx('readwrite').delete(id))
}

async function findByJp(jp) {
  return request(tx('readonly').index('jp').get(jp))
}

function bulkAdd(words) {
  return new Promise((resolve, reject) => {
    const store = tx('readwrite')
    words.forEach(w =>
      store.add({
        ...w,
        tags: Array.isArray(w.tags) ? w.tags : [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    )
    store.transaction.oncomplete = resolve
    store.transaction.onerror = reject
  })
}

function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAllTags() {
  const words = await this.getAllWords()
  return [...new Set(words.flatMap(w => w.tags || []))]
}