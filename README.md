# 📌 Sistema de Gestão de Voluntários + Registro de Ponto  
Backend em Node.js + Express + PostgreSQL

Este projeto é uma API completa para gerenciar voluntários, atividades, cursos e registros de ponto.  
Ela foi desenvolvida com foco em simplicidade, organização e flexibilidade, utilizando Node.js, Express e PostgreSQL.

---

## 🚀 Funcionalidades

### 👥 Voluntários
- Listar todos os voluntários  
- Buscar voluntário por código  
- Criar novo voluntário  
- Atualizar informações  
- Excluir voluntário  
- Conversão automática de arrays Postgres no campo `aptidoes`

---

### 🗓️ Atividades
- Cadastrar novas atividades  
- Listar atividades cadastradas  
- Atualizar atividade existente  
- Excluir atividade  
- Consultar atividades onde o voluntário está elegível (`voluntarios_elegiveis`)

---

### 🎓 Cursos
- Listar cursos  
- Listar cursos por voluntário participante  
- Cadastrar curso  
- Editar curso  
- Excluir curso  
- Manipulação de arrays `voluntarios_participantes` no PostgreSQL

---

### ⏱️ Registro de Ponto
- Registrar entrada/saída  
- Listar todos os registros, ordenados por data/hora  

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg (node-postgres)**
- **dotenv**
- **CORS**

## 📂 Estrutura do Projeto

---

├── public/ # Arquivos estáticos (Front-end opcional)
├── server.js # Servidor, rotas e conexão ao PostgreSQL
├── .env # Configurações sensíveis (não versionado)
├── .gitignore # Ignora node_modules e .env



---

## 🔧 Como Executar o Projeto Localmente

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO

npm install


DB_USER=Admin
DB_PASSWORD=Fraluz@2709
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=voluntariado_db


npm start

http://localhost:3000


📡 Endpoints da API
👥 Voluntários

| Método | Rota                      | Descrição        |
| ------ | ------------------------- | ---------------- |
| GET    | `/api/voluntario/listar`  | Lista todos      |
| GET    | `/api/voluntario/:codigo` | Busca por código |
| POST   | `/api/voluntario`         | Cria voluntário  |
| PUT    | `/api/voluntario/:codigo` | Atualiza         |
| DELETE | `/api/voluntario/:codigo` | Remove           |


🗓️ Atividades

| Método | Rota                                | Descrição                      |
| ------ | ----------------------------------- | ------------------------------ |
| POST   | `/api/atividade/cadastrar`          | Cadastra atividade             |
| GET    | `/api/atividade/listar`             | Lista atividades               |
| PUT    | `/api/atividade/:id`                | Atualiza                       |
| DELETE | `/api/atividade/:id`                | Exclui                         |
| GET    | `/api/atividade/voluntario/:codigo` | Lista atividades do voluntário |


🎓 Cursos

| Método | Rota                             | Descrição                   |
| ------ | -------------------------------- | --------------------------- |
| GET    | `/api/curso/listar`              | Lista cursos                |
| GET    | `/api/cursos/voluntario/:codigo` | Lista cursos por voluntário |
| POST   | `/api/curso/cadastrar`           | Cadastra curso              |
| PUT    | `/api/curso/:id`                 | Atualiza                    |
| DELETE | `/api/curso/:id`                 | Exclui                      |


⏱️ Registro de Ponto

| Método | Rota                   | Descrição                |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/ponto/registrar` | Registra entrada/saída   |
| GET    | `/api/ponto/listar`    | Lista todos os registros |


🧱 Banco de Dados

As tabelas necessárias são aproximadamente:

voluntarios

atividades

cursos

registro_ponto


🤝 Contribuição

Faça um fork do repositório

Crie uma branch (git checkout -b minha-feature)

Commit (git commit -m "feat: minha nova feature")

Push (git push origin minha-feature)

Abra um Pull Request

📬 Contato

Feito com carinho por Marco Moraes ❤️
Se quiser ajuda extra com documentação, banco, front-end ou deploy, estou aqui para você!
