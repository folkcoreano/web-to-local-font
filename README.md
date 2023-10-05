# Web to Local Fonts!

Essa é uma simples ferramenta para fazer download de arquivos de fonte web originadas do Google Fonts e similares.

## Uso

É bastante simples, não precisa instalar:

```sh
pnpm dlx web-to-local-font -u <url>
bunx web-to-local-font -u <url>
npx web-to-local-font -u <url>
```

Mas se você quiser, pode!

```sh
pnpm install -D web-to-local-font
bun install -D web-to-local-font
npm install -D web-to-local-font
```

## Exemplos

É importante que você coloque a url da folha de estilo logo em seguida do parâmetro `-u`, por algum motivo. E a url agradece se for colocada entre aspas, duplas ou simples fica a gosto.

```sh
pnpm dlx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
bunx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
npx web-to-local-font -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
```

Tudo será baixado em uma pasta chamada `fonts` por padrão, mas você pode mudar isso utilizando o parâmetro `-f` seguido do caminho desejado.

```sh
pnpm dlx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
bunx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
npx web-to-local-font -f "src/assets/css" -u "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
```

Com isso será criada uma pasta `files` contendo todos os arquivos de fontes, e ao lado dela o arquivo `fonts.css` indexando todas as fontes com suas especificações em `@font-face`.

## Limpeza

Se no calor do momento você baixou mais fontes do que precisava, basta apenas ir até o arquivo `fonts.css` e apagar as regras de `@font-face` que não quer mais. Após isso basta executar a ferramenta com o parâmetro `-p` e todas os arquivos indesejados serão removidos da pasta `files`.

```sh
pnpm dlx web-to-local-font -p
bunx web-to-local-font -p
npx web-to-local-font -p
```

É importante ressaltar que isso leva em conta o local onde foi realizado o download, então se você baixou usando o parâmetro `-f`, você precisa apontar o mesmo caminho.

```sh
pnpm dlx web-to-local-font -p -f "src/assets/css"
bunx web-to-local-font -p -f "src/assets/css"
npx web-to-local-font -p -f "src/assets/css"
```
