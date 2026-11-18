# Meus Documentos (PWA offline)

Organizador pessoal de documentos (cartões, comprovantes, ingressos, receitas, PDFs).
Instalável, 100% offline e gratuito. HTML + CSS + JS puro, sem build, sem backend,
sem analytics. Os arquivos ficam no IndexedDB do aparelho; configurações no `localStorage`.
Nada é enviado para fora do navegador.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | App (CSS e JS embutidos: armazenamento, router, telas) |
| `lib.js` | Lógica pura testável: orientação, cronômetro do QR, base64/backup, SHA-256 |
| `tests/lib.test.js` | Testes com `node:test` (sem dependências) |
| `vendor/` | pdf.js 4.10.38 (build legacy, Apache-2.0) para exibir PDFs offline |
| `DECISIONS.md` | Decisões tomadas onde o pedido deixava em aberto |
| `manifest.json` | Manifesto do PWA (`start_url`/`scope` relativos, ícones `any` e `maskable`) |
| `sw.js` | Service Worker: cache-first do app shell, versão de cache e limpeza no `activate` |
| `icon-192.png`, `icon-512.png` | Ícones neutros |

## Rodar localmente

```bash
cd pwa-carteira
python -m http.server 8080
```

Abra `http://localhost:8080`. (Ou `npx serve .`.) Abrir o arquivo direto (`file://`) não ativa o Service Worker.

## Testes

```bash
node --test "tests/*.test.js"
```

## Instalar

- **iPhone (Safari):** abra o endereço → botão Compartilhar → **Adicionar à Tela de Início**.
- **Android (Chrome):** abra o endereço → menu ⋮ → **Instalar app** (ou o aviso de instalação).

Para instalar no celular, o site precisa estar em HTTPS (veja abaixo).

## Hospedar de graça

- **GitHub Pages:** suba a pasta para um repositório → Settings → Pages → publicar a branch. Funciona em subpasta (`usuario.github.io/repo/`) porque tudo usa caminhos relativos.
- **Netlify:** arraste a pasta `pwa-carteira` em app.netlify.com/drop.

## Atualizar o app

Ao alterar qualquer arquivo, aumente `VERSION` em `sw.js` (`v12` → `v13`). O novo
Service Worker baixa tudo de novo e apaga o cache antigo; a mudança aparece na
próxima abertura do app.

## Personalização (tudo dentro do app)

Opções → Chat de atendimento → **Personalizar aplicativo**: molde do arquivo encaminhado (a foto do documento vai no meio dele, um pouco abaixo), ícone da tela de início (imagem quadrada, recorte central), logo (PNG transparente, mostrada sobre fundo
xadrez), senha, imagens do documento, cor de destaque, nome do app, backup JSON
(exportar/importar) e apagar tudo (dupla confirmação).

O nome e a cor também vão para o `manifest.json`: o Service Worker recebe esses
valores da página e serve o manifesto já personalizado. Em aparelhos onde o app
já foi instalado, o nome do ícone só muda ao reinstalar.

## Escolhas feitas (onde o pedido deixava em aberto)

- **Sem Tailwind:** CSS próprio embutido; nada externo para cachear.
- **Fonte:** fonte do sistema (`system-ui`), já que fontes externas não eram permitidas.
- **Sessão:** o app pede a senha a cada abertura/recarga (o desbloqueio fica só na memória).
- **Após criar a senha** o app leva ao login, como no fluxo pedido.
- **Documento salvo:** abre o arquivo com abas Frente/Verso e, se houver QR anexado, QR Code. Botões Girar, Editar nome, Trocar arquivo e Excluir. A seta no topo encaminha a foto (imagem) dentro do molde; some em PDF e no QR. Sem arquivo ainda, abre o formulário.
- **Arquivos:** JPG, PNG, WebP ou PDF até 15 MB, guardados como o arquivo original (sem recomprimir).
- **Orientação:** Horizontal deita imagens/páginas em retrato girando 90° só na tela; Vertical mostra em pé. O padrão fica em Personalizar aplicativo → Orientação padrão dos documentos e já vem marcado ao anexar (dá para trocar por documento). Girar (+90°) fica salvo por documento. Zoom por pinça e duplo toque.
- **Tela do documento:** a foto ocupa um quadro alto (do fim das abas até a barra inferior), inteira e centralizada. Em Horizontal ela gira 90° quando isso a deixa maior no quadro (um documento em paisagem fica deitado, com o lado esquerdo para cima). Abaixo dela só a legenda pequena "Visualizado em dd/mm/aaaa - hh:mm" (momento em que a tela foi aberta). As ações (Girar, Editar nome, Trocar arquivo, Editar documento, Excluir) ficam no ⋯ do cabeçalho.
- **Lista:** cada cartão mostra a foto de perfil do documento (cadastrada no formulário), nunca o arquivo do documento.
- **QR Code:** abaixo do cronômetro, um balão azul com lâmpada explica que o QR é a imagem anexada e que o tempo só o oculta.
- **QR Code anexado:** mostrado exatamente como enviado. Um cronômetro de 01 : 00 só oculta a imagem (desfoque) por privacidade; "Tocar para mostrar de novo" reinicia.
- **PIN opcional:** na primeira abertura dá para continuar sem PIN; criar, trocar ou remover em Opções → PIN de acesso.
- **Formulário do documento** em tela cheia (rota `#/editar/<id>`), para o botão Voltar do celular funcionar.
- **Primeiro serviço:** "2ª via de". Toque simples abre a tela do serviço; clique triplo ou pressão longa de 1,2 s renomeia (no teclado: F2); a tela não mostra legenda sobre isso. Movimento acima de 10 px cancela a pressão longa.
- **Termos, Privacidade e Ajuda** abertos pelo rodapé do login ficam somente leitura; edição só depois de entrar.
- **Anexos do FAQ:** imagens são comprimidas (1024 px, JPEG 0,8); PDFs são guardados como estão, até 3 MB cada.
- **Imagens:** arquivos do documento (frente, verso, QR Code) guardados como enviados; logo sempre PNG até 512 px (preserva transparência); avatar até 512 px, PNG se tiver transparência.
- **Chat:** guarda as últimas 200 mensagens; resposta automática configurável pelo ícone de engrenagem.
- **Backup importado** desliga a biometria (a credencial pertence ao aparelho de origem) e pede login de novo.
- **Cor de destaque com pouco contraste:** o app avisa e escolhe texto branco ou preto nos botões automaticamente.

