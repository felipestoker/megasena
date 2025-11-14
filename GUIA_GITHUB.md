# 📤 GUIA COMPLETO - SUBIR PROJETO NO GITHUB

## 🎯 PASSO A PASSO SIMPLIFICADO

### ✅ O QUE VOCÊ PRECISA FAZER:

---

## 📥 PASSO 1: BAIXAR OS ARQUIVOS

Baixe TODOS os arquivos que criei:

1. ✅ **subir-github.bat** (script automático)
2. ✅ **.gitignore** (ignora arquivos desnecessários)
3. ✅ **README.md** (documentação)
4. ✅ **vercel.json** (configuração Vercel)
5. ✅ **.vercelignore** (otimização deploy)
6. ✅ **package.json** (se você não tiver um)

---

## 📂 PASSO 2: COPIAR PARA O PROJETO

Copie TODOS os arquivos baixados para:

```
F:\vibe-coding\megasena\
```

Sua pasta deve ficar assim:

```
megasena/
├── subir-github.bat     ← NOVO ✨
├── .gitignore          ← NOVO ✨
├── README.md           ← NOVO ✨
├── vercel.json         ← NOVO ✨
├── .vercelignore       ← NOVO ✨
├── package.json        ← Verifique se já tem
├── server.js           ← Seu código
├── public/             ← Seus arquivos
└── database.db         ← Seu banco
```

---

## 🚀 PASSO 3: EXECUTAR O SCRIPT

**Método Mais Fácil:**

1. Vá até `F:\vibe-coding\megasena`
2. **Clique 2x** em `subir-github.bat`
3. Aguarde o script fazer tudo automaticamente! ⏳

**OU pelo Prompt de Comando:**

```bash
cd F:\vibe-coding\megasena
subir-github.bat
```

---

## 🔐 PASSO 4: AUTENTICAÇÃO (SE PEDIR)

Se o Git pedir suas credenciais:

**Opção 1: Via GitHub CLI**
```bash
gh auth login
```

**Opção 2: Token de Acesso**
1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque: `repo` (acesso completo)
4. Copie o token gerado
5. Use o token como senha no Git

**Opção 3: GitHub Desktop**
- Baixe: https://desktop.github.com
- Faça login
- Arraste a pasta do projeto

---

## ✅ VERIFICAR SE DEU CERTO

Acesse: https://github.com/felipestoker/megasena

Você deve ver todos os arquivos lá! 🎉

---

## 🌐 PASSO 5: DEPLOY NO VERCEL

Agora que está no GitHub:

1. Acesse: https://vercel.com
2. Faça login com o GitHub
3. Clique em **"Add New Project"**
4. Selecione **"megasena"**
5. **NÃO mude NADA** (já está configurado)
6. Clique em **"Deploy"**
7. Aguarde 2-3 minutos ⏳
8. Pronto! Seu site estará no ar! 🚀

---

## ⚠️ PROBLEMAS COMUNS

### ❌ "fatal: remote origin already exists"

**Solução:**
```bash
git remote remove origin
git remote add origin https://github.com/felipestoker/megasena.git
git push -u origin main
```

### ❌ "Permission denied"

**Solução:**
Use um token de acesso pessoal (veja Passo 4)

### ❌ "SQLite não funciona no Vercel"

**Solução:**
O Vercel é serverless, use Railway ao invés:
1. https://railway.app
2. Conecte com GitHub
3. Selecione o repositório
4. Deploy automático!

---

## 🆘 PRECISA DE AJUDA?

Se algo der errado:
1. Tire um print da mensagem de erro
2. Me envie
3. Eu te ajudo a resolver! 👨‍💻

---

**🎯 RESUMO RÁPIDO:**

1. Baixar arquivos → 📥
2. Copiar para F:\vibe-coding\megasena → 📂
3. Clicar 2x em subir-github.bat → 🚀
4. Acessar github.com/felipestoker/megasena → ✅
5. Deploy no Vercel → 🌐
6. Pronto! 🎉

---

**Boa sorte! Qualquer dúvida, me chame! 💪**
