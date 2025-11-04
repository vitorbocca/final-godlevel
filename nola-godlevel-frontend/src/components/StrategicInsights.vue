<template>
  <q-card flat bordered class="q-mt-xl">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">Análises Estratégicas</div>
      <p class="text-caption text-grey">Resultados de 8 métricas complexas para Rentabilidade, Logística, Marketing e Finanças.</p>
    </q-card-section>

    <!-- Estrutura de Abas (Tabs) -->
    <q-tabs
      v-model="tab"
      align="left"
      class="text-teal"
      indicator-color="primary"
      active-color="primary"
      dense
      inline-label
      outside-arrows
      mobile-arrows
    >
      <q-tab name="rentabilidade" icon="attach_money" label="Rentabilidade/Margem" />
      <q-tab name="logistica" icon="local_shipping" label="Logística (Tempo e Custo)" />
      <q-tab name="marketing" icon="campaign" label="Marketing/Captação" />
      <q-tab name="tendencia" icon="show_chart" label="Comportamento/Tendência" />
      <q-tab name="financas" icon="account_balance" label="Meios de Pagamento" />
    </q-tabs>

    <q-separator />

    <!-- Conteúdo das Abas (Tab Panels) -->
    <q-tab-panels v-model="tab" animated>
      
      <!-- 1. Rentabilidade (Margem Bruta) -->
      <q-tab-panel name="rentabilidade">
        <div class="text-h6 q-mb-md">Margem Bruta Estimada por Produto (Top 10)</div>
        <q-table
          v-if="topSellingProducts.length > 0"
          :rows="topSellingProducts"
          :columns="columnsMargem"
          row-key="product_name"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        >
          <template v-slot:body-cell-estimated_gross_margin_rate="props">
            <q-td :props="props">
              <!-- Alerta Visual: Se a margem for baixa (< 25%), fica vermelho -->
              <q-badge v-if="props.value != null && !isNaN(parseFloat(props.value))" :color="parseFloat(props.value) < 0.25 ? 'negative' : 'positive'" class="text-white">
                {{ formatPercent(props.value) }}
              </q-badge>
              <span v-else class="text-grey">-</span>
            </q-td>
          </template>
        </q-table>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <q-icon name="info" size="md" class="q-mb-sm" />
            <p>Sem dados de rentabilidade para o período selecionado.</p>
            <p class="text-caption">Selecione filtros e execute uma consulta no menu "Início".</p>
          </div>
        </q-card>
      </q-tab-panel>

      <!-- 2. Logística (MLD e Tempo) -->
      <q-tab-panel name="logistica">
        <!-- Margem Líquida de Delivery (MLD) -->
        <div class="text-h6 q-mb-sm">Margem Líquida de Delivery (MLD) por Tipo de Entregador</div>
        <q-table
          v-if="deliveryProfitability.length > 0"
          :rows="deliveryProfitability"
          :columns="columnsMLD"
          row-key="courier_type"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        >
          <template v-slot:body-cell-net_delivery_profit="props">
            <q-td :props="props">
              <span v-if="props.value != null && !isNaN(parseFloat(props.value))">
                {{ formatCurrency(props.value) }}
              </span>
              <span v-else class="text-grey">-</span>
            </q-td>
          </template>
          <template v-slot:body-cell-net_delivery_margin_rate="props">
            <q-td :props="props">
              <q-badge v-if="props.value != null && !isNaN(parseFloat(props.value))" :color="parseFloat(props.value) < 0 ? 'negative' : 'positive'" class="text-white">
                {{ formatPercent(props.value) }}
              </q-badge>
              <span v-else class="text-grey">-</span>
            </q-td>
          </template>
        </q-table>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2 q-mb-md">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de MLD para o período selecionado.</p>
          </div>
        </q-card>

        <q-separator class="q-my-md" />

        <!-- Performance de Entrega (Tempo) -->
        <div class="text-h6 q-mb-sm">Tempo Médio de Entrega por Tipo de Entregador</div>
        <q-table
          v-if="deliveryPerformance.length > 0"
          :rows="deliveryPerformance"
          :columns="columnsTempo"
          row-key="courier_type"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        >
          <template v-slot:body-cell-avg_delivery_time_seconds="props">
            <q-td :props="props">
              {{ props.value != null && !isNaN(parseFloat(props.value)) ? formatTime(props.value) : '-' }}
            </q-td>
          </template>
        </q-table>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de performance de entrega para o período selecionado.</p>
          </div>
        </q-card>
      </q-tab-panel>

      <!-- 3. Marketing/Captação -->
      <q-tab-panel name="marketing">
        <!-- Vendas por Origem de Cadastro -->
        <div class="text-h6 q-mb-md">Faturamento por Origem de Cadastro de Cliente</div>
        <q-table
          v-if="customerOrigin.length > 0"
          :rows="customerOrigin"
          :columns="columnsOrigem"
          row-key="origin_name"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        >
        </q-table>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2 q-mb-md">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de origem de cadastro para o período selecionado.</p>
          </div>
        </q-card>

        <q-separator class="q-my-md" />

        <!-- Efetividade do Desconto -->
        <div class="text-h6 q-mb-md">Vendas e Receita por Razão do Desconto</div>
        <q-table
          v-if="discountEffectiveness.length > 0"
          :rows="discountEffectiveness"
          :columns="columnsDesconto"
          row-key="reason"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        >
        </q-table>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de efetividade de desconto para o período selecionado.</p>
          </div>
        </q-card>
      </q-tab-panel>

      <!-- 4. Comportamento/Tendência -->
      <q-tab-panel name="tendencia">
        
        <!-- Ticket Médio por Dia da Semana (Gráfico 3) -->
        <div class="text-h6 q-mb-md">Ticket Médio por Dia da Semana (Comportamento de Gasto)</div>
        <q-card v-if="revenueByDay.length > 0" class="q-pa-md">
            <apexchart
              type="bar"
              height="300"
              :options="chartOptionsTicketMedio"
              :series="chartSeriesTicketMedio"
            ></apexchart>
        </q-card>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2 q-mb-md">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de ticket médio por dia da semana para o período selecionado.</p>
          </div>
        </q-card>

        <q-separator class="q-my-lg" />

        <!-- Crescimento (Gráfico 7) - Comparação Temporal (Visual Simples) -->
        <div class="text-h6 q-mb-md">Crescimento vs. Período Anterior (Comparação Temporal)</div>
        <q-card v-if="hasPeriodComparisonData" class="q-pa-md">
            <apexchart
              type="line"
              height="300"
              :options="chartOptionsCrescimento"
              :series="chartSeriesCrescimento"
            ></apexchart>
            <q-separator class="q-my-md" />
            <div class="text-subtitle1">Total de Faturamento</div>
            <p><strong>Período Atual:</strong> {{ formatCurrency(periodComparison.current.total_revenue || 0) }}</p>
            <p><strong>Período Anterior:</strong> {{ formatCurrency(periodComparison.previous.total_revenue || 0) }}</p>
            <div class="text-h5 q-mt-md" :class="getGrowthClass(periodComparison.current.total_revenue || 0, periodComparison.previous.total_revenue || 0)">
                Variação: {{ calculateGrowth(periodComparison.current.total_revenue || 0, periodComparison.previous.total_revenue || 0) }}
            </div>
        </q-card>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <q-icon name="info" size="md" class="q-mb-sm" />
            <p><strong>A métrica "Comparação Temporal" não está disponível no momento.</strong></p>
            <p class="text-caption q-mt-xs">Esta funcionalidade requer dados do período anterior que não estão sendo retornados pela API.</p>
            <p class="text-caption">Por favor, verifique se a métrica <code>period_comparison</code> está configurada no backend.</p>
          </div>
        </q-card>
        
        <q-separator class="q-my-lg" />

        <!-- Vendas Geográficas (Gráfico 8) -->
        <div class="text-h6 q-mb-md">Vendas por Localização Geográfica (Cidade)</div>
        <q-card v-if="geographicSales.length > 0" class="q-pa-md">
            <apexchart
              type="bar"
              height="300"
              :options="chartOptionsGeografia"
              :series="chartSeriesGeografia"
            ></apexchart>
            <q-separator class="q-my-md" />
            <q-table
                :rows="geographicSales"
                :columns="columnsGeografia"
                row-key="city"
                :pagination="{ rowsPerPage: 7 }"
                flat
                dense
            />
        </q-card>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <q-icon name="info" size="md" class="q-mb-sm" />
            <p><strong>A métrica "Vendas Geográficas" não está disponível no momento.</strong></p>
            <p class="text-caption q-mt-xs">A métrica <code>geographic_sales</code> não está sendo retornada pela API.</p>
            <p class="text-caption">Por favor, verifique se esta métrica está configurada no backend.</p>
          </div>
        </q-card>
        
      </q-tab-panel>

      <!-- 5. Finanças/Pagamentos -->
      <q-tab-panel name="financas">
        <!-- Meios de Pagamento (Gráfico 6) -->
        <div class="text-h6 q-mb-md">Distribuição de Faturamento por Meio de Pagamento</div>
        <q-card v-if="revenueByPayment.length > 0" class="q-pa-md">
            <apexchart
              type="pie"
              height="350"
              :options="chartOptionsPagamento"
              :series="chartSeriesPagamento"
            ></apexchart>
            <q-separator class="q-my-md" />
            <q-table
              :rows="revenueByPayment"
              :columns="columnsPagamento"
              row-key="payment_method"
              :pagination="{ rowsPerPage: 7 }"
              flat
              dense
            />
        </q-card>
        <q-card v-else flat bordered class="q-pa-md bg-grey-2">
          <div class="text-grey text-center q-py-md">
            <p>Sem dados de meios de pagamento para o período selecionado.</p>
          </div>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

