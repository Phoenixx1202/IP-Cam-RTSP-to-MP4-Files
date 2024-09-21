import { exec } from 'child_process';
import path from 'path';
import fs, { promises as fsPromisses } from 'fs';

const addZero = (num) => num.toString().padStart(2, '0');

async function getFileModificationDate(filePath) {
    try {
        const stats = await fsPromisses.stat(filePath);
        return new Date(stats.ctime);
    } catch (error) {
        console.log(`Erro ao ler o arquivo: ${error.message}`);
        return new Date()
    }
}


export default async function sendFile(nomeArquivo, inputDate) {
    return new Promise((resolve, reject) => {
        let processedFilePath = undefined
        try {
            // Verifica se o arquivo existe
            if (!fs.existsSync(nomeArquivo)) {
                return null
            }
            const fileExtension = path.extname(nomeArquivo);

            const date = inputDate || await getFileModificationDate(nomeArquivo)
            const filename =
                addZero(date.getDate()) +
                '-' +
                addZero(date.getMonth() + 1) +
                '-' +
                date.getFullYear() +
                '_' +
                addZero(date.getHours()) +
                ';' +
                addZero(date.getMinutes()) +
                ';' +
                addZero(date.getSeconds())
            
            const cloudFolderByDate = `${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}-${date.getFullYear()}`

            const processedFileName = `${filename + fileExtension}`;
            processedFilePath = path.join(path.dirname(nomeArquivo), processedFileName);
            fs.renameSync(nomeArquivo, processedFilePath);

            const comando = `rclone copy "${processedFilePath}" onedrive:0-ipcam/${cloudFolderByDate}`;

            exec(comando, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao executar o rclone: ${error}`);
                    delFile(processedFilePath)
                    resolve(null);
                } else {
                    delFile(processedFilePath)
                    console.log("✅", nomeArquivo)
                    resolve(true);
                }
            });
        } catch (error) {
            console.log(error)
            delFile(processedFilePath)
            resolve(null)
        }
    });
}

function delFile(file) {
    try {
        fs.unlinkSync(file)
    } catch (error) {
        console.log(error.message)
    }
}