import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText, getContrastingTextColor, isSolidPaint } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';
import { processButtonComponent } from '../form/button-component';

// Tipo de utilitário para verificar cores válidas
type QuasarColorKey = keyof typeof quasarColors;

// Verifica se uma string é uma chave de cor válida do Quasar
function isQuasarColorKey(key: string): key is QuasarColorKey {
  return key in quasarColors;
}

/**
 * Processa um componente de card do Quasar
 */
export async function processCardComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const cardFrame = figma.createFrame();
  cardFrame.name = "q-card";
  
  // Configuração básica do card
  cardFrame.layoutMode = "VERTICAL";
  cardFrame.primaryAxisSizingMode = "AUTO";
  cardFrame.counterAxisSizingMode = "AUTO";
  cardFrame.cornerRadius = 4;
  cardFrame.itemSpacing = 0;
  
  // Adicionar sombra ao card - criar um novo array com um efeito de tipo correto
  const dropShadowEffect: DropShadowEffect = {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.2 }, // Adicionado canal alfa
    offset: { x: 0, y: 2 },
    radius: 4,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  };
  
  cardFrame.effects = [dropShadowEffect];
  
  // Cor branca padrão
  cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Aplicar classe para cor de fundo específica
  if (props.class) {
    const classes = props.class.split(/\s+/).filter(c => c);
    
    for (const className of classes) {
      if (className.startsWith('bg-')) {
        const colorName = className.substring(3);
        if (isQuasarColorKey(colorName) && settings.preserveQuasarColors) {
          cardFrame.fills = [{ type: 'SOLID', color: quasarColors[colorName] }];
          break;
        }
      }
    }
  }
  
  // Processar seções do card
  for (const child of node.childNodes) {
    if (!child.tagName || child.tagName === '#text') continue;
    
    const childTag = child.tagName.toLowerCase();
    
    if (childTag === 'q-card-section') {
      const sectionFrame = await processCardSection(child, settings);
      if (sectionFrame) {
        cardFrame.appendChild(sectionFrame);
      }
    } 
    else if (childTag === 'q-card-actions') {
      const actionsFrame = await processCardActions(child, settings);
      if (actionsFrame) {
        cardFrame.appendChild(actionsFrame);
      }
    }
    else if (childTag === 'q-separator') {
      const separator = figma.createRectangle();
      separator.name = "q-separator";
      separator.resize(300, 1); // Largura será ajustada automaticamente
      separator.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
      cardFrame.appendChild(separator);
    }
    else {
      // Tentar processar componentes genéricos dentro do card
      try {
        // Importando processamento genérico aqui
        const { processGenericComponent } = require('../converter');
        const genericFrame = await processGenericComponent(child, settings);
        if (genericFrame) {
          cardFrame.appendChild(genericFrame);
        }
      } catch (error) {
        console.error(`Erro ao processar filho do card (${childTag}):`, error);
      }
    }
  }
  
  return cardFrame;
}

/**
 * Processa uma seção do card
 */
