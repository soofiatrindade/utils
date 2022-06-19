let array = []

export default async function (id, expira, funcao) {
  let idx = array.findIndex(i => i.id === id)
  if (idx === -1) {
    let content = await funcao()
    array.push({ id, expira: new Date().getTime() + expira * 60 * 1000, content })
    return content
  } else if (array[idx].expira < new Date().getTime()) {
    let content = await funcao()
    array[idx].expira = new Date().getTime() + expira * 60 * 1000
    array[idx].content = content
  }
  return array[idx].content
}
