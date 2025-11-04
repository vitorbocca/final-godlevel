import { createApp } from 'vue';
import App from './App.vue';
import './assets/styles.css';
import { Quasar } from 'quasar';
import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';
// Importar Material Design Icons (MDI) - necessário para ícones mdi-*
import '@quasar/extras/mdi-v6/mdi-v6.css';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);

app.use(Quasar, { 
  config: { 
    brand: {},
    // Configurar para usar MDI como fonte de ícones padrão
    iconSet: 'material-icons'
  },
  plugins: {} // Adicionar plugins do Quasar se necessário
});

app.use(VueApexCharts);
app.mount('#app');