async function processCardSection(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const sectionFrame = figma.createFrame();
  sectionFrame.name = "q-card-section";
  
  // Configuração básica
  sectionFrame.layoutMode = "VERTICAL";
  sectionFrame.primaryAxisSizingMode = "AUTO";
  sectionFrame.counterAxisSizingMode = "AUTO";
  sectionFrame.layoutAlign = "STRETCH";
  sectionFrame.itemSpacing = 4;
  
  // Adicionar padding adequado
  sectionFrame.paddingLeft = 16;
  sectionFrame.paddingRight = 16;
  sectionFrame.paddingTop = 16;
  sectionFrame.paddingBottom = 16;
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Cor de fundo padrão
  sectionFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  // Verificar classes de cor de fundo
  let hasBgColor = false;
  let textColor = { r: 0, g: 0, b: 0 }; // preto por padrão
  
  if (props.class) {
    const classes = props.class.split(/\s+/).filter(c => c);
    
    for (const className of classes) {
      if (className.startsWith('bg-') && settings.preserveQuasarColors) {
        const colorName = className.substring(3);
        if (isQuasarColorKey(colorName)) {
          sectionFrame.fills = [{ type: 'SOLID', color: quasarColors[colorName] }];
          hasBgColor = true;
        }
      }
      else if (className === 'text-white') {
        textColor = { r: 1, g: 1, b: 1 }; // branco
      }
    }
  }
  
  // Se tiver fundo colorido mas não definiu cor de texto explícita, calcular contraste
  if (hasBgColor && props.class && !props.class.includes('text-white')) {
    // Verificar primeiro fill
    if (sectionFrame.fills && Array.isArray(sectionFrame.fills) && sectionFrame.fills.length > 0) {
      const firstFill = sectionFrame.fills[0];
      if (isSolidPaint(firstFill)) {
        textColor = getContrastingTextColor(firstFill.color);
      }
    }
  }
  
  // Processar filhos
  for (const child of node.childNodes) {
    if (!child.tagName) {
      // Pode ser conteúdo de texto direto
      if (child.text && child.text.trim()) {
        const textNode = await createText(child.text.trim(), { color: textColor });
        if (textNode) { // Verificar se não é null antes de usar
          sectionFrame.appendChild(textNode);
        }
      }
      continue;
    }
    
    const childTag = child.tagName.toLowerCase();
    
    if (childTag === 'div') {
      // Verificar classes para detectar hierarquia de texto
      const divClasses = child.attributes.class || '';
      let fontSize = 14;
      let fontWeight = 'regular';
      let textContent = '';
      
      // Extrair texto do div
      if (child.childNodes && child.childNodes.length > 0) {
        for (const textNode of child.childNodes) {
          if (textNode.text) {
            textContent += textNode.text;
          }
        }
      }
      
      // Determinar estilo de texto com base nas classes
      if (divClasses.includes('text-h6')) {
        fontSize = 16;
        fontWeight = 'bold';
      } 
      else if (divClasses.includes('text-subtitle2')) {
        fontSize = 14;
        fontWeight = 'medium';
        // Criar um fill com opacidade
        const fills = [{ 
          type: 'SOLID', 
          color: textColor, 
          opacity: 0.7 
        }];
        
        const textNode = await createText(textContent, {
          fontSize,
          fontWeight,
          fills: fills
        });
        
        if (textNode) { // Verificar se não é null antes de usar
          sectionFrame.appendChild(textNode);
        }
        continue; // Pular o restante do loop para este nó
      }
      else if (divClasses.includes('text-body1')) {
        fontSize = 16;
      }
      else if (divClasses.includes('text-body2')) {
        fontSize = 14;
      }
      
      const textNode = await createText(textContent, {
        fontSize,
        fontWeight,
        color: textColor
      });
      
      if (textNode) { // Verificar se não é null antes de usar
        sectionFrame.appendChild(textNode);
      }
    }
    else {
      // Tentar processar componentes genéricos
      try {
        // Importando processamento genérico aqui
        const { processGenericComponent } = require('../converter');
        const genericFrame = await processGenericComponent(child, settings);
        if (genericFrame) {
          sectionFrame.appendChild(genericFrame);
        }
      } catch (error) {
        console.error(`Erro ao processar filho da seção do card (${childTag}):`, error);
      }
    }
  }
  
  return sectionFrame;
}

/**
 * Processa as ações do card
 */
