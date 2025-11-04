<template>
  <q-page padding>
    <div class="q-pa-md">
      
      <HeaderFilters @update-filters="handleFiltersUpdate" />

      <h3 class="q-mt-lg">Resultados da Análise Dinâmica</h3>

      <div v-if="isLoading" class="q-my-lg text-center text-primary">
        <q-spinner-dots size="lg" color="primary" />
        <p class="q-mt-sm">Carregando dados com o agrupamento: {{ currentFilters.groupByDimension || 'Total' }}...</p>
      </div>

      <q-card v-else-if="queryResults && queryResults.data && queryResults.data.length > 0" class="q-mt-md">
        <q-card-section>
          <q-table
            :rows="queryResults.data"
            :columns="dynamicColumns"
            row-key="id"
            flat
            bordered
            title="Dados Agrupados"
          />
          
          <div v-if="queryResults.churn_risk_customers" class="q-mt-lg">
            <h4>Clientes em Risco de Churn (Métrica Complexa)</h4>
            <pre>{{ queryResults.churn_risk_customers }}</pre>
          </div>
          
        </q-card-section>
      </q-card>
      
      <q-card v-else class="q-mt-md q-pa-lg text-center text-grey">
        Nenhum dado encontrado ou filtros não aplicados.
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import HeaderFilters from './HeaderFilters.vue';
import { queryMetrics } from '../services/api'; 
// OBS: Ajuste o path acima para onde seu api.js está!

// --- ESTADO ---
const isLoading = ref(false);
const currentFilters = ref({});
const queryResults = ref(null);

// --- FUNÇÕES AUXILIARES ---

// Mapeamento para nomes de colunas (idealmente viria do backend)
const DIMENSION_MAP = {
  store_id: 'Loja ID',
  channel_id: 'Canal de Venda',
  day_of_week: 'Dia da Semana',
  product_name: 'Produto',
  // ...
};

// Gera colunas dinamicamente para a q-table
const dynamicColumns = computed(() => {
  if (!queryResults.value || !queryResults.value.data || queryResults.value.data.length === 0) {
    return [];
  }
  
  const sampleRow = queryResults.value.data[0];
  const columns = [];
  const groupBy = currentFilters.value.groupByDimension;
  
  // 1. Coluna de Agrupamento
  if (groupBy) {
    columns.push({
      name: groupBy,
      label: DIMENSION_MAP[groupBy] || groupBy.toUpperCase(),
      field: groupBy,
      align: 'left',
      sortable: true
    });
  } else {
    // Se não houver agrupamento, adiciona a coluna "Total"
    columns.push({
      name: 'Total',
      label: 'Total Geral',
      field: queryResults.value.data.map(r => Object.keys(r)).flat().find(k => k !== groupBy) || 'total',
      align: 'left',
      sortable: false
    });
  }

  // 2. Colunas das Métricas (assume que a primeira métrica é a chave)
  Object.keys(sampleRow).forEach(key => {
    if (key !== groupBy) {
      columns.push({
        name: key,
        label: key.replace(/_/g, ' ').toUpperCase(), // Formato BÁSICO do nome da métrica
        field: key,
        align: 'right',
        sortable: true,
        format: (val) => typeof val === 'number' ? `R$ ${val.toFixed(2).replace('.', ',')}` : val
      });
    }
  });

  return columns;
});


// --- LÓGICA PRINCIPAL ---

// 1. Recebe os filtros do HeaderFilters
const handleFiltersUpdate = (newFilters) => {
  currentFilters.value = newFilters;
  executeDynamicQuery();
};

// 2. Dispara a query para o backend
const executeDynamicQuery = async () => {
  if (isLoading.value) return; 

  isLoading.value = true;
  
  const { stores, channels, period, groupByDimension } = currentFilters.value;

  try {
    // IMPORTANTE: Aqui você define as métricas que quer buscar.
    // Você pode buscar uma métrica simples (revenue) e uma complexa (churn) de uma vez!
    const metricIds = ['total_revenue', 'churn_risk_customers']; 

    // CHAMA O API.JS com o novo parâmetro groupByDimension
    const results = await queryMetrics(
      metricIds, 
      { stores, channels, period }, 
      groupByDimension
    );
    
    queryResults.value = results;

  } catch (error) {
    console.error('Falha ao executar query dinâmica:', error);
    queryResults.value = null;
  } finally {
    isLoading.value = false;
  }
};
</script>