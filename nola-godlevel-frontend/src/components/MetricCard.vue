<template>
  <q-card flat bordered class="metric-card bg-white q-hoverable">
    <q-card-section>
      <div class="row items-center no-wrap">
        <q-icon :name="icon" size="md" color="primary" class="q-mr-sm" />
        <div class="text-subtitle1 text-grey-8">{{ title }}</div>
      </div>
      
      <div class="text-h4 text-weight-bold q-mt-sm">
        {{ formattedValue }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Título do cartão (Ex: 'Faturamento Total')
  title: {
    type: String,
    required: true
  },
  // O valor principal a ser exibido (Ex: 1914910.36)
  value: {
    type: [Number, String],
    required: true
  },
  // Opcional: A variação percentual (Ex: 0.128 para +12.8%)
  growthRate: {
    type: Number,
    default: 0
  },
  // Opcional: Para adicionar um ícone visual (Ex: 'mdi-currency-usd')
  icon: {
    type: String,
    default: 'mdi-chart-bar'
  },
  // Opcional: Se o valor representa um tempo e precisa ser formatado diferente
  isTime: {
    type: Boolean,
    default: false
  }
});

// Formata o valor principal como moeda (ou tempo, se isTime for true)
const formattedValue = computed(() => {
    const num = parseFloat(props.value);
    if (isNaN(num)) return props.value;

    if (props.isTime) {
        // Formatação para Tempo (em segundos)
        const totalSeconds = Math.round(num);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} min ${seconds} seg`;
    }

    // Formatação padrão para moeda BRL
    // Verifica se é uma métrica de contagem (ex: total_sales) para não formatar como BRL
    if (props.title.toLowerCase().includes('total de pedidos') || props.title.toLowerCase().includes('total sales')) {
      return num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    }
    
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});

// Calcula a cor e o ícone de crescimento
const growthColor = computed(() => {
    return props.growthRate > 0 ? 'positive' : (props.growthRate < 0 ? 'negative' : 'grey');
});

const growthIcon = computed(() => {
    return props.growthRate > 0 ? 'arrow_upward' : (props.growthRate < 0 ? 'arrow_downward' : 'remove');
});

const formattedGrowth = computed(() => {
    const rate = props.growthRate * 100;
    const prefix = rate >= 0 ? '+' : ''; // Inclui '+' para zero ou positivo
    return `${prefix}${rate.toFixed(1)}%`;
});
</script>

<style scoped>
.metric-card {
    transition: transform 0.3s ease;
    cursor: default;
}
.metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>