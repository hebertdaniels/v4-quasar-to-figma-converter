import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps, findChildByTagName } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';
import { processCardComponent } from './card-component';

/**
 * Processa componentes de layout do Quasar
 */
export async function processLayoutComponents(node: QuasarNode, layoutType: string, settings: PluginSettings): Promise<FrameNode> {
  switch (layoutType) {
    case 'app-layout-with-drawer':
    case 'app-layout':
    case 'basic-layout':
      return await processAppLayout(node, layoutType === 'app-layout-with-drawer', settings);
      
    case 'page-only':
      return await processPage(node, settings);
      
    case 'tabs-layout':
      return await processTabsLayout(node, settings);
      
    case 'card-layout':
      return await processCardComponent(node, settings);
      
    case 'list-layout':
      return await processListLayout(node, settings);
      
    default:
      // Layout genérico
      const fallbackFrame = figma.createFrame();
      fallbackFrame.name = node.tagName || "layout-component";
      fallbackFrame.layoutMode = "VERTICAL";
      fallbackFrame.primaryAxisSizingMode = "AUTO";
      fallbackFrame.counterAxisSizingMode = "AUTO";
      
      const textNode = await createText(`Layout ${layoutType}`);
      fallbackFrame.appendChild(textNode);
      
      return fallbackFrame;
  }
}

/**
 * Processa um layout de aplicação
 */
async function processAppLayout(node: QuasarNode, hasDrawer: boolean, settings: PluginSettings): Promise<FrameNode> {
  const layoutFrame = figma.createFrame();
  layoutFrame.name = "q-layout";
  
  // Configurações básicas
  layoutFrame.layoutMode = "VERTICAL";
  layoutFrame.primaryAxisSizingMode = "FIXED";
  layoutFrame.counterAxisSizingMode = "FIXED";
  layoutFrame.width = 1024;
  layoutFrame.height = 768;
  layoutFrame.itemSpacing = 0;
  layoutFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  
  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Procurar componentes específicos
  const headerNode = findChildByTagName(node, 'q-header');
  const footerNode = findChildByTagName(node, 'q-footer');
  const drawerNode = findChildByTagName(node, 'q-drawer');
  const pageNode = findChildByTagName(node, 'q-page');
  
  // Adicionar header se existe
  if (headerNode) {
    const headerFrame = await processHeader(headerNode, settings);
    layoutFrame.appendChild(headerFrame);
  }
  
  // Criar container para conteúdo principal (drawer + page)
  const contentContainer = figma.createFrame();
  contentContainer.name = "content-container";
  contentContainer.layoutMode = "HORIZONTAL";
  contentContainer.primaryAxisSizingMode = "FIXED";
  contentContainer.counterAxisSizingMode = "FIXED";
  contentContainer.width = 1024;
  contentContainer.height = headerNode && footerNode 
    ? 688 // Ajuste para acomodar header e footer (ambos de 40px)
    : headerNode || footerNode 
      ? 728 // Ajuste para acomodar header ou footer
      : 768; // Altura total
  contentContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  contentContainer.itemSpacing = 0;
  
  // Adicionar drawer se solicitado ou se existir no nó
  if (hasDrawer || drawerNode) {
    const drawerComponent = drawerNode 
      ? await processDrawer(drawerNode, settings) 
      : await createGenericDrawer(settings);
    
    contentContainer.appendChild(drawerComponent);
  }
  
  // Adicionar página
  const pageComponent = pageNode 
    ? await processPage(pageNode, settings) 
    : await createGenericPage(settings);
  
  // Ajustar tamanho da página baseado na presença do drawer
  if (hasDrawer || drawerNode) {
    // Reduz a largura para acomodar o drawer
    pageComponent.resize(
      1024 - 256, // Drawer com 256px
      pageComponent.height
    );
  }
  
  contentContainer.appendChild(pageComponent);
  layoutFrame.appendChild(contentContainer);
  
  // Adicionar footer se existe
  if (footerNode) {
    const footerFrame = await processFooter(footerNode, settings);
    layoutFrame.appendChild(footerFrame);
  }
  
  return layoutFrame;
}

/**
 * Processa um header
 */
