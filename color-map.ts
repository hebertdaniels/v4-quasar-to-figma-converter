// Cores padrão do Quasar
export const quasarColors: Record<string, RGB> = {
  'primary': { r: 0.1, g: 0.5, b: 0.9 },
  'secondary': { r: 0.15, g: 0.65, b: 0.6 },
  'accent': { r: 0.61, g: 0.15, b: 0.69 },
  'positive': { r: 0.13, g: 0.73, b: 0.27 },
  'negative': { r: 0.76, g: 0.0, b: 0.08 },
  'info': { r: 0.19, g: 0.8, b: 0.93 },
  'warning': { r: 0.95, g: 0.75, b: 0.22 },
  'dark': { r: 0.19, g: 0.19, b: 0.19 },
  'white': { r: 1, g: 1, b: 1 },
  'black': { r: 0, g: 0, b: 0 },
  'grey': { r: 0.5, g: 0.5, b: 0.5 }
};

// Mapeamento de classes CSS Quasar para propriedades Figma
export const quasarClassesMap: Record<string, Record<string, any>> = {
  // Margens
  'q-ma-none': { marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 },
  'q-ma-xs': { marginTop: 4, marginRight: 4, marginBottom: 4, marginLeft: 4 },
  'q-ma-sm': { marginTop: 8, marginRight: 8, marginBottom: 8, marginLeft: 8 },
  'q-ma-md': { marginTop: 16, marginRight: 16, marginBottom: 16, marginLeft: 16 },
  'q-ma-lg': { marginTop: 24, marginRight: 24, marginBottom: 24, marginLeft: 24 },
  'q-ma-xl': { marginTop: 32, marginRight: 32, marginBottom: 32, marginLeft: 32 },
  
  // Padding
  'q-pa-none': { paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 },
  'q-pa-xs': { paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4 },
  'q-pa-sm': { paddingTop: 8, paddingRight: 8, paddingBottom: 8, paddingLeft: 8 },
  'q-pa-md': { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16 },
  'q-pa-lg': { paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24 },
  'q-pa-xl': { paddingTop: 32, paddingRight: 32, paddingBottom: 32, paddingLeft: 32 },
  
  // Classes de texto
  'text-h1': { fontSize: 48, fontWeight: 'bold', letterSpacing: -0.5 },
  'text-h2': { fontSize: 40, fontWeight: 'bold', letterSpacing: -0.4 },
  'text-h3': { fontSize: 34, fontWeight: 'bold', letterSpacing: -0.3 },
  'text-h4': { fontSize: 28, fontWeight: 'bold', letterSpacing: -0.2 },
  'text-h5': { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.1 },
  'text-h6': { fontSize: 20, fontWeight: 'bold', letterSpacing: 0 },
  'text-subtitle1': { fontSize: 16, fontWeight: 'regular', letterSpacing: 0.15 },
  'text-subtitle2': { fontSize: 14, fontWeight: 'medium', letterSpacing: 0.1 },
  'text-body1': { fontSize: 16, fontWeight: 'regular', letterSpacing: 0.5 },
  'text-body2': { fontSize: 14, fontWeight: 'regular', letterSpacing: 0.25 },
  
  // Classes de alinhamento
  'text-left': { textAlignHorizontal: 'LEFT' },
  'text-right': { textAlignHorizontal: 'RIGHT' },
  'text-center': { textAlignHorizontal: 'CENTER' },
  'text-justify': { textAlignHorizontal: 'JUSTIFIED' },
  
  // Classes de flexbox
  'row': { layoutMode: 'HORIZONTAL' },
  'column': { layoutMode: 'VERTICAL' },
  'items-start': { counterAxisAlignItems: 'MIN' },
  'items-center': { counterAxisAlignItems: 'CENTER' },
  'items-end': { counterAxisAlignItems: 'MAX' },
  'justify-start': { primaryAxisAlignItems: 'MIN' },
  'justify-center': { primaryAxisAlignItems: 'CENTER' },
  'justify-end': { primaryAxisAlignItems: 'MAX' },
  'justify-between': { primaryAxisAlignItems: 'SPACE_BETWEEN' },
  'content-start': { counterAxisAlignContent: 'MIN' },
  'content-center': { counterAxisAlignContent: 'CENTER' },
  'content-end': { counterAxisAlignContent: 'MAX' }
};