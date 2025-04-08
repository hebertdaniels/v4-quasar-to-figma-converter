import { QuasarNode, QuasarNodeAttributes } from '../types/settings';

/**
 * Extrai estilos e props de um nó Quasar
 */
export function extractStylesAndProps(node: QuasarNode) {
  const props: Record<string, string> = {};
  const styles: Record<string, any> = {};
  
  // Lista de props comuns do Quasar
  const QUASAR_PROPS = [
    'color', 'label', 'dense', 'disable', 'dark', 'flat', 'outline', 
    'rounded', 'push', 'glossy', 'size', 'fab', 'stack', 'no-caps',
    'loading', 'percentage', 'dark-percentage', 'indeterminate',
    'value', 'ratio', 'label-always', 'checked', 'keep-color',
    'toggle-indeterminate', 'true-value', 'false-value',
    'indeterminate-value', 'persistent', 'placeholder',
    'error', 'error-message', 'maxlength', 'hint', 'autogrow',
    'counter', 'filled', 'standout', 'bottom-slots', 'autocomplete',
    'icon', 'icon-right', 'placeholder', 'prefix', 'suffix'
  ];
  
  // Extrair atributos do nó
  if (node.attributes) {
    Object.keys(node.attributes).forEach(attr => {
      // Props do Quasar ou atributos personalizados v-model, :value, etc.
      if (QUASAR_PROPS.includes(attr) || attr.startsWith(':') || attr.startsWith('v-')) {
        props[attr] = node.attributes[attr];
      }
      
      // Extrair estilos inline
      if (attr === 'style') {
        const inlineStyles = parseInlineStyles(node.attributes.style);
        Object.assign(styles, inlineStyles);
      }
      
      // Extrair classes CSS
      if (attr === 'class') {
        props['class'] = node.attributes.class;
      }
    });
  }
  
  return { props, styles };
}

/**
 * Analisa string de estilos inline
 */
export function parseInlineStyles(styleString?: string) {
  if (!styleString) return {};
  
  const styles: Record<string, string> = {};
  const declarations = styleString.split(';');
  
  for (const declaration of declarations) {
    if (!declaration.trim()) continue;
    
    const parts = declaration.split(':');
    if (parts.length !== 2) continue;
    
    const [property, value] = parts.map(s => s.trim());
    if (property && value) {
      // Converter para camelCase para compatibilidade com JS
      const camelProperty = property.replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());
      styles[camelProperty] = value;
    }
  }
  
  return styles;
}

/**
 * Encontra um filho com uma determinada tag
 */
export function findChildByTagName(node: QuasarNode, tagName: string): QuasarNode | null {
  if (!node.childNodes || node.childNodes.length === 0) {
    return null;
  }
  
  for (const child of node.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === tagName.toLowerCase()) {
      return child;
    }
    
    // Busca recursiva
    const found = findChildByTagName(child, tagName);
    if (found) {
      return found;
    }
  }
  
  return null;
}

/**
 * Detecta o tipo de layout com base no nó raiz
 */
export function detectLayoutType(node: QuasarNode): string {
  const tagName = node.tagName.toLowerCase();
  
  // Componentes de layout
  if (tagName === 'q-layout') {
    const hasDrawer = findChildByTagName(node, 'q-drawer');
    const hasHeader = findChildByTagName(node, 'q-header');
    
    if (hasDrawer && hasHeader) {
      return 'app-layout-with-drawer';
    } else if (hasHeader) {
      return 'app-layout';
    }
    return 'basic-layout';
  }
  
  if (tagName === 'q-page') {
    return 'page-only';
  }
  
  if (tagName === 'q-tabs' || findChildByTagName(node, 'q-tabs')) {
    return 'tabs-layout';
  }
  
  // Componentes individuais
  if (tagName === 'q-card' || findChildByTagName(node, 'q-card')) {
    return 'card-layout';
  }
  
  if (tagName === 'q-form' || findChildByTagName(node, 'q-form')) {
    return 'form-layout';
  }
  
  if (tagName === 'q-btn') {
    return 'button-component';
  }
  
  // Componentes de formulário
  if (['q-input', 'q-select', 'q-checkbox', 'q-radio', 'q-toggle', 'q-file'].includes(tagName)) {
    return 'form-component';
  }
  
  if (tagName === 'q-list' || findChildByTagName(node, 'q-list')) {
    return 'list-layout';
  }
  
  return 'unknown';
}