// Debug: Log dos dados recebidos (reativo)
watchEffect(() => {
  console.log('StrategicInsights - Props recebidas:', {
    hasResults: !!props.results,
    resultsKeys: props.results ? Object.keys(props.results) : [],
    isLoading: props.isLoading,
    topSellingProductsSample: props.results?.top_selling_products,
    deliveryProfitabilitySample: props.results?.delivery_profitability
  });
});

const tab = ref('rentabilidade'); // Aba inicial

// --- FORMATADORES & LÓGICA DE CRESCIMENTO ---
const formatCurrency = (val) => {
  if (val == null || val === undefined || val === '') return 'R$ 0,00';
  const number = parseFloat(val);
  if (isNaN(number)) return 'R$ 0,00';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercent = (val) => {
  if (val == null || val === undefined || val === '') return '0.0%';
  const number = parseFloat(val);
  if (isNaN(number)) return '0.0%';
  // Se o número já está entre 0-100, assume que já é percentual
  // Se está entre 0-1, multiplica por 100
  if (number <= 1 && number >= -1) {
    return (number * 100).toFixed(1) + '%';
  }
  return number.toFixed(1) + '%';
};

const formatTime = (val) => {
    if (val == null || val === undefined || val === '') return '0 min';
    const value = parseFloat(val);
    if (isNaN(value)) return '0 min';
    
    // Se o valor está entre 1 e 120 (1 min a 2h), provavelmente já está em minutos
    // Valores maiores provavelmente estão em segundos (ex: 2100 seg = 35 min)
    if (value > 0 && value <= 120) {
        // Já está em minutos
        return `${Math.round(value)} min`;
    }
    // Está em segundos, converte para minutos
    const minutes = Math.round(value / 60);
    return `${minutes} min`;
};

const calculateGrowth = (current, previous) => {
    const curr = parseFloat(current) || 0;
    const prev = parseFloat(previous) || 0;
    if (prev === 0) return curr > 0 ? '+100.0%' : '0.0%';
    const growth = ((curr - prev) / prev) * 100;
    return (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
};

const getGrowthClass = (current, previous) => {
    const curr = parseFloat(current) || 0;
    const prev = parseFloat(previous) || 0;
    if (curr > prev) return 'text-positive';
    if (curr < prev) return 'text-negative';
    return 'text-grey';
};


// --- COMPUTED PROPS para extrair os dados do objeto results (MAPEAMENTO) ---

// Marketing/Captação
const customerOrigin = computed(() => {
  const items = props.results.customer_origin?.items || props.results.customer_origin || [];
  console.log('customerOrigin:', items);
  
  // Mapeamento de origens para português
  const originMap = {
    'pos': 'PDV (Ponto de Venda)',
    'balcony': 'Balcão',
    'Pos': 'PDV (Ponto de Venda)',
    'Balcony': 'Balcão',
    'POS': 'PDV (Ponto de Venda)',
    'BALCONY': 'Balcão'
  };
  
  return Array.isArray(items) ? items.map(item => ({
    ...item,
    origin_name: originMap[item.origin_name] || item.origin_name
  })) : [];
});

const discountEffectiveness = computed(() => {
  const items = props.results.discount_effectiveness?.items || props.results.discount_effectiveness || [];
  console.log('discountEffectiveness:', items);
  return Array.isArray(items) ? items : [];
});

// Rentabilidade/Logística
const topSellingProducts = computed(() => {
  const items = props.results.top_selling_products?.items || props.results.top_selling_products || [];
  console.log('topSellingProducts:', items);
  return Array.isArray(items) ? items : [];
});

const deliveryProfitability = computed(() => {
  const items = props.results.delivery_profitability?.items || props.results.delivery_profitability || [];
  console.log('deliveryProfitability:', items);
  return Array.isArray(items) ? items : [];
});

const deliveryPerformance = computed(() => {
  const items = props.results.delivery_performance?.items || props.results.delivery_performance || [];
  console.log('deliveryPerformance:', items);
  return Array.isArray(items) ? items : [];
});

// Finanças/Composição
const revenueByPayment = computed(() => {
  const items = props.results.revenue_by_payment?.items || props.results.revenue_by_payment || [];
  console.log('revenueByPayment:', items);
  return Array.isArray(items) ? items : [];
});

// Comportamento/Tendência
const revenueByDay = computed(() => {
  const items = props.results.revenue_by_day?.items || props.results.revenue_by_day || [];
  console.log('revenueByDay:', items);
  return Array.isArray(items) ? items : [];
});

const geographicSales = computed(() => {
  const items = props.results.geographic_sales?.items || props.results.geographic_sales || [];
  console.log('geographicSales:', items);
  return Array.isArray(items) ? items : [];
});


const periodComparison = computed(() => {
    // Tenta ambos os formatos: camelCase e snake_case
    // Também tenta variações comuns
    const results = props.results || {};
    const data = results.periodComparison || 
                 results.period_comparison || 
                 results.periodComparison || 
                 results.comparison || 
                 null;
    
    console.log('periodComparison - Todas as chaves em results:', Object.keys(results));
    console.log('periodComparison raw data:', data);
    console.log('periodComparison - data?.current:', data?.current);
    console.log('periodComparison - data?.previous:', data?.previous);
    
    // Tenta encontrar dados de comparação em outras estruturas
    if (!data) {
        // Talvez os dados estejam em outra estrutura
        console.log('periodComparison: No data found, procurando alternativas...');
        console.log('results keys:', Object.keys(results));
        
        // Tenta verificar se há dados de total_revenue que possam ser usados para comparação
        const dataKeys = Object.keys(results).filter(k => 
            k.includes('comparison') || 
            k.includes('period') || 
            k.includes('growth') ||
            k.includes('trend')
        );
        console.log('Chaves relacionadas a comparação/período:', dataKeys);
        
        return {
            current: { total_revenue: 0, total_sales: 0 },
            previous: { total_revenue: 0, total_sales: 0 }
        };
    }
    
    // Tenta diferentes estruturas de dados
    let current = data.current || data.current_period || {};
    let previous = data.previous || data.previous_period || {};
    
    // Se current e previous são arrays ou objetos com items
    if (Array.isArray(current)) {
        current = current[0] || {};
    }
    if (Array.isArray(previous)) {
        previous = previous[0] || {};
    }
    
    console.log('periodComparison processed - current:', current);
    console.log('periodComparison processed - previous:', previous);
    
    const currentRevenue = current.total_revenue || current.totalRevenue || 0;
    const previousRevenue = previous.total_revenue || previous.totalRevenue || 0;
    
    // DETECÇÃO AUTOMÁTICA: Verifica se os valores estão invertidos
    // Assumimos que o período atual geralmente tem valor maior ou igual ao anterior
    // Se o "current" tem valor menor que o "previous", provavelmente estão invertidos
    // Mas também verificamos se há datas ou outros indicadores
    
    let finalCurrent = current;
    let finalPrevious = previous;
    
    // Se o "current" tem valor significativamente menor que o "previous", 
    // provavelmente estão invertidos (exceto se houver redução real)
    // Vamos usar uma lógica mais conservadora: verificar se há campos de data
    const currentHasDate = current.start_date || current.end_date || current.date_from || current.date_to;
    const previousHasDate = previous.start_date || previous.end_date || previous.date_from || previous.date_to;
    
    if (currentHasDate && previousHasDate) {
        // Se temos datas, podemos compará-las
        const currentDate = current.end_date || current.date_to || current.start_date || current.date_from;
        const previousDate = previous.end_date || previous.date_to || previous.start_date || previous.date_from;
        if (currentDate && previousDate && new Date(currentDate) < new Date(previousDate)) {
            // Se a data do "current" é anterior à do "previous", estão invertidos
            finalCurrent = previous;
            finalPrevious = current;
            console.log('periodComparison - Datas detectadas: invertendo baseado em datas');
        }
    } else if (currentRevenue < previousRevenue && previousRevenue > 0) {
        // Se não temos datas, mas o "current" é menor, pode estar invertido
        // Mas isso pode ser uma redução real, então só invertemos se a diferença for muito grande
        const diff = ((previousRevenue - currentRevenue) / previousRevenue) * 100;
        if (diff > 50) {
            // Se a "redução" for maior que 50%, provavelmente está invertido
            finalCurrent = previous;
            finalPrevious = current;
            console.log('periodComparison - Invertendo baseado em diferença de valores (>50%)');
        }
    }
    
    return {
        current: {
            total_revenue: finalCurrent.total_revenue || finalCurrent.totalRevenue || 0,
            total_sales: finalCurrent.total_sales || finalCurrent.totalSales || 0
        },
        previous: {
            total_revenue: finalPrevious.total_revenue || finalPrevious.totalRevenue || 0,
            total_sales: finalPrevious.total_sales || finalPrevious.totalSales || 0
        }
    };
});

// Verifica se há dados válidos de comparação
const hasPeriodComparison = computed(() => {
    const pc = periodComparison.value;
    return pc && pc.current && pc.previous && 
           (pc.current.total_revenue > 0 || pc.previous.total_revenue > 0);
});

// Verifica se há dados reais (não apenas valores padrão zero)
const hasPeriodComparisonData = computed(() => {
    const pc = periodComparison.value;
    const prev = parseFloat(pc?.previous?.total_revenue) || 0;
    const curr = parseFloat(pc?.current?.total_revenue) || 0;
    // Só retorna true se pelo menos um dos valores for maior que zero
    // Isso evita mostrar o gráfico quando não há dados reais
    return (prev > 0 || curr > 0);
});


// --- COLUNAS DAS TABELAS (AQUI ESTÁ A CHAVE DE CORREÇÃO) ---

const columnsMargem = [
  { name: 'product_name', required: true, label: 'Produto', align: 'left', field: 'product_name', sortable: true },
  { name: 'total_quantity_sold', label: 'Qtd. Vendida', align: 'center', field: 'total_quantity_sold', sortable: true },
  { name: 'total_revenue', label: 'Receita (R$)', align: 'right', field: 'total_revenue', format: formatCurrency, sortable: true },
  { name: 'estimated_gross_profit', label: 'Lucro Bruto Est. (R$)', align: 'right', field: 'estimated_gross_profit', format: formatCurrency, sortable: true },
  { name: 'estimated_gross_margin_rate', label: 'Margem %', align: 'center', field: 'estimated_gross_margin_rate', format: formatPercent, sortable: true },
];

const columnsMLD = [
  { name: 'courier_type', required: true, label: 'Tipo de Entregador', align: 'left', field: 'courier_type', sortable: true },
  { name: 'total_deliveries', label: 'Entregas', align: 'center', field: 'total_deliveries' },
  { name: 'total_delivery_fees_collected', label: 'Taxa Cobrada (R$)', align: 'right', field: 'total_delivery_fees_collected', format: formatCurrency },
  { name: 'total_courier_costs', label: 'Custo Entregador (R$)', align: 'right', field: 'total_courier_costs', format: formatCurrency },
  { name: 'net_delivery_profit', label: 'MLD (R$)', align: 'right', field: 'net_delivery_profit', sortable: true },
  { name: 'net_delivery_margin_rate', label: 'Margem MLD %', align: 'center', field: 'net_delivery_margin_rate' },
];

const columnsTempo = [
  { name: 'courier_type', required: true, label: 'Tipo de Entregador', align: 'left', field: 'courier_type', sortable: true },
  { name: 'total_deliveries', label: 'Entregas', align: 'center', field: 'total_deliveries' },
  { name: 'avg_delivery_time_seconds', label: 'Tempo Médio', align: 'center', field: 'avg_delivery_time_seconds', format: formatTime, sortable: true },
];

const columnsOrigem = [
  { name: 'origin_name', required: true, label: 'Origem de Cadastro', align: 'left', field: 'origin_name', sortable: true },
  { name: 'total_sales', label: 'Vendas', align: 'center', field: 'total_sales' },
  { name: 'average_ticket', label: 'Ticket Médio (R$)', align: 'right', field: 'average_ticket', format: formatCurrency, sortable: true },
  { name: 'total_revenue', label: 'Faturamento (R$)', align: 'right', field: 'total_revenue', format: formatCurrency, sortable: true },
];

const columnsDesconto = [
  { name: 'reason', required: true, label: 'Razão do Desconto', align: 'left', field: 'reason', sortable: true },
  { name: 'total_sales', label: 'Qtd. Vendas', align: 'center', field: 'total_sales' },
  { name: 'total_discount_given', label: 'Desc. Total (R$)', align: 'right', field: 'total_discount_given', format: formatCurrency },
  { name: 'total_revenue_after_discount', label: 'Receita Líquida (R$)', align: 'right', field: 'total_revenue_after_discount', format: formatCurrency, sortable: true },
];

const columnsPagamento = [
  { name: 'payment_method', required: true, label: 'Meio de Pagamento', align: 'left', field: 'payment_method', sortable: true },
  { name: 'total_transactions', label: 'Transações', align: 'center', field: 'total_transactions' },
  { name: 'total_value_paid', label: 'Valor Total (R$)', align: 'right', field: 'total_value_paid', format: formatCurrency, sortable: true },
];

const columnsTMDay = [
  { name: 'day_name', required: true, label: 'Dia da Semana', align: 'left', field: 'day_name', sortable: true },
  { name: 'average_ticket', label: 'Ticket Médio (R$)', align: 'right', field: 'average_ticket', format: formatCurrency, sortable: true },
  { name: 'total_sales_count', label: 'Qtd. Pedidos', align: 'center', field: 'total_sales_count' },
];

const columnsGeografia = [
  { name: 'city', required: true, label: 'Cidade', align: 'left', field: 'city', sortable: true },
  { name: 'total_sales', label: 'Total Pedidos', align: 'center', field: 'total_sales' },
  { name: 'average_ticket', label: 'Ticket Médio (R$)', align: 'right', field: 'average_ticket', format: formatCurrency, sortable: true },
  { name: 'total_revenue', label: 'Faturamento (R$)', align: 'right', field: 'total_revenue', format: formatCurrency, sortable: true },
];

// --- CONFIGURAÇÕES DOS GRÁFICOS (ApexCharts) ---

// Gráfico 1: Ticket Médio por Dia da Semana
const chartSeriesTicketMedio = computed(() => [{
  name: 'Ticket Médio (R$)',
  data: revenueByDay.value.map(item => parseFloat(item.average_ticket) || 0)
}]);

const chartOptionsTicketMedio = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  xaxis: {
    categories: revenueByDay.value.map(item => item.day_name || 'N/A'),
    title: { text: 'Dia da Semana' }
  },
  yaxis: {
    title: { text: 'Ticket Médio (R$)' },
    labels: {
      formatter: (val) => formatCurrency(val)
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => formatCurrency(val)
  },
  colors: ['#1976d2'],
  title: {
    text: 'Ticket Médio por Dia da Semana',
    align: 'center'
  }
}));