async function processHeader(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const headerFrame = figma.createFrame();
  headerFrame.name = "q-header";
  
  // Configurações básicas
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "FIXED";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.width = 1024;
  headerFrame.height = 40;
  headerFrame.paddingLeft = 16;
  headerFrame.paddingRight = 16;
  headerFrame.paddingTop = 8;
  headerFrame.paddingBottom = 8;
  headerFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerFrame.counterAxisAlignItems = "CENTER";
  
  // Cor padrão
  headerFrame.fills = [{ type: 'SOLID', color: quasarColors.primary }];
  
  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Aplicar cor específica se fornecida
  if (props.color && quasarColors[props.color] && settings.preserveQuasarColors) {
    headerFrame.fills = [{ type: 'SOLID', color: quasarColors[props.color] }];
  }
  
  // Procurar por toolbar
  const toolbarNode = findChildByTagName(node, 'q-toolbar');
  
  if (toolbarNode) {
    // Processar toolbar
    const toolbarFrame = await processToolbar(toolbarNode, settings);
    headerFrame.appendChild(toolbarFrame);
  } else {
    // Título simples
    const headerText = await createText("App Header", {
      color: { r: 1, g: 1, b: 1 },
      fontSize: 18
    });
    headerFrame.appendChild(headerText);
    
    // Ações fictícias
    const actionsFrame = figma.createFrame();
    actionsFrame.name = "header-actions";
    actionsFrame.layoutMode = "HORIZONTAL";
    actionsFrame.primaryAxisSizingMode = "AUTO";
    actionsFrame.counterAxisSizingMode = "AUTO";
    actionsFrame.itemSpacing = 8;
    actionsFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
    
    headerFrame.appendChild(actionsFrame);
  }
  
  return headerFrame;
}

/**
 * Processa uma toolbar
 */
async function processToolbar(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const toolbarFrame = figma.createFrame();
  toolbarFrame.name = "q-toolbar";
  
  // Configurações básicas
  toolbarFrame.layoutMode = "HORIZONTAL";
  toolbarFrame.primaryAxisSizingMode = "FIXED";
  toolbarFrame.counterAxisSizingMode = "AUTO";
  toolbarFrame.width = 992; // 1024 - 16*2 (padding do header)
  toolbarFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
  toolbarFrame.counterAxisAlignItems = "CENTER";
  toolbarFrame.itemSpacing = 8;
  toolbarFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
  
  // Título
  const titleNode = findChildByTagName(node, 'q-toolbar-title');
  
  if (titleNode) {
    // Extrair texto do título
    let titleText = "App Title";
    
    if (titleNode.childNodes) {
      for (const child of titleNode.childNodes) {
        if (child.text) {
          titleText = child.text.trim();
          break;
        }
      }
    }
    
    const titleComponent = await createText(titleText, {
      color: { r: 1, g: 1, b: 1 },
      fontSize: 18,
      fontWeight: 'medium'
    });
    toolbarFrame.appendChild(titleComponent);
  } else {
    // Título genérico
    const defaultTitle = await createText("App Title", {
      color: { r: 1, g: 1, b: 1 },
      fontSize: 18,
      fontWeight: 'medium'
    });
    toolbarFrame.appendChild(defaultTitle);
  }
  
  // Processar outros elementos da toolbar
  let hasActions = false;
  
  for (const child of node.childNodes) {
    if (!child.tagName || child.tagName === '#text' || child.tagName.toLowerCase() === 'q-toolbar-title') {
      continue;
    }
    
    // Tentar processar como action
    hasActions = true;
    
    // Processar ícones, botões, etc.
    // Implementação simplificada para demonstração
  }
  
  // Se não encontrou ações, adicionar ações simuladas
  if (!hasActions) {
    const actionsFrame = figma.createFrame();
    actionsFrame.name = "toolbar-actions";
    actionsFrame.layoutMode = "HORIZONTAL";
    actionsFrame.primaryAxisSizingMode = "AUTO";
    actionsFrame.counterAxisSizingMode = "AUTO";
    actionsFrame.itemSpacing = 8;
    actionsFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
    
    // Adicionar ícone genérico
    const menuButton = figma.createFrame();
    menuButton.name = "menu-button";
    menuButton.layoutMode = "HORIZONTAL";
    menuButton.primaryAxisSizingMode = "AUTO";
    menuButton.counterAxisSizingMode = "AUTO";
    menuButton.primaryAxisAlignItems = "CENTER";
    menuButton.counterAxisAlignItems = "CENTER";
    menuButton.paddingLeft = 8;
    menuButton.paddingRight = 8;
    menuButton.paddingTop = 8;
    menuButton.paddingBottom = 8;
    menuButton.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
    
    const menuIcon = await createText("≡", {
      fontSize: 20,
      color: { r: 1, g: 1, b: 1 },
      alignment: 'CENTER',
      verticalAlignment: 'CENTER'
    });
    menuButton.appendChild(menuIcon);
    
    actionsFrame.appendChild(menuButton);
    toolbarFrame.appendChild(actionsFrame);
  }
  
  return toolbarFrame;
}

