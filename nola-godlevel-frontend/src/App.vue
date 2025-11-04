<template>
  <!-- Estrutura de Layout do Quasar (Adiciona Header e Drawer) -->
  <q-layout view="lHh LpR lFf" class="bg-grey-1">

    <!-- Header (Topo) -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" aria-label="Menu" />
        
        <q-toolbar-title>
          <div class="row items-center q-gutter-x-sm">
             <q-icon name="mdi-chart-timeline-variant" size="sm" />
             <span>Dashboard GodLevel - Analytics Builder</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Menu Lateral (Drawer) -->
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list separator>
        
        <q-item-label header class="text-h6 text-weight-bold text-primary">
          Menu de Análise
        </q-item-label>

        <!-- Link 1: Início (Visão Geral e Cartões) -->
        <q-item clickable :active="currentView === 'inicio'" @click="changeView('inicio')" active-class="bg-blue-1 text-primary">
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>
          <q-item-section>
            Início (Visão Geral)
          </q-item-section>
        </q-item>

        <!-- Link 2: Gráficos (Análises Profundas) -->
        <q-item clickable :active="currentView === 'graficos'" @click="changeView('graficos')" active-class="bg-blue-1 text-primary">
          <q-item-section avatar>
            <q-icon name="mdi-chart-bar" />
          </q-item-section>
          <q-item-section>
            Gráficos e Insights
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- Conteúdo Principal da Página -->
    <q-page-container>
      <q-page padding class="container q-pa-md">
        
        <!-- Componente de Filtros (Sempre visível no topo da página) -->
        <HeaderFilters @update-filters="handleFiltersUpdate" class="q-mb-md" />

        <!-- --------------------------------- -->
        <!-- RENDERIZAÇÃO DE ESTADO/CONTEÚDO -->
        <!-- --------------------------------- -->
        
        <!-- Estado 1: Loading -->
        <div v-if="isLoading" class="q-pa-xl text-center text-primary q-mt-xl">
            <q-spinner-gears size="lg" color="primary" />
            <p class="q-mt-md">Executando Consulta Otimizada...</p>
        </div>

        <!-- Estado 2: Conteúdo Vazio / Erro -->
        <q-card v-else-if="!queryResults.data" flat bordered class="q-pa-xl text-center text-grey q-mt-xl">
            Sem resultados para os filtros e métricas selecionadas.
        </q-card>
        
        <!-- Estado 3: Conteúdo Principal (Quando há dados) -->
        <div v-else>
          
          <!-- View 1: Início (Visão Geral e Cartões) - O seu conteúdo original -->
          <div v-show="currentView === 'inicio'">
            
            <div style="margin: 16px 0; display:flex; align-items:center; gap:12px;">
              <div class="title text-h6 text-weight-bold">Visão Geral & Agregados</div>
            </div>

            <!-- Cartões de Métrica -->
            <UnitMetricsSection :metrics="topAggregates" :is-loading="isLoading" />
            
            <q-separator class="q-my-lg" />
            
            <!-- Tabela Dinâmica (Explorador) -->
            <div v-show="queryResults.data && queryResults.data.length > 0">
              <h5 class="q-mb-md">Análise Dinâmica: {{ getAnalysisTitle() }}</h5>
              
              <!-- Agrupar por Dimensão -->
              <div class="row items-center q-gutter-xs q-mb-md">
                <q-select
                  v-model="selectedGroupBy"
                  :options="dimensionOptions"
                  label="Agrupar por Dimensão"
                  dense
                  emit-value
                  map-options
                  clearable
                  class="col-12 col-md-4"
                  @update:model-value="handleGroupByChange"
                />
                <q-icon name="info" size="sm" color="primary" class="cursor-help">
                  <q-tooltip class="bg-grey-9" :offset="[10, 10]">
                    <div class="text-caption">
                      <strong>Agrupar por Dimensão:</strong><br/>
                      Agrupa os dados por Loja, Canal de Venda, Dia da Semana ou Hora do Dia. Os totais nos cartões somam todos os grupos.
                    </div>
                  </q-tooltip>
                </q-icon>
              </div>
              
              <q-table
                  title="Dados Agrupados (Explorador)"
                  :rows="queryResults.data"
                  :columns="dynamicColumns"
                  row-key="key_id"
                  :pagination="{ rowsPerPage: 7 }"
                  flat
                  bordered
                  separator="cell"
                  class="q-mt-md"
              />
            </div>

            <!-- Componente de Churn (Sempre importante no Início) -->
             <q-card v-if="queryResults.churn_risk_customers && queryResults.churn_risk_customers.items.length > 0" class="q-mt-xl bg-red-1">
               <q-card-section>
                   <div class="text-h6 text-negative">🚨 Clientes em Risco de Churn ({{ queryResults.churn_risk_customers.items.length }} encontrados)</div>
               </q-card-section>
               <q-card-section class="q-pt-none">
                   <q-list bordered separator>
                        <q-item v-for="c in queryResults.churn_risk_customers.items" :key="c.customer_id">
                            <q-item-section>
                                <!-- CORREÇÃO APLICADA AQUI: Usa customer_id se o nome for nulo -->
                                <q-item-label>{{ c.customer_name || `Cliente ID: ${c.customer_id}` }}</q-item-label>
                                <q-item-label caption>
                                    Fez {{ c.total_sales_count }} compras | Sumido há {{ c.days_since_last_purchase }} dias
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="negative">R$ {{ parseFloat(c.customer_average_ticket).toFixed(2) }}</q-badge>
                            </q-item-section>
                        </q-item>
                    </q-list>
               </q-card-section>
             </q-card>
          </div>

          <!-- View 2: Gráficos e Insights Avançados (Novo) -->
          <div v-show="currentView === 'graficos'">
            <!-- CORRIGIDO PARA O NOVO NOME -->
            <StrategicInsights :results="queryResults" :is-loading="isLoading" /> 
          </div>
        
        </div>
        

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { queryMetrics, fetchChannels, fetchStores } from './services/api.js'; 
import HeaderFilters from './components/HeaderFilters.vue';
import UnitMetricsSection from './components/UnitMetricsSection.vue';
import StrategicInsights from './components/StrategicInsights.vue'; // CORRIGIDO O NOME AQUI
import moment from 'moment';

