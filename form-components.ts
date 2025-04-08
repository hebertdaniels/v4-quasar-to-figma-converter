import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText, setNodeSize, createShadowEffect } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';
import { processButtonComponent } from './button-component';

// Tipo de utilitário para verificar cores válidas
type QuasarColorKey = keyof typeof quasarColors;

// Verifica se uma string é uma chave de cor válida do Quasar
function isQuasarColorKey(key: string): key is QuasarColorKey {
  return key in quasarColors;
}

/**
 * Processa componentes de formulário Quasar
 */
export async function processFormComponents(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const tagName = node.tagName.toLowerCase();
  
  switch (tagName) {
    case 'q-btn':
      return await processButtonComponent(node, settings);
      
    case 'q-input':
      return await processQInput(node, settings);
      
    case 'q-select':
      return await processQSelect(node, settings);
      
    case 'q-checkbox':
      return await processQCheckbox(node, settings);
      
    case 'q-radio':
      return await processQRadio(node, settings);
      
    case 'q-toggle':
      return await processQToggle(node, settings);
      
    case 'q-form':
      return await processQForm(node, settings);
      
    case 'q-field':
      return await processQField(node, settings);
      
    default:
      // Para componentes de formulário não implementados
      const fallbackFrame = figma.createFrame();
      fallbackFrame.name = tagName;
      fallbackFrame.layoutMode = "VERTICAL";
      fallbackFrame.primaryAxisSizingMode = "AUTO";
      fallbackFrame.counterAxisSizingMode = "AUTO";
      
      const textNode = await createText(`Componente ${tagName} (não implementado)`);
      if (textNode) {
        fallbackFrame.appendChild(textNode);
      }
      
      return fallbackFrame;
  }
}

/**
 * Processa um componente q-input
 */
async function processQInput(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const inputFrame = figma.createFrame();
  inputFrame.name = "q-input";
  
  // Configuração básica
  inputFrame.layoutMode = "VERTICAL";
  inputFrame.primaryAxisSizingMode = "AUTO";
  inputFrame.counterAxisSizingMode = "AUTO";
  inputFrame.itemSpacing = 4;
  inputFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
  
  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Criar label se existir
  if (props.label) {
    const labelNode = await createText(props.label, {
      fontSize: 14,
      fontWeight: 'medium',
      color: { r: 0.4, g: 0.4, b: 0.4 }
    });
    if (labelNode) {
      labelNode.name = "q-input__label";
      inputFrame.appendChild(labelNode);
    }
  }
  
  // Container para o input
  const controlFrame = figma.createFrame();
  controlFrame.name = "q-input__control";
  controlFrame.layoutMode = "HORIZONTAL";
  controlFrame.primaryAxisSizingMode = "FIXED";
  controlFrame.counterAxisSizingMode = "AUTO";
  // Usar resize em vez de atribuir diretamente à propriedade 'width'
  setNodeSize(controlFrame, 250);
  controlFrame.paddingLeft = 12;
  controlFrame.paddingRight = 12;
  controlFrame.paddingTop = 8;
  controlFrame.paddingBottom = 8;
  controlFrame.itemSpacing = 8;
  
  // Definir estilo do input baseado nas props
  if (props.filled) {
    controlFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
    controlFrame.cornerRadius = 4;
  } else if (props.outlined || props.standout) {
    controlFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    controlFrame.cornerRadius = 4;
    controlFrame.strokeWeight = 1;
    controlFrame.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
  } else {
    // Estilo padrão - underline
    controlFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    controlFrame.strokeWeight = 1;
    controlFrame.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
    controlFrame.strokeBottomWeight = 1;
    controlFrame.strokeTopWeight = 0;
    controlFrame.strokeLeftWeight = 0;
    controlFrame.strokeRightWeight = 0;
  }
  
  // Definir cor do input baseado na prop color
  if (props.color && isQuasarColorKey(props.color) && settings.preserveQuasarColors) {
    if (props.filled) {
      // Para filled, ajustamos a cor com opacidade
      const color = quasarColors[props.color];
      controlFrame.fills = [{ 
        type: 'SOLID', 
        color: color,
        opacity: 0.1
      }];
    } else {
      // Para outros estilos, ajustamos a borda
      controlFrame.strokes = [{ type: 'SOLID', color: quasarColors[props.color] }];
    }
  }
  
  // Adicionar texto de placeholder/valor
  const inputText = await createText(props.placeholder || props.label || props.hint || "Valor", {
    fontSize: 14,
    color: { r: 0.6, g: 0.6, b: 0.6 }
  });
  if (inputText) {
    inputText.name = "q-input__native";
    controlFrame.appendChild(inputText);
  }
  
  inputFrame.appendChild(controlFrame);
  
  // Adicionar mensagem de erro se houver
  if (props.error || props['error-message']) {
    const errorNode = await createText(props['error-message'] || "Erro", {
      fontSize: 12,
      color: { r: 0.9, g: 0.2, b: 0.2 }
    });
    if (errorNode) {
      errorNode.name = "q-input__error";
      inputFrame.appendChild(errorNode);
    }
  }
  
  // Adicionar hint se houver
  if (props.hint && !props.error) {
    const hintNode = await createText(props.hint, {
      fontSize: 12,
      color: { r: 0.6, g: 0.6, b: 0.6 }
    });
    if (hintNode) {
      hintNode.name = "q-input__hint";
      inputFrame.appendChild(hintNode);
    }
  }
  
  return inputFrame;
}

