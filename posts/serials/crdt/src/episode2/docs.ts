import { applyUpdate, decodeUpdate, Doc } from 'yjs'

import type { Editor } from '@/components/monaco'

type Message = {
  type: 'update'
  data: Uint8Array
}

export class BasicCollaborativeDoc {
  #doc = new Doc()
  #channel: BroadcastChannel = new BroadcastChannel('yjs-episode2-basic')

  constructor() {
    this.#channel.addEventListener('message', this.#onPeerMessage)
    this.#doc.on('update', this.#onLocalUpdate)
  }

  #onPeerMessage = (event: MessageEvent<Message>) => {
    if (event.data.type === 'update') applyUpdate(this.#doc, event.data.data, 'peer')
  }

  #onLocalUpdate = (update: Uint8Array, origin: string) => {
    if (origin === 'peer') return

    console.log(decodeUpdate(update))
    this.#channel.postMessage({
      type: 'update',
      data: update,
    } satisfies Message)
  }

  async bind(editor: Editor) {
    const { MonacoBinding } = await import('y-monaco')
    const content = this.#doc.getText('content')
    const model = editor.getModel()

    const binding = new MonacoBinding(content, model, new Set([editor]))

    model.setValue('helld')

    return {
      editor,
      binding,
    }
  }
}
