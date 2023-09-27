# Web to Local Fonts

Essa é uma simples ferramente para fazer download de arquivos de fonte web originadas do Google Fonts e similares.

O uso é bastante simples, não precisa instalar.

```bash
npx web-to-local-font -u <url>
```

Por exemplo:

```bash
npx web-to-local-font -u https://fonts.googleapis.com/css2?family=Roboto&display=swap
```

```bash
pnpm dlx web-to-local-font -u https://fonts.googleapis.com/css2?family=Roboto&display=swap
```

```bash
bunx web-to-local-font -u https://fonts.googleapis.com/css2?family=Roboto&display=swap
```

Esse comando irá baixar todas as fontes da folha de estilo na pasta /fonts/files, na raiz dessa pasta terá o arquivo fonts.css.