/**
 * Processa um componente q-select
 */
async function processQSelect(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  // Base semelhante ao q-input
  const selectFrame = await processQInput(node, settings);
  selectFrame.name = "q-select";
  
  // Adicionar ícone de dropdown
  const controlFrame = selectFrame.findChild(n => n.name === "q-input__control") as FrameNode | null;
  if (controlFrame) {
    const dropdownIcon = figma.createFrame();
    dropdownIcon.name = "q-select__dropdown-icon";
    dropdownIcon.resize(16, 16);
    dropdownIcon.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
    
    // Adicionar símbolo de seta
    const arrowText = await createText("▼", {
      fontSize: 10,
      color: { r: 0.6, g: 0.6, b: 0.6 }
    });
    if (arrowText) {
      dropdownIcon.appendChild(arrowText);
    }
    
    // Adicionar o ícone ao final
    controlFrame.appendChild(dropdownIcon);
  }
  
  return selectFrame;
}

/**
 * Processa um componente q-checkbox
 */
async function processQCheckbox(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const checkboxFrame = figma.createFrame();
  checkboxFrame.name = "q-checkbox";
  checkboxFrame.layoutMode = "HORIZONTAL";
  checkboxFrame.primaryAxisSizingMode = "AUTO";
  checkboxFrame.counterAxisSizingMode = "AUTO";
  checkboxFrame.primaryAxisAlignItems = "CENTER";
  checkboxFrame.counterAxisAlignItems = "CENTER";
  checkboxFrame.itemSpacing = 8;
  checkboxFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
  
  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Cor do checkbox
  let checkColor = quasarColors.primary;
  if (props.color && isQuasarColorKey(props.color) && settings.preserveQuasarColors) {
    checkColor = quasarColors[props.color];
  }
  
  // Criar o box do checkbox
  const boxFrame = figma.createFrame();
  boxFrame.name = "q-checkbox__inner";
  boxFrame.resize(20, 20);
  boxFrame.cornerRadius = 4;
  
  // Verificar se está marcado
  const isChecked = props.value === 'true' || props.checked === 'true' ||
                   'value' in props || 'checked' in props;
  
  if (isChecked && settings.preserveQuasarColors) {
    // Estilo marcado
    boxFrame.fills = [{ type: 'SOLID', color: checkColor }];
    
    // Adicionar símbolo de check
    const checkText = await createText("✓", {
      fontSize: 14,
      color: { r: 1, g: 1, b: 1 },
      alignment: 'CENTER',
      verticalAlignment: 'CENTER'
    });
    if (checkText) {
      boxFrame.appendChild(checkText);
    }
  } else {
    // Estilo desmarcado
    boxFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    boxFrame.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }];
    boxFrame.strokeWeight = 1;
  }
  
  checkboxFrame.appendChild(boxFrame);
  
  // Adicionar label
  if (props.label) {
    const labelNode = await createText(props.label, {
      fontSize: 14
    });
    if (labelNode) {