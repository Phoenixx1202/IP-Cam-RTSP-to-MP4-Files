import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import Queue from 'queue';

// modifique aqui qual cloud voce irá importar pra salvar os arquivos.
import sendFile from './rclone-onedrive.js';

const rtspUrl = 'rtsp://...' // a URL RTSP da sua camera
const duration = 60 * 5; // 5 minutos em segundos
const folderPath = './';
const fila = new Queue({ autostart: true, concurrency: 1 });
fila.start()

const sleep = ms => new Promise(r => setTimeout(r, ms));

// remove os arquivos mp4 antigos ao reiniciar (para evitar uploads repetidos)
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Erro ao ler a pasta:', err);
        return;
    }

    files.forEach((file) => {
        if (path.extname(file) === '.mp4' && file.includes("output")) {
            fs.unlink(path.join(folderPath, file), (err) => {
                if (err) {
                    console.error('Erro ao remover o arquivo:', err);
                } else {
                    console.log(`Arquivo ${file} removido com sucesso.`);
                }
            });
        }
    });
});

// inicia a gravação dos arquivos mp4, ao finalizar, adiciona na fila de upload
function startRecording() {
    return new Promise((resolve, reject) => {

        const timestamp = Date.now();
        const outputPath = path.join(folderPath, `output_${timestamp}.mp4`);

        // ffmpeg recebe a stream e grava o tempo definido na variavel duration
        ffmpeg(rtspUrl)
            .inputOptions([
                // define como tcp para que os pacotes de dados chegem de forma sequencial
                // bom para cameras via wifi onde a rede varia, evitando travamentos constantes (mas ainda podem ocorrer)
                '-rtsp_transport tcp',
                // ative essa opção caso o script congele e pare de gerar as novas gravações
                // `-timeout ${duration*1001}` // caso seu ffmpeg seja acima do 5
                `-stimeout ${duration*1001}` // caso seu ffmpeg seja abaixo do 5
                // ative apenas 1 desses
            ])
            .outputOptions([
                '-t', `${duration}`, // Duração de cada arquivo
                '-c:v', 'copy', // Copia o vídeo sem recodificação, evitando carga na CPU
            ])
            // inicia a gravação
            .on('start', () => {
                console.log(`Iniciando gravação: ${outputPath}`);
            })
            // ao finalizar a gravação, envia pra fila de upload
            .on('end', () => {
                console.log(`Gravação concluída: ${outputPath}`);

                // esquema de fila assincrona para que a gravação e o upload dos arquivos
                // ocorram de forma independente, sem que seja necessario
                // esperar pelo upload atual para que o proximo arquivo começe a ser gravado.
                // dessa forma, o arquivo concluido vai pra fila de upload e o proximo ja começa a ser gravado.
                fila.push(async () => {
                    console.log("--> upando", outputPath);
                    await sendFile(outputPath);
                    console.log("fim", outputPath);
                });

                resolve();
            })

            // caso ocorra um erro, rejeita a execução
            .on('error', (err) => {
                console.error(`Erro na gravação:`, err);

                // caso ocorra algum erro durante a gravação do arquivo, ele é removido e o loop passa pro proximo
                // evita acumulo de arquivos com erro
                try {
                    fs.promises.unlink(outputPath)
                } catch (error) { }
                reject(err);
            })
            .save(outputPath);
    });
}


// função em loop para reiniciar a gravação caso ocorra algum erro no ffmpeg
// evita que o script crashe caso ocorra alguma variação na rede
async function continuousRecording() {
    while (true) {
        try {
            await startRecording();
        } catch (err) {
            // evita que o loop fique descontrolado caso ocorra erros constantes
            // cada loop irá esperar 2s para iniciar o proximo em caso de erro
            await sleep(2000)
            console.log('Falha de rede ou erro de gravação, reiniciando...');
            console.log(err);
        }
    }
}

continuousRecording();