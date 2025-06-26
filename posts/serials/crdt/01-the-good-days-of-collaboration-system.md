---
title: Yjs - 01 - The good days of collaboration system
description: CRDT is the most beautiful tool I've ever seen on building a collaborative application.
date: 2025-06-02
---
<script setup>
import YMonaco11 from './src/episode1/y-monaco.vue'
import YMonaco12 from './src/episode1/collaborative-y-monaco.vue'
import EditorList from'./src/editor-list.vue' 
</script>

### Let's go collaborate

A `Doc` instance is what we should get started with.

```ts
import { Doc } from 'yjs'

const doc = new Doc()

// send local update to peers and persist it in db
doc.on('update', (update: Uint8Array) => {
  peer.push(update)
  local.save(update)
  server.push(update)
})
```

The `update` event on `Doc` instance is where we broadcast the updates to peers, push them to centerized server or local DB to have our data persisted. It's quite straightforward.

> Updates received in update event are well encoded as binary format(`Uint8Array`), which can be parsed by `decodeUpdate` or applied to other doc by `applyUpdate`.

We could create and get a `text` type from the doc, and manipulate it. Alongside any changes happened on the `text`, there will be following `update` event triggered internally.

```ts
const ytext = doc.getText('content')

ytext.insert(0, 'Hello world!') // trigger `update`
ytext.insert(5, ',')            // trigger `update`

ytext.toString() // "Hello, world!"
```

With the basic understanding on how `Yjs` works, we can now bind the `content` with an editor like `Monaco` or `ProseMirror`.

The follwing demonstrations will be using the `Monaco` editor with `y-monaco` binding. `y-monaco` is a simple wrapper layer against `Monaco` and `Yjs`, provides out-of-box connecting ability between `Monaco` editor model with `Yjs`. It's not a full-featured wrapper, but basically meets our requirement on demonstrating. 

```ts
import { MonacoBinding } from "y-monaco"
import { Doc } from 'yjs'

class CollaborativeDoc {
  #doc = new Doc()

  bind(el: HTMLElement) {
    const ytext = this.#doc.getText('content')
    const editor = renderMonacoEditor(el)

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
    )

    return { editor, binding }
  }
}
```

We now have a minimal usable editor. Any changes in the editor, will reflect as an update to bound `Doc` instance. 

<YMonaco11 />

Once we have `Monaco` connected with `Yjs` successfully, it's time to make dual or multiples editors collaborative. I'm gonna use `BroadcastChannel` to act like peer-to-peer network broadcasting so we don't rely on a server to do the proxy.

```ts
import { Doc } from 'yjs'                                          // [!code --]
import { Doc, applyUpdate } from 'yjs'                             // [!code ++]

class CollaborativeDoc {
  #doc = new Doc()
  #channel = new BroadcastChannel('yjs')                           // [!code ++]
 
  constructor() {
    this.#channel.addEventListener('message', this.#onPeerMessage) // [!code ++]
    this.#doc.on('update', this.#onLocalUpdate)                    // [!code ++]
  }

  #onPeerMessage(event) {                                          // [!code ++]
    if (event.data.type === 'update')                              // [!code ++]
      applyUpdate(this.#doc, event.data.data, 'peer')              // [!code ++]
  }                                                                // [!code ++]
  #onLocalUpdate(update, origin) {                                 // [!code ++]
    if (origin === 'peer') return                                  // [!code ++]
    this.#channel.postMessage({ type: 'update', data: update })    // [!code ++]
  }                                                                // [!code ++]
}
```

Two things was done with above updates:

- Receiving peers' doc update by `message` event of `BroadcastChannel`.
- Sending local doc to peers by `postMessage` method, in `update` event of doc.

But there is yet another super important thing: **remote cursor**. A remote cursor or remote selection indicator could give us quick notice that somebody is on some line about to typing or deleting some words, otherwise it will look like some "ghost" is hebind you and touching your code. `Yjs` also provide it built in, with a protocol name `Awareness`.

Let's make it happen.

```ts
import {                         // [!code ++]
  Awareness,                     // [!code ++]
  applyAwarenessUpdate,          // [!code ++]
  encodeAwarenessUpdate,         // [!code ++]
} from "y-protocols/awareness"   // [!code ++]

class CollaborativeDoc {
  #doc = new Doc()
  #awareness = new Awareness(this.#doc)                                  // [!code ++]
  #channel = new BroadcastChannel('yjs')
 
  constructor() {
    this.#channel.addEventListener('message', this.#onPeerMessage)
    this.#doc.on('update', this.#onLocalUpdate)
    this.#awareness.on('update', this.#onLocalAwarenessUpdate)          // [!code ++]
  }

  #onPeerMessage(event) {
    if (event.data.type === 'update') {
      applyUpdate(this.#doc, event.data.data, 'peer')
    if (event.data.type === 'awareness')                                // [!code ++]
      applyAwarenessUpdate(this.#awareness, event.data.data, 'peer')    // [!code ++]
  }

  #onLocalAwarenessUpdate(changes, origin) {                            // [!code ++]
    if (origin === 'peer') return                                       // [!code ++]
    const changedClients = added.concat(updated).concat(removed)        // [!code ++]
    this.#channel.postMessage({                                         // [!code ++]
      type: 'awareness',                                                // [!code ++]
      data: encodeAwarenessUpdate(this.#awareness, changedClients)      // [!code ++]
    })                                                                  // [!code ++]
  }                                                                     // [!code ++]

  bind(el: HTMLElement) {
    // ...
    const binding = new MonacoBinding(
      this.#doc.getText('content'),
      editor.getModel(),
      new Set([editor]),
      this.#awareness                                                   // [!code ++]
    )
  }
}
```

> Likewise, the `Awareness` protocol of `Yjs` shares state in the form of binary as well. All we need to do is encoding and send updates to peers by `encodeAwarenessUpdate`, and applying updates from peers to local awareness instance by `applyAwarenessUpdate`.

So here we go. We now have a fully collaborative editor. Clicking on the `[Add Peer]` button to add more peers, and don't forget opening a new browser tab to join the game too!

<EditorList :editor="YMonaco12" />

### Overview

By walking through this episode, we achieved the following:

- We learnt a little how to use Yjs text type
- We created a `Monaco` editor bound with Yjs text type
- We created a mocked peer-to-peer network to practice broadcasting doc updates

Using `Yjs` is extremely easy. It takes care all complicated details for us so that we could do all these within 100 lines of code.

### What's next?

There is always *“but”*.

Till now, I only showed you exactly what you will see in all other `CRDT` or `Yjs` tutorials. Although things work as expected, there are already some problems invisible.

In next episode, I will lead you go deeper to catch those problems and discuss on how can we avoid them.

::: info

Code runs in this post is available at [GitHub](https://github.com/forehalo/forehalo/tree/main/posts/serials/crdt/src/)

:::