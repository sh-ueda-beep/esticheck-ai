import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'fs'
import { resolve } from 'path'

// amplify_outputs.json が存在しない場合は stub にフォールバック
const useStub = !existsSync(resolve('amplify_outputs.json'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: useStub
      ? {
          '../amplify_outputs.json': resolve('amplify_outputs.stub.json'),
          '../../../amplify_outputs.json': resolve('amplify_outputs.stub.json'),
        }
      : {}
  }
})