//**
* Processa um footer
*/
async function processFooter(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 const footerFrame = figma.createFrame();
 footerFrame.name = "q-footer";
 
 // Configurações básicas
 footerFrame.layoutMode = "HORIZONTAL";
 footerFrame.primaryAxisSizingMode = "FIXED";
 footerFrame.counterAxisSizingMode = "AUTO";
 footerFrame.width = 1024;
 footerFrame.height = 40;
 footerFrame.paddingLeft = 16;
 footerFrame.paddingRight = 16;
 footerFrame.paddingTop = 8;
 footerFrame.paddingBottom = 8;
 footerFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
 footerFrame.counterAxisAlignItems = "CENTER";
 
 // Cor padrão
 footerFrame.fills = [{ type: 'SOLID', color: quasarColors.dark }];
 
 // Extrair propriedades
 const { props, styles } = extractStylesAndProps(node);
 
 // Aplicar cor específica se fornecida
 if (props.color && quasarColors[props.color] && settings.preserveQuasarColors) {
   footerFrame.fills = [{ type: 'SOLID', color: quasarColors[props.color] }];
 }
 
 // Texto genérico de rodapé
 const footerText = await createText("© 2025 My App", {
   color: { r: 1, g: 1, b: 1 }
 });
 footerFrame.appendChild(footerText);
 
 return footerFrame;
}

/**
* Processa um drawer
*/
async function processDrawer(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 const drawerFrame = figma.createFrame();
 drawerFrame.name = "q-drawer";
 
 // Configurações básicas
 drawerFrame.layoutMode = "VERTICAL";
 drawerFrame.primaryAxisSizingMode = "FIXED";
 drawerFrame.counterAxisSizingMode = "FIXED";
 drawerFrame.width = 256;
 drawerFrame.height = 700; // Será ajustado com base no container pai
 drawerFrame.itemSpacing = 0;
 drawerFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Adicionar sombra
 drawerFrame.effects = [
   {
     type: 'DROP_SHADOW',
     color: { r: 0, g: 0, b: 0, a: 0.1 },
     offset: { x: 2, y: 0 },
     radius: 4,
     visible: true,
     blendMode: 'NORMAL'
   }
 ];
 
 // Extrair propriedades
 const { props, styles } = extractStylesAndProps(node);
 
 // Processar lista se existir
 const listNode = findChildByTagName(node, 'q-list');
 
 if (listNode) {
   const listFrame = await processQList(listNode, settings);
   drawerFrame.appendChild(listFrame);
 } else {
   // Criar uma lista genérica
   const listFrame = figma.createFrame();
   listFrame.name = "q-list";
   listFrame.layoutMode = "VERTICAL";
   listFrame.primaryAxisSizingMode = "AUTO";
   listFrame.counterAxisSizingMode = "FIXED";
   listFrame.width = 256;
   listFrame.itemSpacing = 0;
   listFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
   
   // Adicionar itens de exemplo
   const menuItems = ["Home", "Perfil", "Configurações", "Sobre"];
   
   for (const itemText of menuItems) {
     const itemFrame = figma.createFrame();
     itemFrame.name = "q-item";
     itemFrame.layoutMode = "HORIZONTAL";
     itemFrame.primaryAxisSizingMode = "FIXED";
     itemFrame.counterAxisSizingMode = "AUTO";
     itemFrame.width = 256;
     itemFrame.paddingLeft = 16;
     itemFrame.paddingRight = 16;
     itemFrame.paddingTop = 12;
     itemFrame.paddingBottom = 12;
     itemFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
     itemFrame.counterAxisAlignItems = "CENTER";
     itemFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
     
     const textNode = await createText(itemText, {
       color: { r: 0, g: 0, b: 0 }
     });
     itemFrame.appendChild(textNode);
     listFrame.appendChild(itemFrame);
   }
   
   drawerFrame.appendChild(listFrame);
 }
 
 return drawerFrame;
}

