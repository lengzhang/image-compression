import fs from 'fs';
import Jimp from 'jimp';

const RLCBP_DECODING_RUNTIME_LABEL = 'Run length coding bit plane decoding';
const RLCBP_DECODED_FILE_PATH = './images/rlcbp-decoded.png';

/**
 * Decode the run length coding bit plane encoded grayscaled image file
 * @param {string} filePath
 */
const decoding = async (filePath) => {
    console.time(RLCBP_DECODING_RUNTIME_LABEL);
    console.log(`Reading encoded image data from ${filePath} ...`);
    const fileDataStr = await fs.promises.readFile(filePath, 'utf8');
    const data = fileDataStr.split('\n');

    const width = parseInt(data.shift());
    const height = parseInt(data.shift());
    const a = parseInt(data.shift());

    const bitPlanes = [];
    const encodedBitPlanes = data.map((v) => v.split(' '));
    for (let i = 0; i < encodedBitPlanes.length; i++) {
        const encodedBitPlane = encodedBitPlanes[i];
        const index = 8 - i;
        console.log(
            `Decoding encoded message for ${index}${
                index === 1
                    ? 'st'
                    : index === 2
                    ? 'nd'
                    : index === 3
                    ? 'rd'
                    : 'th'
            } bit plane`,
        );
        const bitPlane = [];
        encodedBitPlane.forEach((value) => {
            const arr = value.split('!');
            const v = parseInt(arr[0]);
            const n = parseInt(arr[1] ?? 1);
            bitPlane.push(...Array.from({ length: n * 3 }).fill(v));
        });
        bitPlanes.push(bitPlane);
    }

    const result = [];
    let counter = 0;
    console.log(`Combining bit planes for each pixel...`);
    for (let i = 0; i < bitPlanes[0].length; i++) {
        const bits = [];
        for (let j = 0; j < bitPlanes.length; j++) {
            bits.push(bitPlanes[j][i]);
        }
        result.push(parseInt(bits.join(''), 2));
        counter++;
        if (counter === 3) {
            result.push(a);
            counter = 0;
        }
    }

    console.log(
        `Writing decoded data to output file ${RLCBP_DECODED_FILE_PATH} ...`,
    );
    const image = new Jimp(width, height);
    image.bitmap.data = Buffer.from(result);
    await image.write(RLCBP_DECODED_FILE_PATH);
    console.log('');
    console.timeEnd(RLCBP_DECODING_RUNTIME_LABEL);
};

export default decoding;
