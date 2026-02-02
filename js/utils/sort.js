export const SORT_TYPES = {
  JP_ASC: 'jp-asc',
  JP_DESC: 'jp-desc',
  EN_ASC: 'en-asc',
  EN_DESC: 'en-desc'
}

export function sortWords(words, sortType) {
  const list = [...words]

  switch (sortType) {
    case SORT_TYPES.JP_ASC:
      return list.sort((a, b) => a.jp.localeCompare(b.jp, 'ja'))
    case SORT_TYPES.JP_DESC:
      return list.sort((a, b) => b.jp.localeCompare(a.jp, 'ja'))
    case SORT_TYPES.EN_ASC:
      return list.sort((a, b) => a.en.localeCompare(b.en))
    case SORT_TYPES.EN_DESC:
      return list.sort((a, b) => b.en.localeCompare(a.en))
    default:
      return list
  }
}
