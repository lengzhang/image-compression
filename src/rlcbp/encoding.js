import fs from 'fs';
import Jimp from 'jimp';

const RLCBP_ENCODING_RUNTIME_LABEL = 'Run length coding bit plane encoding';
const RLCBP_ENCODED_FILE_PATH = './images/rlcbp-encoded.rlcbp';

/**
 * Encode grayscaled image by run length coding bit plane
 * @param {string} filePath
 */
const encoding = async (filePath) => {
    console.time(RLCBP_ENCODING_RUNTIME_LABEL);
    /** Read image from file **/
    console.log(`Reading image data from ${filePath} ...`);
    const image = await Jimp.read(filePath);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const bitPlanes = Array.from({ length: 8 }).map(() => []);
    let aSum = 0;
    let aCount = 0;

    console.log(`Spliting bit planes...`);
    // For every 4 elements in imageData
    for (let i = 0; i < image.bitmap.data.length; i = i + 4) {
        const current = image.bitmap.data[i];
        aSum += parseInt(image.bitmap.data[i + 3]);
        aCount++;

        current
            .toString(2)
            .padStart(8, '0')
            .split('')
            .forEach((value, index) => {
                bitPlanes[index].push(parseInt(value));
            });
    }

    const result = Array.from({ length: 8 }).map(() => []);
    for (let i = 0; i < bitPlanes.length; i++) {
        const index = 8 - i;
        console.log(
            `Computing encoded message for ${index}${
                index === 1
                    ? 'st'
                    : index === 2
                    ? 'nd'
                    : index === 3
                    ? 'rd'
                    : 'th'
            } bit plane`,
        );
        const queue = [];
        const bitPlane = bitPlanes[i];
        for (const current of bitPlane) {
            const last = queue[queue.length - 1];
            if (last === current) {
                queue.push(current);
                continue;
            }

            if (queue.length >= 4) {
                result[i].push(`${last}!${queue.length}`);
            } else {
                result[i].push(...queue.map((v) => `${v}`));
            }

            queue.length = 0; // Clear queue
            queue.push(current);
        }

        if (queue.length >= 4) {
            result[i].push(`${queue[queue.length - 1]}!${queue.length}`);
        } else if (queue.length > 0) {
            result[i].push(...queue.map((v) => `${v}`));
        }
    }

    console.log(
        `Writing encoded data to output file ${RLCBP_ENCODED_FILE_PATH} ...`,
    );
    /**
     * Encoded Data Format:
     * <width>
     * <height>
     * <average value for A>
     * <encoded message for 8th bit plane>
     * <encoded message for 7th bit plane>
     * <encoded message for 6th bit plane>
     * <encoded message for 5th bit plane>
     * <encoded message for 4th bit plane>
     * <encoded message for 3rd bit plane>
     * <encoded message for 2nd bit plane>
     * <encoded message for 1st bit plane>
     */
    const data = [
        width,
        height,
        aSum / aCount,
        ...result.map((arr) => arr.join(' ')),
    ].join('\n');

    await fs.promises.writeFile(RLCBP_ENCODED_FILE_PATH, data);
    console.log('');
    console.timeEnd(RLCBP_ENCODING_RUNTIME_LABEL);

    const originalData = image.bitmap.data.join(' ');
    console.log(
        `Compression Ratio = ${originalData.length} / ${data.length} = ${
            originalData.length / data.length
        }`,
    );
};

export default encoding;
