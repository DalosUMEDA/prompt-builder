// components/message.js

let modal = null

export function showMessage({ type, text, onConfirm, onCancel }) {
  closeMessage()

  modal = document.createElement('div')
  modal.className = 'modal-overlay'

  const box = document.createElement('div')
  box.className = `modal-box ${type}`

  const message = document.createElement('p')
  message.textContent = text

  const buttons = document.createElement('div')
  buttons.className = 'modal-buttons'

  const okBtn = document.createElement('button')
  okBtn.textContent = 'OK'
  okBtn.onclick = () => {
    closeMessage()
    onConfirm?.()
  }

  buttons.appendChild(okBtn)

  if (type === 'confirm') {
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'キャンセル'
    cancelBtn.onclick = () => {
      closeMessage()
      onCancel?.()
    }
    buttons.appendChild(cancelBtn)
  }

  box.append(message, buttons)
  modal.appendChild(box)
  document.body.appendChild(modal)
}

function closeMessage() {
  if (modal) {
    modal.remove()
    modal = null
  }
}