/**
* Cria um drawer genérico
*/
async function createGenericDrawer(settings: PluginSettings): Promise<FrameNode> {
 const drawerFrame = figma.createFrame();
 drawerFrame.name = "q-drawer";
 
 // Configurações básicas
 drawerFrame.layoutMode = "VERTICAL";
 drawerFrame.primaryAxisSizingMode = "FIXED";
 drawerFrame.counterAxisSizingMode = "FIXED";
 drawerFrame.width = 256;
 drawerFrame.height = 700;
 drawerFrame.itemSpacing = 0;
 drawerFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Adicionar sombra
 drawerFrame.effects = [
   {
     type: 'DROP_SHADOW',
     color: { r: 0, g: 0, b: 0, a: 0.1 },
     offset: { x: 2, y: 0 },
     radius: 4,
     visible: true,
     blendMode: 'NORMAL'
   }
 ];
 
 // Título do drawer
 const drawerHeader = figma.createFrame();
 drawerHeader.name = "drawer-header";
 drawerHeader.layoutMode = "HORIZONTAL";
 drawerHeader.primaryAxisSizingMode = "FIXED";
 drawerHeader.counterAxisSizingMode = "AUTO";
 drawerHeader.width = 256;
 drawerHeader.paddingLeft = 16;
 drawerHeader.paddingRight = 16;
 drawerHeader.paddingTop = 16;
 drawerHeader.paddingBottom = 16;
 drawerHeader.primaryAxisAlignItems = "CENTER";
 drawerHeader.fills = [{ type: 'SOLID', color: quasarColors.primary }];
 
 const headerText = await createText("Menu", {
   fontSize: 18,
   fontWeight: 'medium',
   color: { r: 1, g: 1, b: 1 }
 });
 drawerHeader.appendChild(headerText);
 drawerFrame.appendChild(drawerHeader);
 
 // Lista de itens
 const listFrame = figma.createFrame();
 listFrame.name = "q-list";
 listFrame.layoutMode = "VERTICAL";
 listFrame.primaryAxisSizingMode = "AUTO";
 listFrame.counterAxisSizingMode = "FIXED";
 listFrame.width = 256;
 listFrame.itemSpacing = 0;
 listFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Adicionar itens de exemplo
 const menuItems = ["Home", "Perfil", "Configurações", "Sobre"];
 
 for (const itemText of menuItems) {
   const itemFrame = figma.createFrame();
   itemFrame.name = "q-item";
   itemFrame.layoutMode = "HORIZONTAL";
   itemFrame.primaryAxisSizingMode = "FIXED";
   itemFrame.counterAxisSizingMode = "AUTO";
   itemFrame.width = 256;
   itemFrame.paddingLeft = 16;
   itemFrame.paddingRight = 16;
   itemFrame.paddingTop = 12;
   itemFrame.paddingBottom = 12;
   itemFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
   itemFrame.counterAxisAlignItems = "CENTER";
   itemFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
   
   const textNode = await createText(itemText, {
     color: { r: 0, g: 0, b: 0 }
   });
   itemFrame.appendChild(textNode);
   listFrame.appendChild(itemFrame);
 }
 
 drawerFrame.appendChild(listFrame);
 
 return drawerFrame;
}

