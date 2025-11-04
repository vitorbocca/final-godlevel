<template>
  <q-card flat bordered class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedStores"
          :options="storeOptions"
          label="Lojas"
          multiple
          dense
          emit-value
          map-options
          clearable
        >
          <template #selected-item="scope">
            <q-chip
              v-if="scope.index < 3"
              dense
              removable
              @remove="scope.removeAtIndex(scope.index)"
              class="q-mr-xs"
            >
              {{ scope.opt.label }}
            </q-chip>
            <q-chip v-else-if="scope.index === 3" dense class="q-mr-xs">
              +{{ selectedStores.length - 3 }}
            </q-chip>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedChannels"
          :options="channelOptions"
          label="Canais"
          multiple
          dense
          emit-value
          map-options
          clearable
        >
          <template #selected-item="scope">
            <q-chip
              v-if="scope.index < 3"
              dense
              removable
              @remove="scope.removeAtIndex(scope.index)"
              class="q-mr-xs"
            >
              {{ scope.opt.label }}
            </q-chip>
            <q-chip v-else-if="scope.index === 3" dense class="q-mr-xs">
              +{{ selectedChannels.length - 3 }}
            </q-chip>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedSubBrands"
          :options="subBrandOptions"
          label="Submarcas"
          multiple
          dense
          emit-value
          map-options
          clearable
        >
          <template #selected-item="scope">
            <q-chip
              v-if="scope.index < 3"
              dense
              removable
              @remove="scope.removeAtIndex(scope.index)"
              class="q-mr-xs"
            >
              {{ scope.opt.label }}
            </q-chip>
            <q-chip v-else-if="scope.index === 3" dense class="q-mr-xs">
              +{{ selectedSubBrands.length - 3 }}
            </q-chip>
          </template>
        </q-select>
      </div>

    </div>

    <div class="row items-center q-gutter-md q-mt-md">
      <div>
        <q-input v-model="dateFrom" label="De" type="date" dense clearable stack-label />
      </div>
      <div>
        <q-input v-model="dateTo" label="Até" type="date" dense clearable stack-label />
      </div>

      <div class="q-ml-auto">
        <q-btn 
            label="Aplicar Filtros" 
            color="primary" 
            icon="search"
            @click="emitFilters" 
        />
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { onMounted, ref, computed, defineEmits } from 'vue';
import { fetchStores, fetchChannels, fetchSubBrands } from '../services/api';
import moment from 'moment';

// --- 1. Definição do Evento de Saída ---
const emit = defineEmits(['update-filters']);

// --- 2. Estado dos Dados (Filtros) ---
const stores = ref([]);
const channels = ref([]);
const subBrands = ref([]);

// Estado de seleção do usuário
const selectedStores = ref([]);
const selectedChannels = ref([]);
const selectedSubBrands = ref([]);

// AJUSTE CRÍTICO DE DATAS: Filtra o período onde os 500k dados existem
const dateTo = ref(moment('2025-10-28').format('YYYY-MM-DD'));
const dateFrom = ref(moment('2025-05-01').format('YYYY-MM-DD'));

// --- 4. FUNÇÕES COMPUTADAS (MANTIDO) ---
const storeOptions = computed(() => stores.value);
const channelOptions = computed(() => channels.value);
const subBrandOptions = computed(() => subBrands.value);

// --- 5. Método de Emissão (MANTIDO) ---
const emitFilters = () => {
    // Garantir que arrays vazios sejam enviados como [] e não null/undefined
    const filters = {
        stores: Array.isArray(selectedStores.value) && selectedStores.value.length > 0 ? selectedStores.value : [],
        channels: Array.isArray(selectedChannels.value) && selectedChannels.value.length > 0 ? selectedChannels.value : [],
        subBrands: Array.isArray(selectedSubBrands.value) && selectedSubBrands.value.length > 0 ? selectedSubBrands.value : [],
        period: { 
            date_from: dateFrom.value || null, 
            date_to: dateTo.value || null
        }
    };
    
    // Debug: log dos filtros emitidos
    console.log('🔍 HeaderFilters - Emitindo filtros:', filters);
    
    emit('update-filters', filters);
};

// --- 6. Carregamento Inicial (MANTIDO) ---
onMounted(async () => {
    try {
        const [s, c, sb] = await Promise.all([
            fetchStores(),
            fetchChannels(),
            fetchSubBrands()
        ]);
        
        stores.value = s;
        channels.value = c;
        subBrands.value = sb;
    } catch (e) {
        console.error('Falha ao carregar filtros', e);
    }
    
    // Dispara a consulta inicial com as DATAS CORRETAS
    emitFilters(); 
});
</script>
