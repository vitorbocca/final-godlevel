import axios from 'axios';

// Use relative URLs when VITE_API_BASE_URL is not set (for proxy) or use the provided URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({ baseURL });

// --- UTILITY: Mapeia um array de objetos para o formato { label: Nome, value: ID } ---
const mapToLabelValue = (items) => {
    return items.map(item => ({ 
        label: item.name || item.label, 
        // A CORREÇÃO CRÍTICA: Garante que o valor (ID) seja um inteiro numérico,
        // o que é essencial para o v-model/q-select funcionar corretamente com IDs.
        value: parseInt(item.id || item.value, 10) 
    }));
};

// --- Funções Auxiliares (Fetch de Dimensões) ---

export async function fetchStores() {
    const { data } = await api.get('/api/stores'); 
    const items = Array.isArray(data?.data) ? data.data : [];
    
    return mapToLabelValue(items);
}

export async function fetchChannels() {
    const { data } = await api.get('/api/channels'); 
    const items = Array.isArray(data?.data) ? data.data : [];
    
    return mapToLabelValue(items);
}

export async function fetchSubBrands() {
    const { data } = await api.get('/api/stores/sub-brands/list');
    const items = Array.isArray(data?.data) ? data.data : [];

    return mapToLabelValue(items);
}

export async function fetchMetricOptions() {
    const { data } = await api.get('/api/dashboard/metric-options');
    return Array.isArray(data?.data) ? data.data : [];
}

// --- FUNÇÃO CRUCIAL: Query Dinâmica (Analytics Builder) ---

export async function queryMetrics(ids = [], { stores = [], channels = [], subBrands = [], period = {} } = {}, group_by_dimension = null) {
    
    // NOTA: A coerção para Number aqui é redundante se o mapToLabelValue estiver correto,
    // mas mantê-la é uma boa camada de segurança.
    // IMPORTANTE: Filtrar arrays vazios e valores inválidos
    const numericStores = Array.isArray(stores) ? stores.map(id => Number(id)).filter(id => !isNaN(id) && id > 0) : [];
    const numericChannels = Array.isArray(channels) ? channels.map(id => Number(id)).filter(id => !isNaN(id) && id > 0) : [];
    const numericSubBrands = Array.isArray(subBrands) ? subBrands.map(id => Number(id)).filter(id => !isNaN(id) && id > 0) : [];

    const payload = { 
        ids, 
        stores: numericStores, 
        channels: numericChannels,
        sub_brands: numericSubBrands,
        period,
        group_by_dimension 
    };
    
    // Debug: log dos filtros sendo enviados
    console.log('🔍 API - Filtros enviados:', {
        stores: numericStores,
        channels: numericChannels,
        sub_brands: numericSubBrands,
        group_by_dimension
    });
    
    const { data } = await api.post('/api/dashboard/query', payload);
    return data?.data || {}; 
}