/**
* Processa uma página
*/
async function processPage(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 const pageFrame = figma.createFrame();
 pageFrame.name = "q-page";
 
 // Configurações básicas
 pageFrame.layoutMode = "VERTICAL";
 pageFrame.primaryAxisSizingMode = "AUTO";
 pageFrame.counterAxisSizingMode = "FIXED";
 pageFrame.width = 1024;
 pageFrame.paddingLeft = 24;
 pageFrame.paddingRight = 24;
 pageFrame.paddingTop = 24;
 pageFrame.paddingBottom = 24;
 pageFrame.itemSpacing = 16;
 pageFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Extrair propriedades
 const { props, styles } = extractStylesAndProps(node);
 
 // Processar conteúdo da página
 for (const child of node.childNodes) {
   if (!child.tagName || child.tagName === '#text') continue;
   
   const childTag = child.tagName.toLowerCase();
   
   try {
     let childComponent: FrameNode | null = null;
     
     // Processar componentes específicos
     if (childTag === 'q-card') {
       childComponent = await processCardComponent(child, settings);
     } 
     else if (childTag === 'q-btn') {
       // Importar o processador de botão
       const { processButtonComponent } = require('../form/button-component');
       childComponent = await processButtonComponent(child, settings);
     }
     else {
       // Tentar processar outros componentes
       // Importando processamento genérico aqui
       const { processGenericComponent } = require('../converter');
       childComponent = await processGenericComponent(child, settings);
     }
     
     if (childComponent) {
       pageFrame.appendChild(childComponent);
     }
   } catch (error) {
     console.error(`Erro ao processar filho da página (${childTag}):`, error);
   }
 }
 
 // Se não houver conteúdo, adicionar conteúdo de exemplo
 if (pageFrame.children.length === 0) {
   const contentText = await createText("Conteúdo da Página", {
     fontSize: 16
   });
   pageFrame.appendChild(contentText);
 }
 
 return pageFrame;
}

/**
* Cria uma página genérica
*/
async function createGenericPage(settings: PluginSettings): Promise<FrameNode> {
 const pageFrame = figma.createFrame();
 pageFrame.name = "q-page";
 
 // Configurações básicas
 pageFrame.layoutMode = "VERTICAL";
 pageFrame.primaryAxisSizingMode = "AUTO";
 pageFrame.counterAxisSizingMode = "FIXED";
 pageFrame.width = 1024;
 pageFrame.paddingLeft = 24;
 pageFrame.paddingRight = 24;
 pageFrame.paddingTop = 24;
 pageFrame.paddingBottom = 24;
 pageFrame.itemSpacing = 16;
 pageFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Título da página
 const pageTitle = await createText("Título da Página", {
   fontSize: 24,
   fontWeight: 'bold'
 });
 pageFrame.appendChild(pageTitle);
 
 // Subtítulo da página
 const pageSubtitle = await createText("Subtítulo com descrição da página e seus recursos", {
   fontSize: 16,
   color: { r: 0.5, g: 0.5, b: 0.5 }
 });
 pageFrame.appendChild(pageSubtitle);
 
 // Adicionar um card de exemplo
 const cardFrame = figma.createFrame();
 cardFrame.name = "q-card";
 cardFrame.layoutMode = "VERTICAL";
 cardFrame.primaryAxisSizingMode = "AUTO";
 cardFrame.counterAxisSizingMode = "AUTO";
 cardFrame.cornerRadius = 4;
 cardFrame.itemSpacing = 0;
 cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Adicionar sombra ao card
 cardFrame.effects = [{
   type: 'DROP_SHADOW',
   color: { r: 0, g: 0, b: 0, a: 0.2 },
   offset: { x: 0, y: 2 },
   radius: 4,
   visible: true,
   blendMode: 'NORMAL'
 }];
 
 // Seção do card
 const sectionFrame = figma.createFrame();
 sectionFrame.name = "q-card-section";
 sectionFrame.layoutMode = "VERTICAL";
 sectionFrame.primaryAxisSizingMode = "AUTO";
 sectionFrame.counterAxisSizingMode = "AUTO";
 sectionFrame.paddingLeft = 16;
 sectionFrame.paddingRight = 16;
 sectionFrame.paddingTop = 16;
 sectionFrame.paddingBottom = 16;
 sectionFrame.itemSpacing = 4;
 sectionFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 const titleText = await createText("Card de Exemplo", {
   fontSize: 16,
   fontWeight: 'bold'
 });
 sectionFrame.appendChild(titleText);
 
 const subtitleText = await createText("Descrição do card", {
   fontSize: 14,
   color: { r: 0.6, g: 0.6, b: 0.6 }
 });
 sectionFrame.appendChild(subtitleText);
 
 cardFrame.appendChild(sectionFrame);
 pageFrame.appendChild(cardFrame);
 
 return pageFrame;
}

