# IP Cam RTSP -> MP4 files
#### Projeto que converte a stream RTSP de uma câmera ip em arquivos mp4 e depois faz upload no telegram / Google Drive / OneDrive / outros
</br>

### Motivação:
### Na necessidade de ter uma câmera de segurança em casa, comprei um modelo IP no Aliexpress por 80 reais.
</br>
</br>
Porém, para minha infelicidade, o app de controle da câmera é inútil para recuperar gravações do cartão de memória colocado na câmera. O app também possui planos pagos para armazenar as gravações em uma nuvem própria da marca, mas achei problemático depender de serviços fora do meu controle pra armazenar conteúdo sensível como gravações de segurança.
</br>
</br>
Por conta disso, busquei formas de armazenar as gravações em outro lugar gratuito facilmente acessível.
</br>
</br>
Esse projeto surgiu dessa necessidade.
</br>
</br>

### Como funciona:
Esse projeto foi feito em node.js usando FFMPEG para receber a Stream RTSP e converter em arquivos mp4. os arquivos mp4 são gerados automaticamente e enviados individualmente em fila após finalizar a gravação de acordo com a duração definida para os arquivos.
</br>
O código inicia o FFMPEG, e gera os arquivos mp4 com X duração em minutos, após um arquivo ser finalizado, ele é adicionado em uma fila de upload e o próximo já começa a ser gravado.

</br>

### Serviços atualmente suportados:
- Telegram
</br>
Inicialmente cogitei usar o Telegram como armazenamento de gravações. Funciona bem, o player do app é muito bom, porém achei problemática a velocidade de download dos arquivos e o formato de chat não me pareceu interessante para gerenciar os milhares de arquivos que seriam gerados. Mas o Telegram é uma ótima opção caso você não tenha outras alternativas de cloud.

</br>
</br>
</br>
</br>

- Google Drive
</br>
Sem duvidas a melhor opção considerando todas as qualidades que o google drive possui. O player de vídeo é excelente e é muito simples gerenciar os arquivos, fazer download e compartilhar, acessível de qualquer lugar.
</br>
Porém... O espaço reduzido de apenas 15GB em uma conta Free é um problema, já que em meus testes, apenas 12h de gravação já ocupava 13GB em disco.
</br>
Cogitei usar os Team Drives que tem de graça pela internet, mas por ser um armazenamento controlado por uma organização, todos os dados armazenados neles são acessíveis pelos admins das contas, zero privacidade. Mas sem dúvida é a melhor opção se você tiver bastante armazenamento.

</br>
</br>
</br>
</br>

- OneDrive
</br>
Chegamos a opção que uso atualmente, consegue ter uma boa gerencia de arquivos, um player agradável, e bastante espaço disponível (usando uma conta Dev que fornece 5TB).
</br>
Unica critica a esse cloud é que a API para enviar os arquivos tem upload lento e precisa fazer um verdadeiro malabarismo pra conseguir gerar os tokens de acesso (que são 2).

</br>
</br>
</br>
</br>

- Rclone (O canivete suíço dos cloud storage)
</br>
Tem uma adaptação no código para usar o rclone caso você queira usar outra cloud / storage para guardar os arquivos mp4, mas pra isso você vai precisar fazer as modificações e adaptações, o código desse projeto está adaptado para usar o OneDrive via rclone e via api oficial.

</br>
</br>
</br>
</br>

### Instalação:

1 - Clone esse projeto e instale as dependências com `npm i`
</br>
</br>
2 - Defina a Host RTSP que você deseja usar dentro de `index.js`
</br>
</br>
3 - Configure o tamanho em minutos que cada arquivo individual terá, dentro de `index.js` > `const duration = 60 * 5` (5min)
</br>
</br>
4 - Instale o FFMPEG no sistema.
</br>
</br>
5 - Configure o cloud que você usará:
- Telegram
</br>
Crie um bot no telegram com o BotFather.
</br>
Configure o bot para permitir acessar configurações de canais.
</br>
Crie um canal no telegram, adicione o bot nele e pegue o ID do canal (ex: -100999999...).
</br>
Acesse o arquivo `telegram.js` e adicione o token do bot e o ID do canal.
</br>
No arquivo `index.js`, faça o import da função `SendVideo` fornecida pelo `telegram.js` e na linha 69 do arquivo `index.js`, troque a função pelo `SendVideo` do telegram

