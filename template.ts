import { parse } from 'node-html-parser';
import { QuasarNode } from '../types/settings';

/**
 * Extrai o conteúdo HTML do template de um componente Vue
 */
export function extractTemplateContent(code: string): string {
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
  
  if (!templateMatch) {
    throw new Error("Não foi possível encontrar a seção <template> no código");
  }
  
  return templateMatch[1].trim();
}

/**
 * Processa o HTML para criar uma árvore de nós Quasar
 */
export function parseQuasarTemplate(html: string): QuasarNode {
  const root = parse(html);
  
  // Converter para o nosso formato QuasarNode
  function processNode(node: any): QuasarNode {
    // Ignorar nós de texto vazios
    if (node.nodeType === 3 && node.text.trim() === '') {
      return null;
    }
    
    // Processar nó de texto
    if (node.nodeType === 3) {
      return {
        tagName: '#text',
        attributes: {},
        childNodes: [],
        text: node.text.trim()
      };
    }
    
    // Processar nó de elemento
    const attributes: QuasarNodeAttributes = {};
    
    if (node.attributes) {
      Object.entries(node.attributes).forEach(([key, value]) => {
        attributes[key] = value as string;
      });
    }
    
    const childNodes: QuasarNode[] = [];
    
    if (node.childNodes) {
      node.childNodes.forEach((child: any) => {
        const processedChild = processNode(child);
        if (processedChild) {
          childNodes.push(processedChild);
        }
      });
    }
    
    return {
      tagName: node.tagName.toLowerCase(),
      attributes,
      childNodes,
      text: node.text ? node.text.trim() : undefined
    };
  }
  
  // Encontrar o primeiro elemento real (ignorando comentários e textos vazios)
  let mainElement = root.childNodes.find((node) => 
    node.nodeType === 1 // É um elemento
  );
  
  if (!mainElement) {
    throw new Error("Não foi possível encontrar um elemento válido no template");
  }
  
  return processNode(mainElement);
}

/**
 * Gera uma representação em string da estrutura do nó para debug
 */
export function generateNodeStructure(node: QuasarNode, level: number = 0): string {
  const indent = '  '.repeat(level);
  let result = `${indent}${node.tagName}`;
  
  if (Object.keys(node.attributes).length > 0) {
    const attrString = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    result += ` (${attrString})`;
  }
  
  result += '\n';
  
  if (node.text) {
    result += `${indent}  "${node.text}"\n`;
  }
  
  for (const child of node.childNodes) {
    result += generateNodeStructure(child, level + 1);
  }
  
  return result;
}