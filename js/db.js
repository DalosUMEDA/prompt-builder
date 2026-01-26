const DB_NAME = 'PromptBuilderDB'
const DB_VERSION = 1
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
  bulkAdd
}

function init() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = e => {
      db = e.target.result
      const store = db.createObjectStore(STORE, {
        keyPath: 'id',
        autoIncrement: true
      })
      store.createIndex('jp', 'jp', { unique: false })
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

async function addOrUpdateByJp({ jp, en }) {
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
          updatedAt: Date.now()
        })
        resolve({ type: 'update' })
      } else {
        // 新規追加
        store.add({
          jp,
          en,
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

function updateWord(id, { jp, en }) {
  return getWordById(id).then(word =>
    request(tx('readwrite').put({ ...word, jp, en, updatedAt: Date.now() }))
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
      store.add({ ...w, createdAt: Date.now(), updatedAt: Date.now() })
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
