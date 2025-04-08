/**
 * Quasar to Figma Converter
 * Módulo principal que exporta todas as funcionalidades do plugin
 */

// Tipos
export * from './types/settings';

// Parser
export { 
  parseQuasarTemplate, 
  extractTemplateContent,
  TemplateParser 
} from './parser/template';

// Conversor principal
export { 
  convertQuasarToFigma,
  processGenericComponent
} from './components/converter';

// Utilitários
export * from './utils/figma-utils';
export * from './utils/quasar-utils';
export * from './utils/style-utils';

// Componentes específicos
export { processButtonComponent } from './components/form/button-component';
export { processCardComponent } from './components/layout/card-component';
export { processFormComponents } from './components/form/form-components';
export { processLayoutComponents } from './components/layout/layout-components';

// Mapeamento de componentes
export * from './data/component-map';
export * from './data/color-map';