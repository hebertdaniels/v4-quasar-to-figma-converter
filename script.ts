/**
 * Extrai informações da seção script do componente Vue
 */
export function extractScriptInfo(code: string) {
    const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
    
    if (!scriptMatch) {
      return {
        name: 'QuasarComponent',
        props: []
      };
    }
    
    const scriptContent = scriptMatch[1].trim();
    
    // Extrair nome do componente
    const nameMatch = scriptContent.match(/name:\s*['"]([^'"]+)['"]/);
    const name = nameMatch ? nameMatch[1] : 'QuasarComponent';
    
    // Extrair props (simplificado)
    const propsMatch = scriptContent.match(/props:\s*{([^}]+)}/);
    const props = propsMatch ? extractProps(propsMatch[1]) : [];
    
    return {
      name,
      props
    };
  }
  
  /**
   * Extrai props definidas no componente
   */
  function extractProps(propsString: string) {
    const props = [];
    const propRegex = /(\w+):\s*{([^}]+)}/g;
    let match;
    
    while ((match = propRegex.exec(propsString)) !== null) {
      const propName = match[1];
      const propDefinition = match[2];
      
      const typeMatch = propDefinition.match(/type:\s*(\w+)/);
      const defaultMatch = propDefinition.match(/default:\s*(?:['"]([^'"]+)['"]|(\w+))/);
      const requiredMatch = propDefinition.match(/required:\s*(\w+)/);
      
      props.push({
        name: propName,
        type: typeMatch ? typeMatch[1] : null,
        default: defaultMatch ? (defaultMatch[1] || defaultMatch[2]) : null,
        required: requiredMatch ? requiredMatch[1] === 'true' : false
      });
    }
    
    return props;
  }