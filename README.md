HelpDesk Lite

Sistema simples para cadastrar e acompanhar chamados de suporte de TI.

O que o sistema faz

 Cadastra, edita e exclui chamados.
 Organiza os chamados por categoria e prioridade.
 Acompanha o status: Aberto, Em atendimento e Resolvido.
 Permite buscar pelo título e filtrar por status.
 Salva os chamados no banco de dados.
 
Tecnologias

JavaScript, HTML, CSS, Node.js, Express, PostgreSQL e Docker.

Como executar

Com o Docker instalado, abra o terminal na pasta do projeto e execute:

docker compose up --build -d

Depois, acesse http://localhost:3000 no navegador.

Para parar a aplicação:

docker compose down

Possíveis melhorias

Login de usuários.
Histórico de alterações dos chamados.
Paginação da lista de chamados.
