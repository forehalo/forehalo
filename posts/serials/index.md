---
title: Serials
---

<script setup>
import { data } from './serials.data'

const serials = Object.values(data).sort((a, b) => a.index - b.index)
</script>

<PostCardList :posts="serials" />