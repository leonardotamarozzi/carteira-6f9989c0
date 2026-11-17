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
11. **Quadro da foto 2,9:1:** interpretação de "deste tamanho" a partir do cartão da captura enviada (cerca de 339×118 px no celular). Em 390 px de tela o quadro fica com 358×123 px e, em 1280 px, com 560×193 px. A foto fica inteira (contain), e o zoom mostra os detalhes. PDFs continuam em rolagem com todas as páginas, porque várias páginas não cabem num quadro tão baixo. Para mudar, basta trocar `FRAME_RATIO` em `lib.js`.
12. **Legenda "Visualizado em" em vez de "Última atualização em":** o horário é o momento em que a tela foi aberta. Chamar isso de "atualização" daria a entender que os dados foram atualizados ou conferidos, o que o app não faz.
13. **Balão do QR com texto verdadeiro:** o pedido era "Utilize esse QR code para validar os dados da carteira", mas o app não valida nada (o QR é só a imagem anexada). O balão tem o visual pedido (azul claro, borda azul escura, lâmpada azul, duas linhas) e o texto que já existia.
14. **Ações no menu ⋯:** sem botões abaixo da foto, Girar, Editar nome, Trocar arquivo, Editar documento e Excluir passaram para o ⋯ do cabeçalho, para continuarem acessíveis.
15. **Abas sem arquivo:** mostram só um ícone, sem texto, para seguir "nenhuma escrita" abaixo da foto.
