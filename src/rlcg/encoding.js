import fs from 'fs';
import Jimp from 'jimp';

const RLCG_ENCODING_RUNTIME_LABEL = 'Run length coding encoding';
const RLCG_ENCODED_FILE_PATH = './images/rlcg-encoded.rlcg';

/**
 * Encode grayscaled image by run length coding
 * @param {string} filePath
 */
const encoding = async (filePath) => {
    console.time(RLCG_ENCODING_RUNTIME_LABEL);
    /** Read image from file **/
    console.log(`Reading image data from ${filePath} ...`);
    const image = await Jimp.read(filePath);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const encodedMessages = [];
    const queue = [];
    let aSum = 0;
    let aCount = 0;

    console.log(`Computing encoded message...`);
    // For every 4 elements in imageData
    for (let i = 0; i < image.bitmap.data.length; i = i + 4) {
        const last = queue[queue.length - 1];
        const current = image.bitmap.data[i]; // The first element in every 4 elements
        aSum += parseInt(image.bitmap.data[i + 3]);
        aCount++;

        if (last === current) {
            queue.push(current);
            continue;
        }

        if (queue.length >= 4) {
            encodedMessages.push(`${last}!${queue.length}`);
        } else {
            encodedMessages.push(...queue.map((v) => `${v}`));
        }

        queue.length = 0; // Clear queue
        queue.push(current);
    }

    if (queue.length >= 4) {
        encodedMessages.push(`${queue[queue.length - 1]}!${queue.length}`);
    } else if (queue.length > 0) {
        encodedMessages.push(...queue.map((v) => `${v}`));
    }

    console.log(
        `Writing encoded data to output file ${RLCG_ENCODED_FILE_PATH} ...`,
    );
    const a = Math.max(Math.min(Math.round(aSum / aCount), 255), 0);
    const encodedMessage = encodedMessages.join(' ');
    /**
     * Encoded Data Format:
     * <width>
     * <height>
     * <average value for A>
     * <encoded message>
     */
    const data = [width, height, a, encodedMessage].join('\n');
    await fs.promises.writeFile(RLCG_ENCODED_FILE_PATH, data);

    console.log('');
    console.timeEnd(RLCG_ENCODING_RUNTIME_LABEL);

    const originalData = image.bitmap.data.join(' ');
    console.log(
        `Compression Ratio = ${originalData.length} / ${
            encodedMessage.length
        } = ${originalData.length / encodedMessage.length}`,
    );
};

export default encoding;
