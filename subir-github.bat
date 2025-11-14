@echo off
echo ========================================
echo    SUBINDO PROJETO MEGASENA NO GITHUB
echo ========================================
echo.

cd /d F:\vibe-coding\megasena

echo [1/7] Inicializando Git...
git init

echo.
echo [2/7] Adicionando todos os arquivos...
git add .

echo.
echo [3/7] Fazendo commit inicial...
git commit -m "Deploy inicial - Sistema MegaSena com configuracao Vercel"

echo.
echo [4/7] Configurando branch main...
git branch -M main

echo.
echo [5/7] Adicionando repositorio remoto...
git remote add origin https://github.com/felipestoker/megasena.git

echo.
echo [6/7] Enviando para o GitHub...
git push -u origin main

echo.
echo ========================================
echo    UPLOAD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Seu projeto esta agora em:
echo https://github.com/felipestoker/megasena
echo.
echo Proximo passo: Deploy no Vercel
echo https://vercel.com
echo.
pause