/**
* Processa um layout de tabs
*/
async function processTabsLayout(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 const tabsContainer = figma.createFrame();
 tabsContainer.name = "tabs-container";
 tabsContainer.layoutMode = "VERTICAL";
 tabsContainer.primaryAxisSizingMode = "AUTO";
 tabsContainer.counterAxisSizingMode = "FIXED";
 tabsContainer.width = 400;
 tabsContainer.itemSpacing = 0;
 tabsContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Extrair propriedades
 const { props, styles } = extractStylesAndProps(node);
 
 // Procurar por tabs e paineis
 const tabsNode = findChildByTagName(node, 'q-tabs') || node;
 const tabPanelsNode = findChildByTagName(node, 'q-tab-panels');
 
 // Criar header de tabs
 const tabsFrame = figma.createFrame();
 tabsFrame.name = "q-tabs";
 tabsFrame.layoutMode = "HORIZONTAL";
 tabsFrame.primaryAxisSizingMode = "FIXED";
 tabsFrame.counterAxisSizingMode = "AUTO";
 tabsFrame.width = 400;
 tabsFrame.itemSpacing = 0;
 tabsFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Processar tabs individuais
 const tabTitles: string[] = [];
 let hasProcessedTabs = false;
 
 if (tabsNode && tabsNode.childNodes) {
   for (const child of tabsNode.childNodes) {
     if (!child.tagName || child.tagName.toLowerCase() !== 'q-tab') continue;
     
     hasProcessedTabs = true;
     const tabProps = extractStylesAndProps(child).props;
     let tabLabel = tabProps.label || "Tab";
     
     // Se não tem label, tentar extrair do conteúdo
     if (!tabProps.label && child.childNodes) {
       for (const textNode of child.childNodes) {
         if (textNode.text) {
           tabLabel = textNode.text.trim();
           break;
         }
       }
     }
     
     tabTitles.push(tabLabel);
     
     // Criar tab
     const tabFrame = figma.createFrame();
     tabFrame.name = "q-tab";
     tabFrame.layoutMode = "HORIZONTAL";
     tabFrame.primaryAxisSizingMode = "FIXED";
     tabFrame.counterAxisSizingMode = "AUTO";
     tabFrame.width = 400 / Math.max(1, tabTitles.length);
     tabFrame.paddingLeft = 16;
     tabFrame.paddingRight = 16;
     tabFrame.paddingTop = 12;
     tabFrame.paddingBottom = 12;
     tabFrame.primaryAxisAlignItems = "CENTER";
     tabFrame.counterAxisAlignItems = "CENTER";
     tabFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
     
     // Primeira tab ativa
     if (tabTitles.length === 1) {
       tabFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
       tabFrame.strokes = [{type: 'SOLID', color: quasarColors.primary}];
       tabFrame.strokeBottomWeight = 2;
     }
     
     const tabTextNode = await createText(tabLabel);
     tabFrame.appendChild(tabTextNode);
     tabsFrame.appendChild(tabFrame);
   }
 }
 
 // Se não processou nenhuma tab, criar tabs genéricas
 if (!hasProcessedTabs) {
   tabTitles.push("Tab 1", "Tab 2", "Tab 3");
   
   for (let i = 0; i < tabTitles.length; i++) {
     const tabFrame = figma.createFrame();
     tabFrame.name = "q-tab";
     tabFrame.layoutMode = "HORIZONTAL";
     tabFrame.primaryAxisSizingMode = "FIXED";
     tabFrame.counterAxisSizingMode = "AUTO";
     tabFrame.width = 400 / tabTitles.length;
     tabFrame.paddingLeft = 16;
     tabFrame.paddingRight = 16;
     tabFrame.paddingTop = 12;
     tabFrame.paddingBottom = 12;
     tabFrame.primaryAxisAlignItems = "CENTER";
     tabFrame.counterAxisAlignItems = "CENTER";
     tabFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
     
     // Primeira tab ativa
     if (i === 0) {
       tabFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
       tabFrame.strokes = [{type: 'SOLID', color: quasarColors.primary}];
       tabFrame.strokeBottomWeight = 2;
     }
     
     const tabTextNode = await createText(tabTitles[i]);
     tabFrame.appendChild(tabTextNode);
     tabsFrame.appendChild(tabFrame);
   }
 }
 
 tabsContainer.appendChild(tabsFrame);
 
 // Criar painel de tab
 const tabPanelFrame = figma.createFrame();
 tabPanelFrame.name = "q-tab-panel";
 tabPanelFrame.layoutMode = "VERTICAL";
 tabPanelFrame.primaryAxisSizingMode = "AUTO";
 tabPanelFrame.counterAxisSizingMode = "FIXED";
 tabPanelFrame.width = 400;
 tabPanelFrame.paddingLeft = 16;
 tabPanelFrame.paddingRight = 16;
 tabPanelFrame.paddingTop = 16;
 tabPanelFrame.paddingBottom = 16;
 tabPanelFrame.itemSpacing = 8;
 tabPanelFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Processar conteúdo do painel se disponível
 if (tabPanelsNode && tabPanelsNode.childNodes) {
   let foundPanel = false;
   
   for (const child of tabPanelsNode.childNodes) {
     if (!child.tagName || child.tagName.toLowerCase() !== 'q-tab-panel') continue;
     
     // Usar apenas o primeiro painel
     foundPanel = true;
     
     // Processar conteúdo do painel
     for (const panelChild of child.childNodes) {
       if (!panelChild.tagName) {
         if (panelChild.text && panelChild.text.trim()) {
           const textNode = await createText(panelChild.text.trim());
           tabPanelFrame.appendChild(textNode);
         }
         continue;
       }
       
       // Tentar processar componentes no painel
       try {
         // Importando processamento genérico aqui
         const { processGenericComponent } = require('../converter');
         const childComponent = await processGenericComponent(panelChild, settings);
         if (childComponent) {
           tabPanelFrame.appendChild(childComponent);
         }
       } catch (error) {
         console.error(`Erro ao processar conteúdo do painel de tab:`, error);
       }
     }
     
     // Apenas o primeiro painel
     break;
   }
   
   // Se não encontrou nenhum painel
   if (!foundPanel) {
     const contentText = await createText(`Conteúdo da ${tabTitles[0] || "Tab 1"}`, {
       fontSize: 14
     });
     tabPanelFrame.appendChild(contentText);
   }
 } else {
   // Conteúdo genérico
   const contentText = await createText(`Conteúdo da ${tabTitles[0] || "Tab 1"}`, {
     fontSize: 14
   });
   tabPanelFrame.appendChild(contentText);
 }
 
 tabsContainer.appendChild(tabPanelFrame);
 
 return tabsContainer;
}

