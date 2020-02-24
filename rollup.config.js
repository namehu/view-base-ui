import vue from 'rollup-plugin-vue'
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import clear from 'rollup-plugin-clear';
import scss from 'rollup-plugin-scss';

const extensions = ['.js', '.vue', '.ts'];
const babelConfig = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry"
      }
    ],
    '@babel/typescript'
  ],
  plugins: [
    ["@babel/proposal-decorators", { "legacy": true }],
    ["@babel/proposal-class-properties", { "loose": true }],
  ],
};



const basePlugins = [
  resolve({ extensions }),
  babel({ ...babelConfig, extensions, exclude: 'node_modules/**', }),
  common(),
  terser(),
];

const base = {
  input: 'src/index.ts',
  external: ['view-design', 'vue', 'vue-property-decorator', 'vue-class-component'],
}

export default [
  {
    ...base,
    output: { file: 'dist/view-base-ui.umd.js', format: 'umd', name: 'ViewBaseUI' },
    plugins: [
      clear({ targets: ['dist'] }),
      vue({ css: false }),
      scss({ output: false }),
      ...basePlugins,
    ]
  },
  {
    ...base,
    output: { file: 'dist/view-base-ui.esm.js', format: 'esm' },
    plugins: [
      vue(),
      ...basePlugins,
    ]
  },
  {
    ...base,
    output: { file: 'dist/view-base-ui.min.js', format: 'iife', name: 'ViewBaseUI' },
    plugins: [
      vue({ css: false }),
      scss({ output: true }),
      ...basePlugins,
    ]
  }
]