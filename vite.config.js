import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
// Dev: /api is proxied to your local Flask server (python app.py on port 5000)
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:5000'}}});
