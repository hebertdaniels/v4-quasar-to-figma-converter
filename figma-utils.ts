/**
 * Carrega as fontes necessárias para uso no Figma
 */
export async function loadRequiredFonts() {
  // Lista de fontes usadas pelo plugin
  const requiredFonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Bold" }
  ];
  
  // Carregar todas as fontes em paralelo
  const fontLoadPromises = requiredFonts.map(font => 
    figma.loadFontAsync(font)
  );
  
  // Aguardar o carregamento de todas as fontes
  await Promise.all(fontLoadPromises);
}

/**
 * Ajusta o tamanho de um nó Figma de forma segura
 */
export function setNodeSize(node: SceneNode, width: number, height?: number) {
  if ('resize' in node) {
    node.resize(width, height !== undefined ? height : (node as any).height);
  }
}

/**
 * Cria um nó de texto no Figma
 */
export async function createText(content: string, options: any = {}): Promise<TextNode | null> {
  try {
    const textNode = figma.createText();
    
    // Garantir que a fonte esteja carregada
    await figma.loadFontAsync({
      family: options.fontFamily || "Inter",
      style: options.fontStyle || "Regular"
    });
    
    // Definir o texto
    textNode.characters = content || '';
    
    // Configurações de texto
    if (options.fontSize) textNode.fontSize = options.fontSize;
    if (options.fontWeight) {
      if (options.fontWeight === 'bold') {
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        textNode.fontName = { family: "Inter", style: "Bold" };
      } else if (options.fontWeight === 'medium') {
        await figma.loadFontAsync({ family: "Inter", style: "Medium" });
        textNode.fontName = { family: "Inter", style: "Medium" };
      }
    }
    
    // Cor do texto
    if (options.color) {
      textNode.fills = [{ type: 'SOLID', color: options.color }];
    }
    
    // Definir fills diretamente se fornecido
    if (options.fills) {
      textNode.fills = options.fills;
    }
    
    // Opacidade
    if (options.opacity !== undefined && textNode.fills && Array.isArray(textNode.fills) && textNode.fills.length > 0) {
      const fills = [...textNode.fills];
      fills[0].opacity = options.opacity;
      textNode.fills = fills;
    }
    
    // Alinhamento
    if (options.alignment) {
      textNode.textAlignHorizontal = options.alignment;
    }
    
    if (options.verticalAlignment) {
      textNode.textAlignVertical = options.verticalAlignment;
    }
    
    return textNode;
  } catch (error) {
    console.error('Erro ao criar texto:', error);
    return null;
  }
}

/**
 * Aplica estilos a um nó do Figma
 */
export function applyStylesToFigmaNode(node: any, styles: Record<string, any>) {
  if (!styles || typeof styles !== 'object') return;
  
  // Processa cada propriedade de estilo
  Object.entries(styles).forEach(([key, value]) => {
    try {
      // Propriedades especiais que precisam de tratamento específico
      if (key === 'fills') {
        node.fills = value;
      } else if (key === 'strokes') {
        node.strokes = value;
      } else if (key === 'effects') {
        node.effects = value;
      } else if (key === 'fontName') {
        // Não aplicar fontName aqui - deve ser feito após carregar a fonte
      } else if (key === 'fontColor' && node.fills && Array.isArray(node.fills)) {
        // Aplicar cor de texto mantendo outros parâmetros de fill
        const fills = [...node.fills];
        if (fills.length > 0 && fills[0].type === 'SOLID') {
          fills[0].color = value;
          node.fills = fills;
        } else {
          node.fills = [{ type: 'SOLID', color: value }];
        }
      } else {
        // Tentar aplicar a propriedade diretamente
        node[key] = value;
      }
    } catch (error) {
      console.warn(`Não foi possível aplicar a propriedade ${key} ao nó:`, error);
    }
  });
}

/**
 * Cria um efeito de sombra para nós Figma
 */
export function createShadowEffect(
  offsetX: number, 
  offsetY: number, 
  radius: number, 
  opacity: number, 
  color: RGB = { r: 0, g: 0, b: 0 }
): Effect {
  return {
    type: 'DROP_SHADOW',
    color: { ...color, a: opacity },
    offset: { x: offsetX, y: offsetY },
    radius: radius,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  };
}

/**
 * Determina a cor de texto contrastante com base na cor de fundo
 */
export function getContrastingTextColor(bgColor: RGB): RGB {
  // Calcular luminosidade aproximada
  const luminance = 0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b;
  
  // Se a luminosidade for alta, usar texto escuro, caso contrário usar texto claro
  return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
}

/**
 * Verifica se um Paint é do tipo SolidPaint
 */
export function isSolidPaint(paint: Paint): paint is SolidPaint {
  return paint.type === 'SOLID';
}