/**
* Processa um layout de lista
*/
async function processListLayout(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 // Verificar se o nó é diretamente uma q-list ou se contém uma
 const listNode = node.tagName.toLowerCase() === 'q-list' ? node : findChildByTagName(node, 'q-list');
 
 if (listNode) {
   return await processQList(listNode, settings);
 }
 
 // Fallback para o caso de não encontrar uma lista
 const fallbackFrame = figma.createFrame();
 fallbackFrame.name = "list-container";
 fallbackFrame.layoutMode = "VERTICAL";
 fallbackFrame.primaryAxisSizingMode = "AUTO";
 fallbackFrame.counterAxisSizingMode = "AUTO";
 
 const textNode = await createText("Lista não encontrada");
 fallbackFrame.appendChild(textNode);
 
 return fallbackFrame;
}

/**
* Processa um componente q-list
*/
async function processQList(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
 const listFrame = figma.createFrame();
 listFrame.name = "q-list";
 listFrame.layoutMode = "VERTICAL";
 listFrame.primaryAxisSizingMode = "AUTO";
 listFrame.counterAxisSizingMode = "AUTO";
 listFrame.itemSpacing = 0;
 listFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
 
 // Extrair propriedades
 const { props, styles } = extractStylesAndProps(node);
 
 // Processar itens de lista
 let hasItems = false;
 
 for (const child of node.childNodes) {
   if (!child.tagName || child.tagName === '#text') continue;
   
   const childTag = child.tagName.toLowerCase();
   
   if (childTag === 'q-item') {
     hasItems = true;
     
     // Processar item da lista
     const itemFrame = figma.createFrame();
     itemFrame.name = "q-item";
     itemFrame.layoutMode = "HORIZONTAL";
     itemFrame.primaryAxisSizingMode = "AUTO";
     itemFrame.counterAxisSizingMode = "AUTO";
     itemFrame.paddingLeft = 16;
     itemFrame.paddingRight = 16;
     itemFrame.paddingTop = 12;
     itemFrame.paddingBottom = 12;
     itemFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
     itemFrame.counterAxisAlignItems = "CENTER";
     itemFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
     
     // Processar conteúdo do item
     const itemContent = figma.createFrame();
     itemContent.name = "q-item__content";
     itemContent.layoutMode = "VERTICAL";
     itemContent.primaryAxisSizingMode = "AUTO";
     itemContent.counterAxisSizingMode = "AUTO";
     itemContent.itemSpacing = 4;
     itemContent.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
     
     // Processar sections dentro do item
     const sections = child.childNodes.filter(n => n.tagName && n.tagName.toLowerCase() === 'q-item-section');
     let hasSection = false;
     
     for (const section of sections) {
       hasSection = true;
       const sectionProps = extractStylesAndProps(section).props;
       
       // Extrair texto da seção
       let sectionText = "";
       if (section.childNodes) {
         for (const textNode of section.childNodes) {
           if (textNode.text) {
             sectionText += textNode.text.trim() + " ";
           }
         }
       }
       
       sectionText = sectionText.trim() || "Item Content";
       
       // Verificar se é header ou subtitle
       if (sectionProps.class && sectionProps.class.includes('q-item__section--main')) {
         const mainText = await createText(sectionText, {
           fontSize: 14
         });
         itemContent.appendChild(mainText);
       } else if (sectionProps.class && sectionProps.class.includes('q-item__section--side')) {
         // Processar seção lateral (ícones, etc.)
       } else {
         const text = await createText(sectionText);
         itemContent.appendChild(text);
       }
     }
     
     // Se não tem sections, criar conteúdo genérico
     if (!hasSection) {
       const genericText = await createText("Item Content");
       itemContent.appendChild(genericText);
     }
     
     itemFrame.appendChild(itemContent);
     listFrame.appendChild(itemFrame);
     
     // Adicionar separador se não for o último item
     if (child !== node.childNodes[node.childNodes.length - 1]) {
       const separator = figma.createRectangle();
       separator.name = "q-separator";
       separator.resize(300, 1);
       separator.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
       listFrame.appendChild(separator);
     }
   }
 }
 
 // Se não tem itens, criar alguns itens de exemplo
 if (!hasItems) {
   const exampleItems = ["Item 1", "Item 2", "Item 3"];
   
   for (let i = 0; i < exampleItems.length; i++) {
     const itemFrame = figma.createFrame();
     itemFrame.name = "q-item";
     itemFrame.layoutMode = "HORIZONTAL";
     itemFrame.primaryAxisSizingMode = "AUTO";
     itemFrame.counterAxisSizingMode = "AUTO";
     itemFrame.paddingLeft = 16;
     itemFrame.paddingRight = 16;
     itemFrame.paddingTop = 12;
     itemFrame.paddingBottom = 12;
     itemFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
     itemFrame.counterAxisAlignItems = "CENTER";
     itemFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
     
     const textNode = await createText(exampleItems[i]);
     itemFrame.appendChild(textNode);
     listFrame.appendChild(itemFrame);
     
     // Adicionar separador se não for o último item
     if (i < exampleItems.length - 1) {
       const separator = figma.createRectangle();
       separator.name = "q-separator";
       separator.resize(300, 1);
       separator.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
       listFrame.appendChild(separator);
     }
   }
 }
 
 return listFrame;
}