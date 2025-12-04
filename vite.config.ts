import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg', 'icons/icon-maskable.svg'],
          manifest: {
            name: 'Overlay',
            short_name: 'Overlay',
            description: 'Overlay - expérience de rencontre premium, responsive et alimentée par l’IA.',
            theme_color: '#32D583',
            background_color: '#010101',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            lang: 'fr-FR',
            categories: ['social', 'lifestyle'],
            icons: [
              {
                src: '/icons/icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: '/icons/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: '/icons/icon-maskable.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable'
              }
            ],
            shortcuts: [
              {
                name: 'Découvrir',
                short_name: 'Swipe',
                url: '/?view=swipe',
                description: 'Accéder rapidement aux cartes swipe'
              },
              {
                name: 'Messages',
                short_name: 'Chat',
                url: '/?view=chat',
                description: 'Continuer vos conversations'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
            runtimeCaching: [
              {
                urlPattern: ({ request }) => ['document', 'script', 'style'].includes(request.destination),
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'overlay-shell',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24
                  }
                }
              },
              {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: {
                  cacheName: 'overlay-images',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 30
                  }
                }
              }
            ]
          },
          devOptions: {
            enabled: true,
            suppressWarnings: true
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@components': path.resolve(__dirname, 'components'),
          '@contexts': path.resolve(__dirname, 'contexts'),
          '@hooks': path.resolve(__dirname, 'hooks'),
          '@lib': path.resolve(__dirname, 'lib'),
          '@services': path.resolve(__dirname, 'services'),
          '@constants': path.resolve(__dirname, 'constants'),
          '@types': path.resolve(__dirname, 'types.ts')
        }
      }
    };
});
