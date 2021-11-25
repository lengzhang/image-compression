import fs from 'fs';
import Jimp from 'jimp';

const LZW_DECODING_RUNTIME_LABEL = 'Lempel-Ziv-Welch (LZW) decoding';
const LZW_DECODED_FILE_PATH = './images/lzw-decoded.png';

const ROOT_DICTIONARY = Array.from({ length: Math.pow(2, 8) }).map(
    (_, i) => `${i}`,
);

/**
 * Decode the Lempel-Ziv-Welch (LZW) encoded grayscaled image file
 * @param {string} filePath
 */
const decoding = async (filePath) => {
    console.time(LZW_DECODING_RUNTIME_LABEL);
    console.log(`Reading encoded image data from ${filePath} ...`);
    const fileDataStr = await fs.promises.readFile(filePath, 'utf8');
    const data = fileDataStr.split('\n');

    const width = parseInt(data.shift());
    const height = parseInt(data.shift());
    const a = parseInt(data.shift());
    const dictionary = [...ROOT_DICTIONARY, ...data.shift().split(' ')];
    const encodedMessage = data.shift().split(' ');

    console.log(`Decoding encoded message by dictionary...`);
    const result = [];
    for (const msg of encodedMessage) {
        for (const p of dictionary[parseInt(msg)].split('-')) {
            const pixel = parseInt(p);
            result.push(pixel);
            result.push(pixel);
            result.push(pixel);
            result.push(a);
        }
    }

    console.log(
        `Writing decoded data to output file ${LZW_DECODED_FILE_PATH} ...`,
    );
    const image = new Jimp(width, height);
    image.bitmap.data = Buffer.from(result);
    await image.write(LZW_DECODED_FILE_PATH);
    console.log('');
    console.timeEnd(LZW_DECODING_RUNTIME_LABEL);
};

export default decoding;
