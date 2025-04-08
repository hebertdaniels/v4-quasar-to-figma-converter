export interface ComponentGroups {
  form: boolean;
  layout: boolean;
  navigation: boolean;
  display: boolean;
}

export interface PluginSettings {
  preserveQuasarColors: boolean;
  createComponentVariants: boolean;
  useAutoLayout: boolean;
  componentDensity: 'default' | 'comfortable' | 'compact';
  colorTheme: 'quasar-default' | 'material' | 'custom';
  componentGroups: ComponentGroups;
}

export interface QuasarNodeAttributes {
  [key: string]: string;
}

export interface QuasarNode {
  tagName: string;
  attributes: QuasarNodeAttributes;
  childNodes: QuasarNode[];
  text?: string;
}