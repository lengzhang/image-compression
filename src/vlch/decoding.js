import fs from 'fs';
import Jimp from 'jimp';

const VLCH_DECODING_RUNTIME_LABEL = 'Variable length coding encoding';
const VLCH_DECODED_FILE_PATH = './images/vlch-decoded.png';

/**
 * Decode the variable length Huffman encoded grayscaled image file
 * @param {string} filePath
 */
const decoding = async (filePath) => {
    console.time(VLCH_DECODING_RUNTIME_LABEL);
    console.log(`Reading encoded image data from ${filePath} ...`);
    const fileDataStr = await fs.promises.readFile(filePath, 'utf8');
    const data = fileDataStr.split('\n');

    const width = parseInt(data.shift());
    const height = parseInt(data.shift());
    const codePixelMapper = JSON.parse(data.shift());
    const encodedMsg = data.shift();

    const codes = Object.keys(codePixelMapper);

    console.log(`Decoding encoded message by block codes...`);
    const decodedMsg = [];
    let msg = '';
    for (const c of encodedMsg) {
        msg += c;
        if (codes.includes(msg)) {
            const pixel = parseInt(codePixelMapper[msg]);
            decodedMsg.push(pixel); // R
            decodedMsg.push(pixel); // G
            decodedMsg.push(pixel); // B
            decodedMsg.push(255); // A
            msg = '';
        }
    }

    console.log(
        `Writing decoded data to output file ${VLCH_DECODED_FILE_PATH} ...`,
    );
    const image = new Jimp(width, height);
    image.bitmap.data = Buffer.from(decodedMsg);
    await image.write(VLCH_DECODED_FILE_PATH);

    console.log('');
    console.timeEnd(VLCH_DECODING_RUNTIME_LABEL);
};

export default decoding;
