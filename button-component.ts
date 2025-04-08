import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps, getButtonText } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText, getContrastingTextColor } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';
import { processQuasarClass } from '../../utils/style-utils';

/**
 * Processa um componente de botão Quasar (q-btn)
 */
export async function processButtonComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const buttonFrame = figma.createFrame();
  buttonFrame.name = "q-btn";
  
  // Configuração básica do botão
  buttonFrame.layoutMode = "HORIZONTAL";
  buttonFrame.primaryAxisSizingMode = "AUTO";
  buttonFrame.counterAxisSizingMode = "AUTO";
  buttonFrame.primaryAxisAlignItems = "CENTER";
  buttonFrame.counterAxisAlignItems = "CENTER";
  buttonFrame.cornerRadius = 4;
  buttonFrame.paddingLeft = 16;
  buttonFrame.paddingRight = 16;
  buttonFrame.paddingTop = 8;
  buttonFrame.paddingBottom = 8;
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Verificar classes para personalização
  if (props.class) {
    const classes = props.class.split(/\s+/).filter(c => c);
    
    for (const className of classes) {
      const classStyles = processQuasarClass(className);
      if (classStyles) {
        applyStylesToFigmaNode(buttonFrame, classStyles);
      }
    }
  }
  
  // Aplicar estilos inline
  applyStylesToFigmaNode(buttonFrame, styles);
  
  // Determinar cor do botão
  let btnColor = quasarColors.primary; // Cor padrão
  
  if (props.color && quasarColors[props.color]) {
    btnColor = quasarColors[props.color];
  }
  
  // Verificar variantes de botão
  const isFlat = 'flat' in props || props.flat === 'true' || props.flat === '';
  const isOutline = 'outline' in props || props.outline === 'true' || props.outline === '';
  
  if (isFlat) {
    // Botão flat - transparente com texto colorido
    buttonFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    const textColor = btnColor;
    
    const textNode = await createText(getButtonText(node), {
      color: textColor,
      fontWeight: 'medium',
      fontSize: 14
    });
    
    buttonFrame.appendChild(textNode);
  } else if (isOutline) {
    // Botão outline - borda colorida sem preenchimento
    buttonFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    buttonFrame.strokeWeight = 1;
    buttonFrame.strokes = [{ type: 'SOLID', color: btnColor }];
    
    const textNode = await createText(getButtonText(node), {
      color: btnColor,
      fontWeight: 'medium',
      fontSize: 14
    });
    
    buttonFrame.appendChild(textNode);
  } else {
    // Botão padrão - fundo colorido
    buttonFrame.fills = [{ type: 'SOLID', color: btnColor }];
    
    const textColor = getContrastingTextColor(btnColor);
    const textNode = await createText(getButtonText(node), {
      color: textColor,
      fontWeight: 'medium',
      fontSize: 14
    });
    
    buttonFrame.appendChild(textNode);
  }
  
  // Verificar se deve usar ícone
  if (props.icon) {
    // Criar representação do ícone
    const iconFrame = figma.createFrame();
    iconFrame.name = "q-icon";
    iconFrame.resize(18, 18);
    iconFrame.cornerRadius = 9; // Circular
    
    // Cor do ícone igual à do texto
    const textNode = buttonFrame.findChild(n => n.type === 'TEXT') as TextNode;
    if (textNode && textNode.fills && textNode.fills.length > 0) {
      iconFrame.fills = [...textNode.fills];
    } else {
      iconFrame.fills = [{ type: 'SOLID', color: isFlat || isOutline ? btnColor : getContrastingTextColor(btnColor) }];
    }
    
    // Adicionar ícone no início do botão
    buttonFrame.insertChild(0, iconFrame);
    buttonFrame.itemSpacing = 8;
  }
  
  // Verificar se é tamanho denso ou outros tamanhos
  if (props.dense) {
    buttonFrame.paddingLeft = 8;
    buttonFrame.paddingRight = 8;
    buttonFrame.paddingTop = 4;
    buttonFrame.paddingBottom = 4;
  } else if (props.size) {
    // Tamanhos comuns do Quasar: xs, sm, md, lg, xl
    switch(props.size) {
      case 'xs':
        buttonFrame.paddingLeft = 8;
        buttonFrame.paddingRight = 8;
        buttonFrame.paddingTop = 4;
        buttonFrame.paddingBottom = 4;
        break;
      case 'sm':
        buttonFrame.paddingLeft = 10;
        buttonFrame.paddingRight = 10;
        buttonFrame.paddingTop = 6;
        buttonFrame.paddingBottom = 6;
        break;
      case 'lg':
        buttonFrame.paddingLeft = 20;
        buttonFrame.paddingRight = 20;
        buttonFrame.paddingTop = 12;
        buttonFrame.paddingBottom = 12;
        break;
      case 'xl':
        buttonFrame.paddingLeft = 24;
        buttonFrame.paddingRight = 24;
        buttonFrame.paddingTop = 16;
        buttonFrame.paddingBottom = 16;
        break;
    }
  }
  
  return buttonFrame;
}