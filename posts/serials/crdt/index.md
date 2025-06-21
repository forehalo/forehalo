---
title: CRDT
description: Why and why not CRDT. Examples with Yjs.
date: 2025-06-02
index: 1
---

<script setup>
import { data } from '../serials.data'

const {posts} = data['crdt']
</script>

This is a series of blogs aiming at sharing my experiences with using [CRDTs](https://crdt.tech/) in AFFiNE, the problems I encountered, and how I resolved them.

In this series, I won't teach how to build a collaboration system with CRDT from scratch because you would find them anywhere on the Internet. Let's jump in and take a look at what it can benifit us and what would be the <span style="font-size:24px">***cost***</span>.

## Episodes

All code parts will be using [Yjs](https://yjs.dev/), one of the most popular CRDT implementation with JavaScript.
CRDTs implementations differ but conceptually the same.

<PostList :posts="posts" />

<SeriesStatusBadge :completed="false" />