## Portão de acesso (opcional)

Com `ACCESS_SERVER` preenchido no topo do script do `index.html`, o app pede acesso antes de tudo:
quem abre informa **nome completo** e cria uma **senha de acesso**; o pedido fica "pendente" até o
administrador aprovar no painel do servidor (pasta `servidor-acesso`, fora deste repositório).
Depois do portão vem o PIN local, como antes. Com `ACCESS_SERVER` vazio, o portão fica desligado.

- **Vai ao servidor:** só o nome e a senha de acesso. Documentos, arquivos, QR Code, backup, PIN e configurações nunca saem do aparelho.
- **No aparelho:** um token do pedido, o último estado e a hora da última conferência (`pwc.acesso`).
- **Conferência:** ao abrir, ao voltar para o app e a cada 5 minutos. Sem internet, um acesso aprovado continua valendo por até 7 dias desde a última conferência.
- **Negado ou revogado:** o app bloqueia e esconde os documentos; os dados locais não são apagados.
- **Limitação:** os arquivos do app são públicos no GitHub Pages. O portão controla o fluxo do app, mas **não impede** alguém de baixar o código estático. Como os documentos de cada pessoa ficam só no aparelho dela, não há dado sensível exposto. Proteção total exigiria servir o app inteiro atrás do servidor.

## Segurança e limitações conhecidas

- **PIN/senha:** só é guardado `SHA-256(salt + ":" + senha)` com salt aleatório de 16 bytes. Nunca em texto puro. Usa `crypto.subtle`; fora de HTTPS/localhost (onde `crypto.subtle` não existe) usa uma implementação SHA-256 em JS embutida, com o mesmo resultado.
- **A senha é uma tela de privacidade, não criptografia.** Os dados no `localStorage` não são cifrados: quem tiver acesso ao navegador do aparelho (ferramentas de desenvolvedor) consegue lê-los. Um hash SHA-256 simples também é rápido de testar por força bruta se alguém copiar os dados; use uma senha longa.
- **"Esqueci minha senha"** só pode apagar os dados e recomeçar, porque não há servidor para recuperar a senha. Exporte backups.
- **Biometria (WebAuthn)** exige HTTPS (ou `localhost`) e um leitor de digital/rosto no aparelho. Sem servidor, a verificação confirma apenas que o dono do aparelho passou na biometria; não há validação criptográfica da assinatura. Se indisponível, o app mostra o motivo e mantém o interruptor desligado.
- **Espaço:** os arquivos ficam no IndexedDB (cota do navegador, bem maior que os 5 MB do `localStorage`). Se encher, o app avisa e não perde o que já estava salvo.
- **Dados antigos** (versão até v7, no `localStorage`) são migrados para o IndexedDB na primeira abertura; a cópia antiga só é apagada depois de conferida.
- **Texto do usuário** é inserido sempre com `textContent` (nunca `innerHTML`); imagens importadas só são aceitas como `data:image/...` em base64.
- **iOS:** vibração no erro de senha não existe no Safari (só no Android). O download do backup abre a folha de compartilhamento do iOS.