const leftDrawerOpen = ref(false);
const currentView = ref('inicio'); // Inicia na Visão Geral

// --- FUNÇÕES DE LAYOUT E NAVEGAÇÃO ---
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const changeView = (viewName) => {
  currentView.value = viewName;
  leftDrawerOpen.value = false; // Fecha no mobile
};


// --- ESTADO CENTRAL (Mantido) ---
const isLoading = ref(false);
const currentFilters = ref({});
const queryResults = ref({});
const selectedGroupBy = ref(null);

// Mapeamentos para converter IDs em nomes
const channelsMap = ref({});
const storesMap = ref({});

// Carregar canais e lojas para mapeamento
onMounted(async () => {
    try {
        const [channels, stores] = await Promise.all([
            fetchChannels(),
            fetchStores()
        ]);
        
        // Criar mapeamento ID -> Nome
        channelsMap.value = channels.reduce((acc, channel) => {
            acc[channel.value] = channel.label;
            return acc;
        }, {});
        
        storesMap.value = stores.reduce((acc, store) => {
            acc[store.value] = store.label;
            return acc;
        }, {});
    } catch (error) {
        console.error('Erro ao carregar canais/lojas para mapeamento:', error);
    }
}); 

const TOP_METRICS_IDS = ['total_revenue', 'average_ticket', 'total_sales', 'delivery_time_avg']; 
const INSIGHT_METRICS_IDS = [
    'churn_risk_customers', 'top_selling_products', 'delivery_profitability', 'delivery_performance', 
    'customer_origin', 'discount_effectiveness', 'revenue_by_payment', 'geographic_sales', 
    'revenue_by_hour', 'revenue_by_day', 'sales_by_channel', 'period_comparison' 
]; 
const METRIC_FOR_DYNAMIC_TABLE = 'total_revenue'; 

