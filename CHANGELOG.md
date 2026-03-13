# Changelog

Este arquivo registra a evolução do projeto com base no histórico de commits existente no repositório.

O objetivo aqui não é repetir apenas a mensagem curta do Git, mas traduzir cada commit para uma descrição útil do que mudou no produto e na base de código.

## Histórico

### `9147448` - CHANGELOG file implementation

Adição do changelog do projeto.

Principais inclusões:

- criação do arquivo de histórico de mudanças do repositório;
- documentação dos commits já existentes com contexto mais útil do que a mensagem curta do Git;
- organização cronológica da evolução do projeto, incluindo produto, interface e documentação.

Arquivo criado/alterado:

- [CHANGELOG.md](C:/Users/opah/Documents/Projetos/engineering-test/CHANGELOG.md)

### `87075a7` - Master upload

Commit inicial do projeto.

Principais entregas:

- estrutura base criada com `Vite` e `React`;
- configuração inicial do projeto e dependências;
- integração com a API da CodeLeap para CRUD de posts;
- integração complementar com `jsonplaceholder` para simular likes e comentários;
- implementação da tela de login com persistência local de usuários;
- implementação da tela principal com criação, listagem, edição e exclusão de posts;
- adição de busca de posts;
- inclusão de modais de edição, exclusão e sign out;
- criação da animação de transição de login com assets da marca;
- implementação de likes, comentários e menções com autocomplete;
- estruturação visual completa em `src/style.css`;
- inclusão dos assets de interface e branding.

Arquivos centrais criados nesse commit:

- [src/App.jsx](C:/Users/opah/Documents/Projetos/engineering-test/src/App.jsx)
- [src/main.jsx](C:/Users/opah/Documents/Projetos/engineering-test/src/main.jsx)
- [src/style.css](C:/Users/opah/Documents/Projetos/engineering-test/src/style.css)
- [src/api/posts.js](C:/Users/opah/Documents/Projetos/engineering-test/src/api/posts.js)
- [src/api/social.js](C:/Users/opah/Documents/Projetos/engineering-test/src/api/social.js)
- [src/components/CodeLeapLoadingTransition.jsx](C:/Users/opah/Documents/Projetos/engineering-test/src/components/CodeLeapLoadingTransition.jsx)

### `d669603` - Header buttons update

Refinamento visual do cabeçalho.

Principais ajustes:

- atualização dos controles do header;
- melhoria visual do botão `Sign out`;
- adição da identificação visual do usuário logado no topo;
- refinamento do comportamento e da aparência dos elementos do cabeçalho para manter consistência com o restante da interface.

Arquivos alterados:

- [src/App.jsx](C:/Users/opah/Documents/Projetos/engineering-test/src/App.jsx)
- [src/style.css](C:/Users/opah/Documents/Projetos/engineering-test/src/style.css)

### `634d093` - README file

Primeira versão do README do projeto.

Principais inclusões:

- descrição geral da aplicação;
- explicação da stack utilizada;
- instruções de execução local;
- documentação das principais funcionalidades e integrações.

Arquivo criado:

- [README.md](C:/Users/opah/Documents/Projetos/engineering-test/README.md)

### `822f8dd` - README update

Reestruturação da documentação para suportar versão bilíngue.

Principais mudanças:

- atualização do `README.md` principal;
- criação da versão em português brasileiro;
- reorganização do conteúdo de documentação para melhorar clareza e leitura no GitHub.

Arquivos alterados/criados:

- [README.md](C:/Users/opah/Documents/Projetos/engineering-test/README.md)
- [README.pt-BR.md](C:/Users/opah/Documents/Projetos/engineering-test/README.pt-BR.md)

### `d2609f2` - Update README.md

Ajuste pontual no README principal em inglês.

Tipo de mudança:

- correção ou refinamento textual/documental.

Arquivo alterado:

- [README.md](C:/Users/opah/Documents/Projetos/engineering-test/README.md)

### `9a64ee1` - Update README.pt-BR.md

Ajuste pontual no README em português brasileiro.

Tipo de mudança:

- correção ou refinamento textual/documental.

Arquivo alterado:

- [README.pt-BR.md](C:/Users/opah/Documents/Projetos/engineering-test/README.pt-BR.md)

### `1e60b33` - Update README.md URL PT BR

Ajuste final de navegação entre os arquivos de documentação.

Principal mudança:

- correção do link do `README.md` para a versão em português brasileiro.

Arquivo alterado:

- [README.md](C:/Users/opah/Documents/Projetos/engineering-test/README.md)

## Observação

Como parte importante do desenvolvimento foi consolidada no commit inicial, este changelog descreve esse primeiro snapshot de forma mais abrangente. Os commits seguintes concentram principalmente refinamentos de interface no header e evolução da documentação do repositório.
