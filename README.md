# Web to Local Fonts!

> Essa é uma simples ferramenta para fazer download de arquivos de fonte web originadas do Google Fonts e similares.

## Uso

> É bastante simples, não precisa instalar:

```sh
pnpm dlx web-to-local-font -u <url>
bunx web-to-local-font -u <url>
npx web-to-local-font -u <url>
```

> Mas se você quiser, pode!

```sh
pnpm install -D web-to-local-font
bun install -D web-to-local-font
npm install -D web-to-local-font
```

## Exemplos

> É importante que você coloque a url da folha de estilo logo em seguida do parametro `-u`, por algum motivo. E a url agradece se for colocada entre aspas, duplas ou simples fica a gosto.

```sh
pnpm dlx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"

bunx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"

npx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
```

> Tudo será baixado em uma pasta chamada `fonts` por padrão, mas você pode mudar o caminho se desejar.

```sh
pnpm dlx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"

bunx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"

npx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
```

> Com isso será criada uma pasta `files` contendo todos os arquivos de fontes, e ao lado dela o arquivo `fonts.css` indexando todas as fontes com suas especifícações em `@font-face`.
