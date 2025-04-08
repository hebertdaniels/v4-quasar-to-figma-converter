import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/code.ts',
    output: {
      file: 'dist/code.js',
      format: 'iife'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  }
];