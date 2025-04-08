import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

// Configuração compartilhada para desenvolvimento e produção
const commonConfig = {
  plugins: [
    // Resolver módulos de node_modules
    resolve(),
    
    // Converter módulos CommonJS para ES
    commonjs(),
    
    // Compilar TypeScript
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: process.env.NODE_ENV !== 'production'
    })
  ]
};

// Configuração para produção
const productionPlugins = [
  // Minificar apenas em produção
  terser({
    format: {
      comments: false
    },
    compress: {
      drop_console: false, // Mantém console.logs para diagnóstico
      drop_debugger: true
    }
  })
];

// Adicionar plugins de produção se ambiente for production
if (process.env.NODE_ENV === 'production') {
  commonConfig.plugins = [...commonConfig.plugins, ...productionPlugins];
}

// Configuração para o código principal (código do plugin)
const mainConfig = {
  ...commonConfig,
  input: 'src/code.ts',
  output: {
    file: 'dist/code.js',
    format: 'iife', // Immediately Invoked Function Expression
    sourcemap: process.env.NODE_ENV !== 'production'
  }
};

// Exportar configuração
export default [mainConfig];