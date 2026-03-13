# CodeLeap Network Frontend

Versão em inglês: [README.md](https://github.com/victorgadder/engineering-test/blob/main/README.md)

Aplicação frontend desenvolvida em React para um fluxo de CRUD de postagens integrado ao backend de teste da CodeLeap em `https://dev.codeleap.co.uk/careers/`.

O projeto foi construído com foco na experiência do usuário final: interface clara, visual refinado, responsividade, animações sutis e interações objetivas. Ao mesmo tempo, a implementação prioriza reutilização, simplicidade estrutural e uso de hooks.

## Visão Geral

Esta aplicação entrega:

- autenticação frontend baseada em username, sem criação de usuário no backend;
- criação, listagem, edição e exclusão de posts;
- ordenação dos posts pelos mais recentes no topo;
- busca por título, conteúdo ou username;
- modais de confirmação e edição;
- animação de transição no login com assets da marca CodeLeap;
- likes e comentários com persistência local;
- menções de usuários com autocomplete ao digitar `@`;
- refinamentos visuais com hover, foco, feedback de estados e animações suaves.

## Stack

- `React 19`
- `Vite`
- `@tanstack/react-query`
- `framer-motion`
- CSS puro em arquivo único (`src/style.css`)

## Backend e Integrações

### CRUD principal de posts

Os posts usam a API remota:

- Base URL: `https://dev.codeleap.co.uk/careers/`

Operações implementadas:

- `GET /careers/`
- `POST /careers/`
- `PATCH /careers/{id}/`
- `DELETE /careers/{id}/`

Observações importantes:

- a barra final na URL foi mantida porque o backend Django pode apresentar comportamento inconsistente sem ela;
- esse backend remoto pode ser reiniciado ou limpo periodicamente, portanto os posts não devem ser tratados como persistência garantida de longo prazo.

### Interações fictícias com API válida

Likes e comentários usam chamadas para:

- `https://jsonplaceholder.typicode.com`

Essas chamadas existem para simular tráfego de rede em funcionalidades que não fazem parte do contrato oficial da API da CodeLeap. A persistência funcional dessas interações acontece localmente no navegador.

## Funcionalidades

### 1. Login

A tela inicial possui três caminhos:

- continuar com o último usuário logado;
- escolher um usuário já existente em um dropdown;
- criar um novo usuário digitando um username inédito.

Regras implementadas:

- o botão `ENTER` fica desabilitado quando o input está vazio;
- usernames duplicados não podem ser criados pelo campo de novo usuário;
- quando o nome já existe, uma mensagem de erro é exibida;
- o login dispara uma animação de transição de 3 segundos antes de entrar no feed.

Persistência frontend:

- último usuário: `localStorage`;
- usuários conhecidos: `localStorage`.

### 2. Feed principal

O feed contém:

- header com logo, identificação do usuário logado e ação de `Sign out`;
- campo de busca;
- caixa de criação de postagem;
- lista de posts retornados pela API;
- controles condicionais de edição e exclusão apenas para o dono do post.

Comportamentos importantes:

- os posts são ordenados por `created_datetime` de forma decrescente;
- a listagem usa React Query;
- há `refetch` periódico;
- a lista também é invalidada após create, update e delete.

### 3. Likes

Cada postagem possui um botão de like no header do card.

Comportamento:

- o estado visual muda entre ícone branco e azul;
- o contador é animado;
- o like possui um pequeno efeito de `pop`;
- os likes são persistidos localmente por post;
- a ação também dispara uma chamada para API externa válida (`jsonplaceholder`) para simular integração de rede.

### 4. Comentários

Cada post possui uma seção de comentários com:

- listagem de comentários;
- formulário para novo comentário;
- edição de comentário;
- exclusão de comentário.

Regras de permissão:

- o autor do comentário pode editar e deletar o próprio comentário;
- o autor do post também pode deletar comentários feitos por outras pessoas naquele post;
- quando o autor do post remove comentário de outro usuário, o comentário não desaparece e passa a exibir:
  `Message deleted by the owner of the post.`

Persistência:

- comentários ficam em `localStorage`;
- create, update e delete também disparam chamadas para API externa válida.

### 5. Menções com `@`

O projeto implementa autocomplete de usuários quando `@` é digitado em:

- criação de post;
- edição de post;
- criação de comentário;
- edição de comentário.

Comportamento:

- a lista sugere usuários conhecidos da aplicação;
- há suporte a mouse e teclado;
- `ArrowUp`, `ArrowDown`, `Enter`, `Tab` e `Escape` são suportados.

### 6. Animações e refinamento visual

O projeto inclui:

- transição entre login, loading e feed;
- entrada escalonada dos posts com `fade + slide-up`;
- modais com `scale/fade`;
- hover refinado em cards, botões e ícones;
- foco visual mais elegante nos inputs;
- feedback visual quando `Create` e `Comment` ficam habilitados;
- fundo com gradiente em camadas e textura leve;
- brilho sutil no header.

## Estrutura de Pastas

```text
src/
  api/
    posts.js
    social.js
  assets/
    codeleap-icon.png
    codeleap-network-logo*.png
    codeleap-share.png
    delete.svg
    edit.svg
    like-blue.svg
    like-white.svg
  components/
    CodeLeapLoadingTransition.jsx
  App.jsx
  main.jsx
  style.css
```

## Arquivos Principais

### [`src/main.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/main.jsx)

Inicializa a aplicação React e configura o `QueryClientProvider`.

### [`src/App.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/App.jsx)

Concentra:

- fluxo de login;
- fluxo de feed;
- modais;
- componentes auxiliares locais;
- regras de likes, comentários e menções;
- transições de tela com `framer-motion`.

### [`src/api/posts.js`](C:/Users/opah/Documents/Projetos/engineering-test/src/api/posts.js)

Camada de integração com a API oficial da CodeLeap para CRUD de posts.

### [`src/api/social.js`](C:/Users/opah/Documents/Projetos/engineering-test/src/api/social.js)

Camada de integração para likes e comentários fictícios usando `jsonplaceholder`.

### [`src/components/CodeLeapLoadingTransition.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/components/CodeLeapLoadingTransition.jsx)

Animação de transição de login usando assets da marca CodeLeap e `framer-motion`.

### [`src/style.css`](C:/Users/opah/Documents/Projetos/engineering-test/src/style.css)

Responsável por toda a linguagem visual do projeto:

- layout;
- responsividade;
- estados visuais;
- animações;
- tipografia;
- ambientação.

## Como Rodar Localmente

### Requisitos

- `Node.js` 18+ recomendado
- `npm`

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Preview da build

```bash
npm run preview
```

## Persistência Local

Como parte da experiência proposta, alguns estados são guardados no navegador:

- `codeleap_username`
- `codeleap_users`
- `codeleap_comments`
- `codeleap_likes`

Isso permite:

- lembrar o último usuário;
- sugerir usuários existentes;
- manter likes e comentários mesmo quando a API oficial não oferece suporte para isso.

## Decisões Técnicas

### Por que React Query?

React Query foi usado para:

- buscar posts da API principal;
- invalidar cache após mutações;
- reduzir código manual de loading e refetch;
- deixar a camada assíncrona mais previsível.

### Por que hooks em vez de classes?

O projeto segue a orientação solicitada:

- componentes funcionais;
- estado com hooks;
- composição mais simples;
- menor complexidade para evolução e manutenção.

### Por que `localStorage` para parte das features?

Porque:

- login por username não depende de backend real de usuários;
- likes e comentários não fazem parte da API oficial do teste;
- a API remota de posts pode ser resetada com o tempo.

## Responsividade

O layout foi pensado para desktop e mobile:

- larguras fluidas com `min(..., 100%)`;
- ajustes por breakpoint;
- componentes do header adaptados para telas menores;
- dropdown e ações do login reorganizados para mobile;
- modal e cards com comportamento consistente em larguras reduzidas.

## Acessibilidade e UX

Alguns cuidados aplicados:

- botões desabilitados quando a ação não é válida;
- feedback visual em hover e foco;
- labels claras nos campos;
- modais com estrutura apropriada para dialog;
- texto e hierarquia visual voltados para leitura rápida.

## Limitações Conhecidas

- a API da CodeLeap pode retornar lista vazia em determinados momentos, mesmo após uso anterior;
- likes e comentários não são persistidos em backend próprio, apenas localmente;
- a autenticação é puramente frontend, sem sessão real;
- parte do app está centralizada em `App.jsx`, o que é funcional para o escopo atual, mas pode ser separado em módulos menores caso o projeto cresça.

## Melhorias Futuras Possíveis

- extrair componentes do feed para arquivos separados;
- mover configurações para variáveis de ambiente;
- adicionar testes de interface e testes de integração;
- implementar backend próprio para likes, comentários e usuários;
- otimizar assets maiores da marca para reduzir o peso da build.

## Autor

Projeto desenvolvido por Victor Gadder no contexto de um desafio de engenharia frontend, com foco em usabilidade, clareza visual e execução objetiva.
