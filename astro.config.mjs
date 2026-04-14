// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import alpinejs from '@astrojs/alpinejs';

import node from '@astrojs/node';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@assets': '/src/assets',
        '@styles': '/src/styles',
        '@producto': '/src/components/Producto',
        '@general': '/src/components/General',
        '@categorias': '/src/components/Categorias',
        '@carrito': '/src/components/Carrito',
        '@utils': '/src/utils',
        '@api': '/src/pages/api'
      }
    }

  },

  integrations: [alpinejs(), react()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});