import { parseQuasarTemplate } from '../parser/template';
import { loadRequiredFonts } from '../utils/figma-utils';
import { PluginSettings, QuasarNode } from '../types/settings';
import { detectLayoutType } from '../utils/quasar-utils';
import { processFormComponents } from './form/form-components';
import { processLayoutComponents } from './layout/layout-components';
import { processCardComponent } from './layout/card-component';
import { processButtonComponent } from './form/button-component';

// Declaração antecipada da função para evitar referência circular
export async function processGenericComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode>;

/**
 * Função principal de conversão
 */
export async function convertQuasarToFigma(html: string, settings: PluginSettings) {
  // Carregar fontes antes de iniciar a conversão
  await loadRequiredFonts();
  
  // Analisar o HTML em uma árvore de nós
  const rootNode = parseQuasarTemplate(html);
  if (!rootNode) {
    throw new Error('Falha ao analisar o template HTML');
  }
  
  // Detectar o tipo de layout
  const layoutType = detectLayoutType(rootNode);
  
  // Criar o nó raiz do Figma baseado no tipo de layout
  const mainFrame = figma.createFrame();
  mainFrame.name = "Componente Quasar";
  mainFrame.layoutMode = "VERTICAL";
  mainFrame.primaryAxisSizingMode = "AUTO";
  mainFrame.counterAxisSizingMode = "AUTO";
  mainFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  mainFrame.paddingLeft = 20;
  mainFrame.paddingRight = 20;
  mainFrame.paddingTop = 20;
  mainFrame.paddingBottom = 20;
  mainFrame.itemSpacing = 16;
  
  // Adicionar metadados para facilitar identificação
  mainFrame.setPluginData('quasarComponent', 'true');
  mainFrame.setPluginData('layoutType', layoutType);
  
  // Processar o nó raiz com base no tipo de layout
  let processedMainComponent: FrameNode | null = null;
  
  try {
    switch (layoutType) {
      case 'card-layout':
        processedMainComponent = await processCardComponent(rootNode, settings);
        break;
        
      case 'button-component':
        processedMainComponent = await processButtonComponent(rootNode, settings);
        break;
        
      case 'form-component':
      case 'form-layout':
        processedMainComponent = await processFormComponents(rootNode, settings);
        break;
        
      case 'app-layout-with-drawer':
      case 'app-layout':
      case 'basic-layout':
      case 'page-only':
      case 'tabs-layout':
      case 'list-layout':
        processedMainComponent = await processLayoutComponents(rootNode, layoutType, settings);
        break;
        
      default:
        // Processar componente genérico
        processedMainComponent = await processGenericComponent(rootNode, settings);
        break;
    }
    
    // Adicionar o componente processado ao frame principal
    if (processedMainComponent) {
      mainFrame.appendChild(processedMainComponent);
    }
    
    // Adicionar à página atual do Figma
    figma.currentPage.appendChild(mainFrame);
    
    // Notificar progresso
    figma.ui.postMessage({
      type: 'processing-update',
      message: 'Componente convertido com sucesso',
      layoutType: layoutType
    });
    
    return mainFrame;
  } catch (error) {
    console.error('Erro ao processar componente:', error);
    
    // Tentar criar uma representação mínima em caso de erro
    const errorText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    errorText.characters = "Erro ao processar o componente: " + (error instanceof Error ? error.message : String(error));
    errorText.fontSize = 14;
    errorText.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.3, b: 0.3 } }];
    
    mainFrame.appendChild(errorText);
    figma.currentPage.appendChild(mainFrame);
    
    throw error;
  }
}

/**
 * Processa componente genérico quando não houver conversor específico
 */
export async function processGenericComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = node.tagName || "generic-component";
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.cornerRadius = 4;
  
  // Adicionar texto que indica o tipo de componente
  const headerText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  headerText.characters = `Componente ${node.tagName}`;
  headerText.fontSize = 16;
  headerText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  
  frame.appendChild(headerText);
  
  // Processar atributos relevantes
  if (node.attributes && Object.keys(node.attributes).length > 0) {
    const attrsText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    const attrStr = Object.entries(node.attributes)
      .filter(([key, _]) => key !== 'style' && key !== 'class')
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    attrsText.characters = attrStr || "Sem atributos";
    attrsText.fontSize = 12;
    attrsText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
    
    frame.appendChild(attrsText);
  }
  
  // Processar nós filhos recursivamente
  if (node.childNodes && node.childNodes.length > 0) {
    for (const child of node.childNodes) {
      if (!child.tagName || child.tagName === '#text') {
        // Processar nós de texto diretamente
        if (child.text && child.text.trim()) {
          const textNode = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          textNode.characters = child.text.trim();
          textNode.fontSize = 14;
          frame.appendChild(textNode);
        }
        continue;
      }
      
      // Processar componentes filhos recursivamente
      try {
        // Para evitar recursão infinita, limitamos a profundidade com condições específicas
        if (child.tagName.toLowerCase().startsWith('q-')) {
          // Para componentes Quasar, tente processar usando a função apropriada
          let childComponent: FrameNode | null = null;
          
          if (child.tagName.toLowerCase() === 'q-btn') {
            childComponent = await processButtonComponent(child, settings);
          } else if (child.tagName.toLowerCase() === 'q-card') {
            childComponent = await processCardComponent(child, settings);
          } else if (['q-input', 'q-select', 'q-checkbox', 'q-radio', 'q-toggle'].includes(child.tagName.toLowerCase())) {
            childComponent = await processFormComponents(child, settings);
          } else {
            // Criar um componente simples para outros tipos
            const simpleFrame = figma.createFrame();
            simpleFrame.name = child.tagName;
            simpleFrame.layoutMode = "VERTICAL";
            simpleFrame.primaryAxisSizingMode = "AUTO";
            simpleFrame.counterAxisSizingMode = "AUTO";
            
            const childText = figma.createText();
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            childText.characters = `${child.tagName}`;
            childText.fontSize = 12;
            simpleFrame.appendChild(childText);
            
            childComponent = simpleFrame;
          }
          
          if (childComponent) {
            frame.appendChild(childComponent);
          }
        } else {
          // Para elementos HTML comuns (div, span, etc.), criar representação simples
          const genericFrame = figma.createFrame();
          genericFrame.name = child.tagName;
          genericFrame.layoutMode = "VERTICAL";
          genericFrame.primaryAxisSizingMode = "AUTO";
          genericFrame.counterAxisSizingMode = "AUTO";
          genericFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
          genericFrame.paddingLeft = 8;
          genericFrame.paddingRight = 8;
          genericFrame.paddingTop = 8;
          genericFrame.paddingBottom = 8;
          
          // Adicionar texto de label
          const labelText = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          labelText.characters = child.tagName;
          labelText.fontSize = 12;
          genericFrame.appendChild(labelText);
          
          frame.appendChild(genericFrame);
        }
      } catch (error) {
        console.error(`Erro ao processar filho (${child.tagName}):`, error);
      }
    }
  }
  
  return frame;
}