<template>
  <q-card flat bordered class="q-mt-xl">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">Insights Estratégicos Acionáveis (GodLevel)</div>
      <p class="text-caption text-grey">Análises detalhadas de Rentabilidade, Logística, Marketing e Estoque.</p>
    </q-card-section>

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
      <q-tab name="rentabilidade" icon="mdi-finance" label="Rentabilidade/Margem" />
      <q-tab name="logistica" icon="mdi-truck-fast-outline" label="Logística (Custo e Tempo)" />
      <q-tab name="marketing" icon="mdi-bullhorn-outline" label="Marketing/Captação" />
      <q-tab name="estoque" icon="mdi-food-variant" label="Estoque (Complementos)" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>

      <q-tab-panel name="rentabilidade">
        <div class="text-h6 q-mb-md">Margem Bruta Estimada por Produto (Top 10)</div>
        <q-table
          v-if="topSellingProducts && topSellingProducts.length > 0"
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
              <q-badge :color="props.value < 0.2 ? 'negative' : 'positive'" class="text-white">
                {{ formatPercent(props.value) }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
        <div v-else class="text-grey q-py-md">Sem dados de rentabilidade para o período.</div>
      </q-tab-panel>

      <q-tab-panel name="logistica">
        <div class="text-h6 q-mb-sm">Margem Líquida de Delivery (MLD) por Tipo de Entregador</div>
        <q-table
          v-if="deliveryProfitability && deliveryProfitability.length > 0"
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
              <q-badge :color="props.value < 0 ? 'negative' : 'positive'">
                {{ formatCurrency(props.value) }}
              </q-badge>
            </q-td>
          </template>
        </q-table>

        <q-separator class="q-my-md" />

        <div class="text-h6 q-mb-sm">Tempo Médio de Entrega por Tipo de Entregador</div>
        <q-table
          v-if="deliveryPerformance && deliveryPerformance.length > 0"
          :rows="deliveryPerformance"
          :columns="columnsTempo"
          row-key="courier_type"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        />
      </q-tab-panel>

      <q-tab-panel name="marketing">
        <div class="text-h6 q-mb-md">Faturamento por Origem de Cadastro de Cliente</div>
        <q-table
          v-if="customerOrigin && customerOrigin.length > 0"
          :rows="customerOrigin"
          :columns="columnsOrigem"
          row-key="origin_name"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        />

        <q-separator class="q-my-md" />

        <div class="text-h6 q-mb-md">Vendas e Receita por Razão do Desconto</div>
        <q-table
          v-if="discountEffectiveness && discountEffectiveness.length > 0"
          :rows="discountEffectiveness"
          :columns="columnsDesconto"
          row-key="reason"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
        />
      </q-tab-panel>

      <q-tab-panel name="estoque">
        <div class="text-h6 q-mb-md">Saída Total de Complementos (Estoque Operacional)</div>
        <q-table
          v-if="topSellingItems && topSellingItems.length > 0"
          :rows="topSellingItems"
          :columns="columnsItens"
          row-key="item_name"
          :pagination="{ rowsPerPage: 7 }"
          flat
          bordered
          separator="cell"
          class="q-mb-lg"
        >
          <template v-slot:bottom>
              <div class="q-pa-md text-caption text-blue-grey">
                *Esta análise rastreia a saída de itens vendidos como adicionais (Ex: Adicional de Queijo, Nugget extra) e é crucial para gestão de estoque de complementos.
              </div>
          </template>
        </q-table>
        <div v-else class="text-grey q-py-md">Sem dados de itens de complemento para o período.</div>
      </q-tab-panel>

    </q-tab-panels>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const tab = ref('rentabilidade');

// --- FORMATADORES ---
const formatCurrency = (val) => {
  const number = parseFloat(val);
  if (isNaN(number)) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercent = (val) => {
  const number = parseFloat(val);
  if (isNaN(number)) return '';
  return (number * 100).toFixed(1) + '%';
};

const formatTime = (val) => {
  const seconds = parseFloat(val);
  if (isNaN(seconds)) return '';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

// --- COMPUTED PROPS para extrair os dados do objeto results ---

// 1. Margem Bruta
const topSellingProducts = computed(() => props.results.top_selling_products?.items || []);

// 2. Logística
const deliveryProfitability = computed(() => props.results.delivery_profitability?.items || []);
const deliveryPerformance = computed(() => props.results.delivery_performance?.items || []);

// 3. Marketing
const customerOrigin = computed(() => props.results.customer_origin?.items || []);
const discountEffectiveness = computed(() => props.results.discount_effectiveness?.items || []);

// 4. Estoque
const topSellingItems = computed(() => props.results.top_selling_items?.items || []);


// --- COLUNAS DAS TABELAS ---

// Margem Bruta (Rentabilidade)
const columnsMargem = [
  { name: 'product_name', required: true, label: 'Produto', align: 'left', field: 'product_name', sortable: true },
  { name: 'total_quantity_sold', label: 'Qtd. Vendida', align: 'center', field: 'total_quantity_sold', sortable: true },
  { name: 'total_revenue', label: 'Receita Bruta (R$)', align: 'right', field: 'total_revenue', sortable: true, format: formatCurrency },
  { name: 'estimated_gross_profit', label: 'Lucro Bruto Est. (R$)', align: 'right', field: 'estimated_gross_profit', sortable: true, format: formatCurrency },
  { name: 'estimated_gross_margin_rate', label: 'Margem %', align: 'center', field: 'estimated_gross_margin_rate', sortable: true }, // Formato especial no slot
];

// Logística - MLD
const columnsMLD = [
  { name: 'courier_type', required: true, label: 'Tipo de Entregador', align: 'left', field: 'courier_type', sortable: true },
  { name: 'total_deliveries', label: 'Entregas', align: 'center', field: 'total_deliveries', sortable: true },
  { name: 'total_delivery_fees_collected', label: 'Taxa Cobrada (R$)', align: 'right', field: 'total_delivery_fees_collected', format: formatCurrency },
  { name: 'total_courier_costs', label: 'Custo Entregador (R$)', align: 'right', field: 'total_courier_costs', format: formatCurrency },
  { name: 'net_delivery_profit', label: 'MLD (R$)', align: 'right', field: 'net_delivery_profit', sortable: true }, // Formato especial no slot
  { name: 'net_delivery_margin_rate', label: 'Margem MLD %', align: 'center', field: 'net_delivery_margin_rate', format: formatPercent },
];

// Logística - Tempo
const columnsTempo = [
  { name: 'courier_type', required: true, label: 'Tipo de Entregador', align: 'left', field: 'courier_type', sortable: true },
  { name: 'total_deliveries', label: 'Entregas', align: 'center', field: 'total_deliveries' },
  { name: 'avg_delivery_time_seconds', label: 'Tempo Médio', align: 'center', field: 'avg_delivery_time_seconds', format: formatTime, sortable: true },
];

// Marketing - Origem
const columnsOrigem = [
  { name: 'origin_name', required: true, label: 'Origem de Cadastro', align: 'left', field: 'origin_name', sortable: true },
  { name: 'total_sales', label: 'Vendas', align: 'center', field: 'total_sales', sortable: true },
  { name: 'average_ticket', label: 'Ticket Médio (R$)', align: 'right', field: 'average_ticket', format: formatCurrency, sortable: true },
  { name: 'total_revenue', label: 'Faturamento (R$)', align: 'right', field: 'total_revenue', format: formatCurrency, sortable: true },
];

// Marketing - Desconto
const columnsDesconto = [
  { name: 'reason', required: true, label: 'Razão do Desconto', align: 'left', field: 'reason', sortable: true },
  { name: 'total_sales', label: 'Qtd. Vendas', align: 'center', field: 'total_sales', sortable: true },
  { name: 'total_discount_given', label: 'Desc. Total Concedido (R$)', align: 'right', field: 'total_discount_given', format: formatCurrency },
  { name: 'total_revenue_after_discount', label: 'Receita Líquida (R$)', align: 'right', field: 'total_revenue_after_discount', format: formatCurrency, sortable: true },
];

// Estoque
const columnsItens = [
  { name: 'item_name', required: true, label: 'Item/Complemento', align: 'left', field: 'item_name', sortable: true },
  { name: 'total_complement_quantity', label: 'Saída Total (Qtd.)', align: 'center', field: 'total_complement_quantity', sortable: true },
];

</script>