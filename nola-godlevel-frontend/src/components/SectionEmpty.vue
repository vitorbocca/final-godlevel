<template>
  <div class="card" style="margin-top: 16px;">
    <div class="section-header">
      <div class="title">{{ title }}</div>
      <button class="btn btn-ghost" @click="$emit('action')">{{ buttonLabel }}</button>
    </div>
    <div class="empty">{{ emptyText }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  buttonLabel: { type: String, default: 'Adicionar' },
  emptyText: { type: String, default: 'Nenhum conteúdo ainda.' }
});
</script>


