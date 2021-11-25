import fs from 'fs';
import Jimp from 'jimp';

const VLCH_ENCODING_RUNTIME_LABEL = 'Variable length coding encoding';
const VLCH_ENCODED_FILE_PATH = './images/vlch-encoded.vlch';

class MyNode {
    symbol;
    frequency;
    code = '';
    left = null;
    right = null;

    constructor(symbol = null, frequency) {
        this.symbol = symbol;
        this.frequency = frequency;
    }

    toString = () => {
        return `symbol: ${this.symbol}, frequency: ${this.frequency}, code: ${this.code}`;
    };
}

/**
 * Generate code
 * @param {MyNode} node
 * @param {string[]} codeArr
 * @param {number} level
 */
const generateCode = (node, codeArr, level) => {
    node.code = codeArr.join('');
    if (node.left !== null) {
        generateCode(node.left, [...codeArr, '1'], level + 1);
    }
    if (node.right !== null) {
        generateCode(node.right, [...codeArr, '0'], level + 1);
    }
};

/**
 * Encode grayscaled image by variable length Huffman coding
 * @param {string} filePath
 */
const encoding = async (filePath) => {
    console.time(VLCH_ENCODING_RUNTIME_LABEL);
    /** Read image from file **/
    console.log(`Reading image data from ${filePath} ...`);
    const image = await Jimp.read(filePath);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const probabilityMapper = {};
    let total = 0;

    console.log(`Computing probability for each pixel value...`);
    // For every 4 elements in imageData
    for (let i = 0; i < image.bitmap.data.length; i = i + 4) {
        const pixel = image.bitmap.data[i];
        probabilityMapper[pixel] = (probabilityMapper[pixel] ?? 0) + 1;
        total++;
    }

    const [mapper, arr] = Object.keys(probabilityMapper).reduce(
        ([mapper, arr], p) => {
            const frequency = probabilityMapper[p] / total;
            mapper[p] = new MyNode(parseInt(p), frequency);
            arr.push(mapper[p]);
            return [mapper, arr];
        },
        [{}, []],
    );

    console.log(`Forming the source reduction binary tree...`);
    while (arr.length > 1) {
        arr.sort((a, b) => a.frequency - b.frequency);
        const left = arr.shift();
        const right = arr.shift();

        if (!left || !right) break;

        const node = new MyNode(
            null,
            (left.frequency * 100 + right.frequency * 100) / 100,
        );
        node.left = left;
        node.right = right;
        arr.push(node);
    }

    const root = arr.shift();

    console.log(`Coding each reduced source...`);
    generateCode(root, [], 0);

    const [pixelCodeMapper, codePixelMapper] = Object.keys(mapper).reduce(
        ([a, b], p) => {
            const { symbol, code } = mapper[p];
            a[symbol] = code;
            b[code] = symbol;
            return [a, b];
        },
        [{}, {}],
    );

    const encodedMessages = [];

    console.log(`Computing encoded message by block codes...`);
    // For every 4 elements in imageData
    for (let i = 0; i < image.bitmap.data.length; i = i + 4) {
        const pixel = image.bitmap.data[i];
        encodedMessages.push(pixelCodeMapper[pixel]);
    }

    const encodedMessage = encodedMessages.join('');

    console.log(
        `Writing encoded data to output file ${VLCH_ENCODED_FILE_PATH} ...`,
    );
    /**
     * Encoded Data Format:
     * <width>
     * <height>
     * <JSON string of the dictionary which key is block code and value is the pixel value>
     * <encoded message>
     */
    const data = [
        width,
        height,
        JSON.stringify(codePixelMapper),
        encodedMessage,
    ].join('\n');
    await fs.promises.writeFile(VLCH_ENCODED_FILE_PATH, data);
    console.log('');
    console.timeEnd(VLCH_ENCODING_RUNTIME_LABEL);

    const originalData = image.bitmap.data.join(' ');
    console.log(
        `Compression Ratio = ${originalData.length} / ${
            encodedMessage.length
        } = ${originalData.length / encodedMessage.length}`,
    );
};

export default encoding;