// Gráfico 2: Crescimento vs Período Anterior
const chartSeriesCrescimento = computed(() => {
  const pc = periodComparison.value;
  // Usando os valores já corrigidos no periodComparison computed
  const prev = parseFloat(pc.previous?.total_revenue) || 0;
  const curr = parseFloat(pc.current?.total_revenue) || 0;
  console.log('chartSeriesCrescimento - periodComparison.value:', pc);
  console.log('chartSeriesCrescimento - prev:', prev, 'curr:', curr);
  return [{
    name: 'Faturamento (R$)',
    data: [prev, curr]
  }];
});

const chartOptionsCrescimento = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false }
  },
  xaxis: {
    categories: ['Período Anterior', 'Período Atual']
  },
  yaxis: {
    title: { text: 'Faturamento (R$)' },
    min: 0,
    labels: {
      formatter: (val) => formatCurrency(val)
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => formatCurrency(val)
  },
  colors: ['#26a69a'],
  stroke: {
    width: 3,
    curve: 'smooth'
  },
  markers: {
    size: 6
  },
  title: {
    text: 'Crescimento vs. Período Anterior',
    align: 'center'
  }
}));

// Gráfico 3: Vendas Geográficas
const chartSeriesGeografia = computed(() => {
  const data = geographicSales.value.map(item => parseFloat(item.total_revenue) || 0);
  console.log('chartSeriesGeografia data:', data);
  console.log('geographicSales.value:', geographicSales.value);
  return [{
    name: 'Faturamento (R$)',
    data: data
  }];
});

