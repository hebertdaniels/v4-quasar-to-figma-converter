export const quasarLayoutComponents = {
  // Componentes de layout
  'q-layout': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'FIXED',
      width: 1024,
      height: 768,
      itemSpacing: 0,
      fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }]
    }
  },
  
  'q-page': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      width: 1024,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
      itemSpacing: 16,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-header': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'AUTO',
      width: 1024,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'CENTER',
      fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.9 } }]
    }
  },
  
  'q-footer': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'AUTO',
      width: 1024,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8, 
      paddingBottom: 8,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'CENTER',
      fills: [{ type: 'SOLID', color: { r: 0.19, g: 0.19, b: 0.19 } }]
    }
  },
  
  'q-drawer': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'FIXED',
      width: 256,
      height: 768,
      itemSpacing: 0,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 2, y: 0 },
          radius: 4,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    }
  },
  
  'q-toolbar': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'AUTO',
      width: 1024,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'CENTER',
      itemSpacing: 8,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }]
    }
  },
  
  'q-card': {
    type: 'FRAME',
    properties: {
      cornerRadius: 4,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      itemSpacing: 0,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.2 },
          offset: { x: 0, y: 2 },
          radius: 4,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    }
  },
  
  'q-card-section': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 16,
      itemSpacing: 4,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-card-actions': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 8,
      paddingBottom: 8,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      itemSpacing: 8,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-separator': {
    type: 'RECTANGLE',
    properties: {
      fillStyleId: '',
      fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
      height: 1
    }
  },
  
  'q-table': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      width: 600,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
      strokeWeight: 1
    }
  },
  
  'q-tabs': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'AUTO',
      width: 400,
      itemSpacing: 0,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-tab': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
      paddingBottom: 12,
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      itemSpacing: 4,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-tab-panels': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      width: 400,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-tab-panel': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      width: 400,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 16,
      itemSpacing: 16,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-list': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      itemSpacing: 0,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },
  
  'q-item': {
    type: 'FRAME',
    properties: {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
      paddingBottom: 12,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'CENTER',
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  },

  'q-dialog': {
    type: 'FRAME',
    properties: {
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
      cornerRadius: 4,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.2 },
          offset: { x: 0, y: 2 },
          radius: 8,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    }
  }
};