# Decisões

Registro de escolhas feitas onde o pedido deixava em aberto ou entrava em conflito com o que já existia.

1. **Comando de teste:** no Node 24, `node --test tests/` tenta rodar a pasta como arquivo e falha (`MODULE_NOT_FOUND`). O comando que funciona é `node --test "tests/*.test.js"`.
2. **Abas:** as abas Frente e Verso já existentes formam o "Documento". A aba QR Code só aparece se houver QR anexado.
3. **Cronômetro:** começa em `01 : 00` (60 s no formato mm : ss) e vai até `00 : 00`.
4. **Documentos antigos migrados** recebem orientação **Vertical**, para continuarem aparecendo como antes. A data de inclusão deles é a data da migração, porque o formato antigo não guardava data.
5. **QRs antigos** foram guardados comprimidos pela versão anterior. Ficam como estão; os novos são guardados como o arquivo original.
6. **Tela cheia ao tocar na foto** foi trocada por zoom (pinça, duplo toque e arrastar), para não haver conflito entre toque e duplo toque.
7. **Encaminhar com molde** continua só para imagens (Frente/Verso). Fica escondido em PDF e no QR Code, porque desenhar o QR no molde seria redesenhá-lo.
8. **PIN opcional:** reaproveita a senha que já existia (salt + SHA-256). A primeira abertura oferece "Continuar sem PIN"; em Opções → PIN de acesso dá para criar, trocar ou remover.
9. **pdf.js 4.10.38 (build legacy)** baixado de cdn.jsdelivr.net com aprovação do usuário. Fica em `vendor/` com a licença Apache-2.0 e entra no cache offline.
10. **Nomes internos** (pasta, repositório, rota `#/carteira`, chaves `pwc.*`, identificador `pwa-carteira` no backup) não foram renomeados, para não quebrar o app já instalado nem os backups antigos.
