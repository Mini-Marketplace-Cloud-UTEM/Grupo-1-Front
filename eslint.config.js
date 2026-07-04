import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Config plana (ESLint 9). Reglas recomendadas de JS + React, ajustadas para
// no romper el CI con el codigo actual: lo que hoy no cumplimos queda como
// "warn" (no bloquea) y solo los errores reales tumban el build.
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      // Solo las dos reglas clasicas de hooks. No arrastramos el set completo
      // de react-hooks v7 porque incluye reglas nuevas (p.ej. set-state-in-effect)
      // que marcan como error patrones validos ya usados en el proyecto.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // El JSX transform de Vite no necesita React en scope.
      'react/react-in-jsx-scope': 'off',
      // No usamos prop-types (proyecto de curso, sin TS todavia).
      'react/prop-types': 'off',
      // Texto en espanol con comillas/apostrofes dentro del JSX: no molestar.
      'react/no-unescaped-entities': 'off',
      // Variables sin usar: aviso, no error.
      'no-unused-vars': 'warn',
    },
  },
];