const DIMENSION_MAP_NAMES = {
    store_id: 'Loja', 
    channel_id: 'Canal', 
    day_of_week: 'Dia da Semana', 
    hour_of_day: 'Hora do Dia',
    product_name: 'Produto', 
    product_id: 'Produto',
    city: 'Cidade (Geografia)'
};

const dimensionOptions = [
  { label: 'Nenhum Agrupamento (Total)', value: null },
  { label: 'Loja', value: 'store_id' },
  { label: 'Canal de Venda', value: 'channel_id' },
  { label: 'Dia da Semana', value: 'day_of_week' },
  { label: 'Hora do Dia', value: 'hour_of_day' },
];


// --- LÓGICA DE DADOS (Mantida) ---

const topAggregates = computed(() => {
    const data = queryResults.value.data || [];
    const groupBy = currentFilters.value.groupByDimension;
    
    // Se não há agrupamento, pegar o primeiro item (total geral)
    if (!groupBy || data.length === 0) {
        const totalsRow = data.length > 0 ? data[0] : {};
        
        return TOP_METRICS_IDS.reduce((acc, id) => {
            const rawValue = totalsRow[id];
            acc[id] = rawValue !== undefined && rawValue !== null ? Number(rawValue) : 0;
            
            // Simulação de Growth Rate
            if (id === 'total_revenue') acc.total_revenue_growth_rate = 0.15;
            if (id === 'average_ticket') acc.average_average_ticket_growth_rate = -0.02;
            
            return acc;
        }, {});
    }
    
    // Se há agrupamento, calcular totais somando todos os grupos
    const aggregated = TOP_METRICS_IDS.reduce((acc, id) => {
        if (id === 'total_revenue') {
            // Soma total de faturamento de todos os grupos
            acc[id] = data.reduce((sum, row) => {
                const val = Number(row[id]) || 0;
                return sum + val;
            }, 0);
        } else if (id === 'total_sales') {
            // Soma total de pedidos de todos os grupos
            acc[id] = data.reduce((sum, row) => {
                const val = Number(row[id]) || 0;
                return sum + val;
            }, 0);
        } else if (id === 'average_ticket') {
            // Ticket médio geral = faturamento total / total de pedidos
            const totalRevenue = data.reduce((sum, row) => sum + (Number(row.total_revenue) || 0), 0);
            const totalSales = data.reduce((sum, row) => sum + (Number(row.total_sales) || 0), 0);
            acc[id] = totalSales > 0 ? totalRevenue / totalSales : 0;
        } else if (id === 'delivery_time_avg') {
            // Tempo médio ponderado por número de pedidos
            let totalWeightedTime = 0;
            let totalWeight = 0;
            data.forEach(row => {
                const time = Number(row[id]) || 0;
                const sales = Number(row.total_sales) || 0;
                if (time > 0 && sales > 0) {
                    totalWeightedTime += time * sales;
                    totalWeight += sales;
                }
            });
            acc[id] = totalWeight > 0 ? totalWeightedTime / totalWeight : 0;
        } else {
            // Para outras métricas, somar normalmente
            acc[id] = data.reduce((sum, row) => {
                const val = Number(row[id]) || 0;
                return sum + val;
            }, 0);
        }
        
        // Simulação de Growth Rate
        if (id === 'total_revenue') acc.total_revenue_growth_rate = 0.15;
        if (id === 'average_ticket') acc.average_average_ticket_growth_rate = -0.02;
        
        return acc;
    }, {});
    
    return aggregated;
});


