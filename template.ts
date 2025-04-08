import { parse } from 'node-html-parser';
import { QuasarNode } from '../types/settings';

// Interface para representar a estrutura da AST (árvore de sintaxe abstrata)
interface ASTNode {
  nodeType: number;
  tagName?: string;
  rawTagName?: string;
  childNodes?: ASTNode[];
  rawAttrs?: string;
  text?: string;
  attributes?: Record<string, string>;
}

/**
 * Extrai o conteúdo do template de um componente Vue
 * Função simplificada para uso direto
 */
export function extractTemplateContent(code: string): string {
  return TemplateParser.extractTemplateContent(code);
}

/**
 * Analisa um template HTML e retorna uma árvore de nós Quasar
 * Função simplificada para uso direto
 */
export function parseQuasarTemplate(html: string): QuasarNode {
  return TemplateParser.parseQuasarTemplate(html);
}

/**
 * Classe Parser de Templates Vue/Quasar
 * Responsável por analisar o HTML e converter para uma estrutura de nós utilizável
 */
export class TemplateParser {
  /**
   * Extrai o conteúdo HTML do template de um componente Vue
   */
  public static extractTemplateContent(code: string): string {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    
    if (!templateMatch) {
      throw new Error("Não foi possível encontrar a seção <template> no código");
    }
    
    return templateMatch[1].trim();
  }
  
  /**
   * Analisa o HTML e cria uma árvore de nós Quasar
   */
  public static parseQuasarTemplate(html: string): QuasarNode {
    try {
      // Usar node-html-parser para analisar o HTML
      const root = parse(html);
      
      // Converter para nosso formato QuasarNode
      return this.convertToQuasarNode(root.firstChild);
    } catch (error) {
      console.error('Erro ao analisar template HTML:', error);
      throw new Error(`Falha ao analisar o template HTML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Converte um nó da AST para o formato QuasarNode
   */
  private static convertToQuasarNode(node: any): QuasarNode {
    // Verificar se o nó é válido
    if (!node) {
      throw new Error('Nó inválido: nulo ou indefinido');
    }
    
    // Tratar nós de texto
    if (node.nodeType === 3) {
      return {
        tagName: '#text',
        attributes: {},
        childNodes: [],
        text: node.text ? node.text.trim() : ''
      };
    }
    
    // Processar atributos
    const attributes: Record<string, string> = {};
    if (node.attributes) {
      Object.entries(node.attributes).forEach(([key, value]) => {
        attributes[key] = value as string;
      });
    }
    
    // Processar atributos especiais do Vue
    // Converte v-bind:prop ou :prop para prop como atributo
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('v-bind:') || key.startsWith(':')) {
        const propName = key.startsWith(':') ? key.substring(1) : key.substring(7);
        attributes[propName] = value;
      }
    }
    
    // Processar filhos recursivamente
    const childNodes: QuasarNode[] = [];
    if (node.childNodes && node.childNodes.length > 0) {
      node.childNodes.forEach((child: any) => {
        // Ignorar nós de texto vazios
        if (child.nodeType === 3 && (!child.text || !child.text.trim())) {
          return;
        }
        
        try {
          const quasarChild = this.convertToQuasarNode(child);
          childNodes.push(quasarChild);
        } catch (error) {
          console.warn('Erro ao converter nó filho:', error);
        }
      });
    }
    
    // Construir o nó Quasar
    return {
      tagName: node.tagName ? node.tagName.toLowerCase() : '#unknown',
      attributes,
      childNodes,
      text: node.text ? node.text.trim() : undefined
    };
  }
  
  /**
   * Gera uma representação em texto da estrutura do nó para debug
   */
  public static generateNodeStructure(node: QuasarNode, level: number = 0): string {
    const indent = '  '.repeat(level);
    let result = `${indent}${node.tagName}`;
    
    // Adicionar atributos
    if (Object.keys(node.attributes).length > 0) {
      const attrString = Object.entries(node.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      result += ` (${attrString})`;
    }
    
    result += '\n';
    
    // Adicionar texto se existir
    if (node.text) {
      result += `${indent}  "${node.text}"\n`;
    }
    
    // Processar filhos recursivamente
    for (const child of node.childNodes) {
      result += this.generateNodeStructure(child, level + 1);
    }
    
    return result;
  }
  
  /**
   * Encontra o primeiro nó com a tag especificada
   */
  public static findNodeByTag(rootNode: QuasarNode, tagName: string): QuasarNode | null {
    if (rootNode.tagName.toLowerCase() === tagName.toLowerCase()) {
      return rootNode;
    }
    
    for (const child of rootNode.childNodes) {
      const result = this.findNodeByTag(child, tagName);
      if (result) {
        return result;
      }
    }
    
    return null;
  }
  
  /**
   * Encontra todos os nós com a tag especificada
   */
  public static findNodesByTag(rootNode: QuasarNode, tagName: string): QuasarNode[] {
    const results: QuasarNode[] = [];
    
    if (rootNode.tagName.toLowerCase() === tagName.toLowerCase()) {
      results.push(rootNode);
    }
    
    for (const child of rootNode.childNodes) {
      const childResults = this.findNodesByTag(child, tagName);
      results.push(...childResults);
    }
    
    return results;
  }
  
  /**
   * Valida se um nó tem a estrutura esperada de um elemento Quasar
   */
  public static validateQuasarNode(node: QuasarNode): boolean {
    // Verificações básicas de estrutura
    if (!node.tagName) return false;
    if (!node.attributes) return false;
    if (!Array.isArray(node.childNodes)) return false;
    
    // Verificar se é um componente Quasar válido (começa com q-)
    const isQuasarComponent = node.tagName.toLowerCase().startsWith('q-');
    
    // Verificar se é um nó de texto válido
    const isTextNode = node.tagName === '#text' && typeof node.text === 'string';
    
    // Verificar se é um elemento HTML válido
    const isHtmlElement = !node.tagName.startsWith('#');
    
    return isQuasarComponent || isTextNode || isHtmlElement;
  }
}