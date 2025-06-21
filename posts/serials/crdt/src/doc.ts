import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import { applyUpdate, Doc, encodeStateAsUpdate } from 'yjs'

import type { Editor } from '@/components/monaco'

type Message =
  | {
      type: 'awareness'
      data: Uint8Array
    }
  | {
      type: 'update'
      data: Uint8Array
    }
  | {
      type: 'init'
    }

type AwarenessChanges = Record<'added' | 'updated' | 'removed', number[]>

let first = true
export class CollaborativeDoc {
  #doc = new Doc()
  #awareness = new Awareness(this.#doc)
  #channel: BroadcastChannel = new BroadcastChannel('yjs')

  constructor() {
    this.#channel.addEventListener('message', this.#onPeerMessage)
    this.#doc.on('update', this.#onLocalUpdate)
    this.#awareness.on('update', this.#onLocalAwarenessUpdate)
    this.#channel.postMessage({ type: 'init' } satisfies Message)
  }

  #onPeerMessage = (event: MessageEvent<Message>) => {
    if (event.data.type === 'update') applyUpdate(this.#doc, event.data.data, 'peer')
    if (event.data.type === 'awareness') applyAwarenessUpdate(this.#awareness, event.data.data, 'peer')
    if (event.data.type === 'init')
      this.#channel.postMessage({
        type: 'update',
        data: encodeStateAsUpdate(this.#doc),
      } satisfies Message)
  }

  #onLocalUpdate = (update: Uint8Array, origin: string) => {
    if (origin === 'peer') return

    this.#channel.postMessage({
      type: 'update',
      data: update,
    } satisfies Message)
  }

  #onLocalAwarenessUpdate = ({ added, updated, removed }: AwarenessChanges, origin: string) => {
    if (origin === 'peer') return

    const changedClients = added.concat(updated).concat(removed)
    this.#channel.postMessage({
      type: 'awareness',
      data: encodeAwarenessUpdate(this.#awareness, changedClients),
    } satisfies Message)
  }

  async bind(editor: Editor) {
    const { MonacoBinding } = await import('y-monaco')
    const content = this.#doc.getText('content')
    if (first && !content.toString()) {
      first = false
      content.insert(0, 'Hello world!')
    }

    const binding = new MonacoBinding(content, editor.getModel(), new Set([editor]), this.#awareness)

    return {
      editor,
      binding,
    }
  }
}
