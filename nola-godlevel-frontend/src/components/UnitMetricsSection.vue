<template>
  <!-- Exibe os cartões em 4 colunas em telas médias e grandes -->
  <div class="row q-col-gutter-md q-mt-md">
    
    <!-- Skeleton/Loading State (Melhora a UX) -->
    <template v-if="isLoading">
        <div v-for="n in 4" :key="n" class="col-12 col-md-3">
            <q-skeleton type="QCard" style="height: 120px;" />
        </div>
    </template>

    <!-- Cartões Reais -->
    <template v-else-if="metrics && Object.keys(metrics).length > 0">
        <div 
            v-for="(config, key) in METRIC_CONFIG" 
            :key="key" 
            class="col-12 col-md-3"
        >
            <!-- CORREÇÃO: Tag do componente MetricCard fechada corretamente -->
            <MetricCard
                :title="config.title"
                :icon="config.icon"
                :is-time="config.isTime"
                
                :value="metrics[key] || 0"
                
                :growth-rate="metrics[`${key}_growth_rate`] || 0" 
            /> 
        </div>
    </template>
    
    <!-- Estado Vazio -->
    <div v-else class="col-12 text-center q-py-xl text-grey">
        Nenhuma métrica unitária disponível.
    </div>
  </div>
</template>

<script setup>
import MetricCard from './MetricCard.vue';
import { defineProps } from 'vue';

// --- 1. CONFIGURAÇÃO DE MÉTRICAS (Mapeamento Único) ---
const METRIC_CONFIG = {
    // Estas chaves devem corresponder EXATAMENTE ao que o backend retorna
    total_revenue: {
        title: 'Faturamento Total',
        icon: 'attach_money',
        isTime: false
    },
    average_ticket: {
        title: 'Ticket Médio',
        icon: 'receipt_long',
        isTime: false
    },
    total_sales: {
        title: 'Total de Pedidos',
        icon: 'shopping_bag',
        isTime: false
    },
    delivery_time_avg: {
        title: 'Tempo Médio de Entrega',
        icon: 'schedule',
        isTime: true
    },
};


// --- 2. PROPS (O que o App.vue envia) ---

defineProps({
    metrics: {
        type: Object,
        default: () => ({})
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});
</script>