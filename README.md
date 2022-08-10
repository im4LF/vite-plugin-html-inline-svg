<h1 align="center">vite-plugin-html-inline-svg</h1>
<p align="center">Embed svg inline in html files</p>
<p align="center"><strong>Based and inspirated by</strong> <a href="https://github.com/theGC/html-webpack-inline-svg-plugin">html-webpack-inline-svg-plugin</a></strong></p>

## Install

```bash
npm install vite-plugin-html-inline-svg -D
or
pnpm add vite-plugin-html-inline-svg -D
```

## Usage

- vite.config.ts

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import htmlInlineSvg from 'vite-plugin-html-inline-svg';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    htmlInlineSvg()
  ]
});
```

SVGO options

```ts
htmlInlineSvg({
	svgo: {
		plugins: ['removeComments']
	}
})
```

Full svgo optimize config plugins — https://github.com/svg/svgo#built-in-plugins
