/**
 * Configurações de grupos de componentes
 */
export interface ComponentGroups {
  form: boolean;
  layout: boolean;
  navigation: boolean;
  display: boolean;
}

/**
 * Configurações gerais do plugin
 */
export interface PluginSettings {
  preserveQuasarColors: boolean;
  createComponentVariants: boolean;
  useAutoLayout: boolean;
  componentDensity: 'default' | 'comfortable' | 'compact';
  colorTheme: 'quasar-default' | 'material' | 'custom';
  componentGroups: ComponentGroups;
}

/**
 * Atributos de um nó Quasar
 */
export interface QuasarNodeAttributes {
  [key: string]: string;
}

/**
 * Representação de um nó no template Quasar
 */
export interface QuasarNode {
  tagName: string;
  attributes: QuasarNodeAttributes;
  childNodes: QuasarNode[];
  text?: string;
}

/**
 * Informações de um componente Vue
 */
export interface VueComponentInfo {
  name: string;
  props: VueComponentProp[];
  data?: Record<string, any>;
  computed?: string[];
  methods?: string[];
}

/**
 * Prop de um componente Vue
 */
export interface VueComponentProp {
  name: string;
  type: string | null;
  default?: any;
  required: boolean;
}

/**
 * Estilos de um componente Vue
 */
export interface VueComponentStyles {
  isScoped: boolean;
  content: string;
}

/**
 * Tipo de cor RGB do Figma
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Tipo de cor RGBA do Figma
 */
export interface RGBA extends RGB {
  a: number;
}

/**
 * Interface para mapeamento de estilos extraídos
 */
export interface ExtractedStyles {
  fills?: Paint[];
  strokes?: Paint[];
  effects?: Effect[];
  opacity?: number;
  cornerRadius?: number;
  strokeWeight?: number;
  fontSize?: number;
  fontName?: FontName;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  lineHeight?: number | { value: number, unit: string };
  letterSpacing?: number;
  textDecoration?: string;
  textCase?: string;
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  fontColor?: RGB;
  [key: string]: any;
}