// utils/csv.js

export function parseCSV(text) {
  const lines = text.split('\n')
  const result = []

  for (const line of lines) {
    if (!line.trim()) continue

    const [jp, en] = line.split(',')

    if (!jp || !en) {
      throw new Error('CSVの形式が不正です')
    }

    if (jp.includes('、') || en.includes('、')) {
      throw new Error('「、」を含むデータがあります')
    }

    result.push({
      jp: jp.trim(),
      en: en.trim()
    })
  }

  return result
}

// js/utils/csv.js

export function importCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const text = reader.result
        const lines = text.split(/\r?\n/)

        const rows = []

        lines.forEach((line, index) => {
          if (!line.trim()) return

          const cols = line.split(',')
          if (cols.length < 2) return

          const jp = cols[0].trim()
          const en = cols[1].trim()

          // ★ ヘッダ判定
          if (index === 0 && isHeader(jp, en)) return

          if (!jp || !en) return

          rows.push({ jp, en })
        })

        resolve(rows)
      } catch (e) {
        reject(e)
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, 'utf-8')
  })
}

function isHeader(jp, en) {
  const h1 = ['jp', '日本語']
  const h2 = ['en', '英語']

  return (
    h1.includes(jp.toLowerCase()) &&
    h2.includes(en.toLowerCase())
  )
}

export function exportCSV(words) {
  const header = 'jp,en'
  const body = words
    .map(w => `${escape(w.jp)},${escape(w.en)}`)
    .join('\n')

  const csv = [header, body].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'prompt_builder.csv'
  a.click()

  URL.revokeObjectURL(url)
}

function escape(value) {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