const chartOptionsGeografia = computed(() => {
  const categories = geographicSales.value.map(item => item.city || 'N/A');
  console.log('chartOptionsGeografia categories:', categories);
  return {
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  xaxis: {
    categories: categories,
    title: { text: 'Cidade' }
  },
  yaxis: {
    title: { text: 'Faturamento (R$)' },
    labels: {
      formatter: (val) => formatCurrency(val)
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => formatCurrency(val)
  },
  colors: ['#42a5f5'],
  title: {
    text: 'Vendas por Localização Geográfica',
    align: 'center'
  }
  };
});

// Gráfico 4: Meios de Pagamento (Pizza)
const chartSeriesPagamento = computed(() => 
  revenueByPayment.value.map(item => parseFloat(item.total_value_paid) || 0)
);

const chartOptionsPagamento = computed(() => ({
  chart: {
    type: 'pie',
    toolbar: { show: false }
  },
  labels: revenueByPayment.value.map(item => item.payment_method || 'N/A'),
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      const value = chartSeriesPagamento.value[opts.seriesIndex];
      return formatCurrency(value);
    }
  },
  colors: ['#1976d2', '#26a69a', '#ffa726', '#ef5350', '#ab47bc', '#42a5f5'],
  title: {
    text: 'Distribuição por Meio de Pagamento',
    align: 'center'
  },
  legend: {
    position: 'bottom'
  },
  tooltip: {
    y: {
      formatter: (val) => formatCurrency(val)
    }
  }
}));

</script>