</br>
</br>
</br>
</br>

- Google Drive
</br>
Acesse o console de API do google e ative a api do google drive.
</br>
Crie um `service_account` e baixe o json, armazene o json na raiz do projeto com o nome `creds.json`.
</br>
Acesse o arquivo `googledrive.js` e cole o ID da pasta que você deseja salvar os arquivos em `const folderID=` (Dica: abra a pasta no google drive pelo navegador e copie o código após `drive/u/0/folders/>ID<`)
</br>
No arquivo `index.js`, faça o import da função `uploadFileToDrive` fornecida pelo `googledrive.js` e na linha 69 do arquivo `index.js`, troque a função pelo `uploadFileToDrive` do googledrive

</br>
</br>
</br>
</br>

- OneDrive
</br>
Esse é chato de configurar.
</br>
Siga esse tutorial: [Retrieving Access Token From OneDrive using Google Apps Script](https://gist.github.com/tanaikech/d9674f0ead7e3320c5e3184f5d1b05cc)
</br>
No fim do tutorial, pegue o `refreshToken`, o `clientID` e o `clientSecret` e adicione no arquivo `onedrive.js`
</br>
Modifique a pasta que voce quer usar no onedrive no arquivo `onedrive.js` `const onedriveFolder =`
</br>
No arquivo `index.js`, faça o import da função `sendFile` fornecida pelo `onedrive.js` e na linha 69 do arquivo `index.js`, troque a função pelo `sendFile` do onedrive

</br>
</br>
</br>
</br>

- Rclone
</br>
Instale o Rclone no sistema e configure a cloud que você deseja usar para salvar os arquivos **(sugiro pesquisar como funciona o rclone primeiro antes de fazer isso)**
</br>
Use o arquivo `rclone-onedrive.js` como base para configurar. Na linha 38, modifique o comando para usar a cloud que você configurou no rclone.

</br>
</br>
</br>
</br>

6 - Com tudo configurado, escolha onde você irá executar o projeto.
O projeto pode ser executado com Docker ou com PM2 e está adaptado para funcionar no Termux.

7 - Execute `node index.js`

</br>
</br>

### Funcionando no Termux:

#### Comecei executando esse projeto em um Moto g7 play via Termux (celular parado sem uso e com baixissimo consumo de energia)


![plot](./src/termux.jpg)
funcionou muito bem, porém a bateria inchou por ficar muito tempo na tomada kkkkk acabei trocando por um mini pc que ganhei de um amigo, rodando em docker perfeitamete.
</br>
</br>
</br>

![plot](./src/onedrive1.png)
</br>
Exemplo de arquivos salvos no OneDrive agrupados por dia

</br>
</br>
</br>

![plot](./src/onedrive2.png)
</br>
Exemplo de arquivos salvos no OneDrive, cada um com sua data e hora

</br>
</br>

### Possíveis problemas
#### **script está dando erro logo ao iniciar "Erro na gravação: Error: ffmpeg exited with code 1:"**
    esse erro pode ser proveniente da configuração de timeout do ffmpeg.
    Sem essa configuração pode acontecer do ffmpeg congelar esperando dados da camera.
    Essa configuração varia dependendo da versão do ffmpeg.

    Acesse o arquivo index.js e leia as linhas 50 a 53
    remova o comentario de uma das opções de acordo com a versão do seu ffmpeg.
    para saber a versão, execute "ffmpeg -version"
</br>
</br>

### Projeto ainda em desenvolvimento (mas funcionando), código não está perfeito.
- sinta se a vontade para contribuir! 🤜🤛
