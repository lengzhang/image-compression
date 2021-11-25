import fs from 'fs';
import Jimp from 'jimp';

const RLCG_DECODING_RUNTIME_LABEL = 'Run length coding decoding';
const RLCG_DECODED_FILE_PATH = './images/rlcg-decoded.png';

/**
 * Decode the run length coding encoded grayscaled image file
 * @param {string} filePath
 */
const decoding = async (filePath) => {
    console.time(RLCG_DECODING_RUNTIME_LABEL);
    console.log(`Reading encoded image data from ${filePath} ...`);
    const fileDataStr = await fs.promises.readFile(filePath, 'utf8');
    const data = fileDataStr.split('\n');

    const width = parseInt(data.shift());
    const height = parseInt(data.shift());
    const a = parseInt(data.shift());

    console.log(`Decoding encoded message...`);
    const result = [];
    data[0].split(' ').forEach((value) => {
        const arr = value.split('!');
        const v = parseInt(arr[0]);
        const n = parseInt(arr[1] ?? 1);
        for (let i = 0; i < n; i++) {
            result.push(...Array.from({ length: 3 }).fill(v), a);
        }
    });

    console.log(
        `Writing decoded data to output file ${RLCG_DECODED_FILE_PATH} ...`,
    );
    const image = new Jimp(width, height);
    image.bitmap.data = Buffer.from(result);
    await image.write(RLCG_DECODED_FILE_PATH);
    console.log('');
    console.timeEnd(RLCG_DECODING_RUNTIME_LABEL);
};

export default decoding;