async function processCardActions(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const actionsFrame = figma.createFrame();
  actionsFrame.name = "q-card-actions";
  
  // Configuração básica
  actionsFrame.layoutMode = "HORIZONTAL";
  actionsFrame.primaryAxisSizingMode = "AUTO";
  actionsFrame.counterAxisSizingMode = "AUTO";
  actionsFrame.paddingLeft = 8;
  actionsFrame.paddingRight = 8;
  actionsFrame.paddingTop = 8;
  actionsFrame.paddingBottom = 8;
  actionsFrame.itemSpacing = 8;
  actionsFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Verificar alinhamento
  if (props.align) {
    switch(props.align) {
      case 'right':
        actionsFrame.primaryAxisAlignItems = 'MAX';
        break;
      case 'center':
        actionsFrame.primaryAxisAlignItems = 'CENTER';
        break;
      case 'between':
        actionsFrame.primaryAxisAlignItems = 'SPACE_BETWEEN';
        break;
      case 'around':
      case 'evenly':
        actionsFrame.primaryAxisAlignItems = 'SPACE_BETWEEN';
        break;
      case 'left':
      default:
        actionsFrame.primaryAxisAlignItems = 'MIN';
        break;
    }
  }
  
  // Processar os botões nas ações
  let hasButtons = false;
  
  for (const child of node.childNodes) {
    if (!child.tagName || child.tagName === '#text') continue;
    
    const childTag = child.tagName.toLowerCase();
    
    if (childTag === 'q-btn') {
      try {
        const buttonFrame = await processButtonComponent(child, settings);
        if (buttonFrame) {
          actionsFrame.appendChild(buttonFrame);
          hasButtons = true;
        }
      } catch (error) {
        console.error('Erro ao processar botão nas ações do card:', error);
      }
    }
    else {
      // Tentar processar outros componentes
      try {
        // Importando processamento genérico aqui
        const { processGenericComponent } = require('../converter');
        const genericFrame = await processGenericComponent(child, settings);
        if (genericFrame) {
          actionsFrame.appendChild(genericFrame);
          hasButtons = true;
        }
      } catch (error) {
        console.error(`Erro ao processar filho das ações (${childTag}):`, error);
      }
    }
  }
  
  // Se não houver botões, adicionar alguns botões genéricos
  if (!hasButtons) {
    // Criar botões de exemplo
    const btn1 = figma.createFrame();
    btn1.name = "q-btn";
    btn1.layoutMode = "HORIZONTAL";
    btn1.primaryAxisSizingMode = "AUTO";
    btn1.counterAxisSizingMode = "AUTO";
    btn1.primaryAxisAlignItems = "CENTER";
    btn1.counterAxisAlignItems = "CENTER";
    btn1.paddingLeft = 12;
    btn1.paddingRight = 12;
    btn1.paddingTop = 8;
    btn1.paddingBottom = 8;
    btn1.cornerRadius = 4;
    btn1.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
    
    const btnText1 = await createText("Cancelar", {
      color: quasarColors.primary,
      fontWeight: 'medium',
      fontSize: 14
    });
    
    if (btnText1) { // Verificar se não é null antes de usar
      btn1.appendChild(btnText1);
    }
    
    const btn2 = figma.createFrame();
    btn2.name = "q-btn";
    btn2.layoutMode = "HORIZONTAL";
    btn2.primaryAxisSizingMode = "AUTO";
    btn2.counterAxisSizingMode = "AUTO";
    btn2.primaryAxisAlignItems = "CENTER";
    btn2.counterAxisAlignItems = "CENTER";
    btn2.paddingLeft = 12;
    btn2.paddingRight = 12;
    btn2.paddingTop = 8;
    btn2.paddingBottom = 8;
    btn2.cornerRadius = 4;
    btn2.fills = [{ type: 'SOLID', color: quasarColors.primary }];
    
    const btnText2 = await createText("OK", {
      color: { r: 1, g: 1, b: 1 },
      fontWeight: 'medium',
      fontSize: 14
    });
    
    if (btnText2) { // Verificar se não é null antes de usar
      btn2.appendChild(btnText2);
    }
    
    actionsFrame.appendChild(btn1);
    actionsFrame.appendChild(btn2);
  }
  
  return actionsFrame;
}