const dynamicColumns = computed(() => {
    const data = queryResults.value.data;
    const groupBy = currentFilters.value.groupByDimension;
    
    if (!data || data.length === 0) return [];
    
    const columns = [];
    
    if (groupBy) {
        // Função para formatar o valor da dimensão
        const formatDimensionValue = (val) => {
            if (groupBy === 'day_of_week') {
                const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                return days[val] || val;
            }
            if (groupBy === 'hour_of_day') {
                // Formatar hora: 0 -> "00:00", 5 -> "05:00", 14 -> "14:00"
                const hour = String(val).padStart(2, '0');
                return `${hour}:00`;
            }
            if (groupBy === 'channel_id') {
                // Converter ID do canal para nome
                return channelsMap.value[val] || `Canal ${val}`;
            }
            if (groupBy === 'store_id') {
                // Converter ID da loja para nome
                // Garantir que val seja tratado como número para comparação
                const storeId = Number(val);
                const storeName = storesMap.value[storeId] || storesMap.value[val];
                return storeName || `Loja ${val}`;
            }
            return val;
        };
        
        columns.push({
            name: groupBy,
            label: DIMENSION_MAP_NAMES[groupBy] || groupBy.toUpperCase(),
            field: groupBy,
            align: 'left',
            sortable: true,
            format: formatDimensionValue,
            // Para hora do dia, garantir ordenação numérica (não alfabética)
            sort: groupBy === 'hour_of_day' ? (a, b) => Number(a) - Number(b) : undefined
        });
    }

    const metricKey = METRIC_FOR_DYNAMIC_TABLE;

    columns.push({
        name: metricKey,
        label: metricKey.replace(/_/g, ' ').toUpperCase(),
        field: metricKey,
        align: 'right',
        sortable: true,
        format: (val) => formatCurrency(val)
    });

    return columns;
});


const getAnalysisTitle = () => {
    const dimName = currentFilters.value.groupByDimension ? DIMENSION_MAP_NAMES[currentFilters.value.groupByDimension] : '';
    
    // Mapear nomes de métricas para nomes amigáveis
    const metricNameMap = {
        'total_revenue': 'Faturamento',
        'total_sales': 'Total de Pedidos',
        'average_ticket': 'Ticket Médio'
    };
    const metricName = metricNameMap[METRIC_FOR_DYNAMIC_TABLE] || METRIC_FOR_DYNAMIC_TABLE.replace(/_/g, ' ').toUpperCase();
    
    if (currentFilters.value.groupByDimension) {
        return `Tendência de ${metricName} Agrupada por ${dimName}`;
    }
    // CORRIGIDO: Retorna o título base sem quebrar
    return `Visão Geral de ${metricName} (Total do Período)`; 
};

const formatCurrency = (val) => {
    const number = parseFloat(val);
    if (isNaN(number)) return 'R$ 0,00';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


// --- LÓGICA DE COMUNICAÇÃO ---

const handleFiltersUpdate = (newFilters) => {
    currentFilters.value = { ...newFilters, groupByDimension: selectedGroupBy.value };
    executeDynamicQuery();
};

const handleGroupByChange = (value) => {
    selectedGroupBy.value = value;
    currentFilters.value.groupByDimension = value;
    executeDynamicQuery();
};

const executeDynamicQuery = async () => {
    if (isLoading.value) return; 
    isLoading.value = true;
    
    const { stores, channels, subBrands, period } = currentFilters.value;
    const groupByDimension = selectedGroupBy.value || null;

    try {
        const metricIds = [...TOP_METRICS_IDS, METRIC_FOR_DYNAMIC_TABLE, ...INSIGHT_METRICS_IDS]; 

        const results = await queryMetrics(
            metricIds, 
            { stores, channels, subBrands, period }, 
            groupByDimension
        );
        
        // Debug: log quando há agrupamento
        if (groupByDimension) {
            console.log('🔍 Frontend - Agrupamento aplicado:', {
                dimension: groupByDimension,
                results: results,
                dataLength: results?.data?.length,
                sampleData: results?.data?.slice(0, 3),
                storesMap: groupByDimension === 'store_id' ? storesMap.value : undefined,
                channelsMap: groupByDimension === 'channel_id' ? channelsMap.value : undefined
            });
        }
        
        queryResults.value = results;

    } catch (error) {
        console.error('Falha ao executar query dinâmica:', error);
    } finally {
        isLoading.value = false;
    }
};

</script>

<style scoped>
/* Estilos mantidos no escopo */
.container {
  max-width: 1400px;
  margin: 0 auto;
}
.title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f1f1f;
}
</style>
