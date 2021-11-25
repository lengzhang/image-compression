import fs from 'fs';
import Jimp from 'jimp';

const LZW_ENCODING_RUNTIME_LABEL = 'Lempel-Ziv-Welch (LZW) encoding';
const LZW_ENCODED_FILE_PATH = './images/lzw-encoded.lzw';

const ROOT_DICTIONARY = Array.from({ length: Math.pow(2, 8) }).map(
    (_, i) => `${i}`,
);

/**
 * Encode grayscaled image by Lempel-Ziv-Welch (LZW)
 * @param {string} filePath
 */
const encoding = async (filePath) => {
    console.time(LZW_ENCODING_RUNTIME_LABEL);
    /** Read image from file **/
    console.log(`Reading image data from ${filePath} ...`);
    const image = await Jimp.read(filePath);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let aSum = 0;
    let aCount = 0;

    const dictionary = [...ROOT_DICTIONARY];
    const encodedMessage = [];
    const newDictEntry = [];

    console.log(`Computing encoded message and dictionary...`);
    // For every 4 elements in imageData
    for (let i = 0; i < image.bitmap.data.length; i = i + 4) {
        const input = `${image.bitmap.data[i]}`;
        aSum += parseInt(image.bitmap.data[i + 3]);
        aCount++;

        newDictEntry.push(input);
        const dictEntry = newDictEntry.join('-');
        const transmitted = newDictEntry
            .slice(0, newDictEntry.length - 1)
            .join('-');

        const entryNotExist = !dictionary.includes(dictEntry);
        if (entryNotExist) {
            dictionary.push(dictEntry);
            encodedMessage.push(dictionary.indexOf(transmitted));
            newDictEntry.length = 0;
            newDictEntry.push(input);
        }
    }

    if (newDictEntry.length > 0) {
        const dictEntry = newDictEntry.join('-');
        encodedMessage.push(dictionary.indexOf(dictEntry));
        newDictEntry.length = 0;
    }

    console.log(
        `Writing encoded data to output file ${LZW_ENCODED_FILE_PATH} ...`,
    );
    const dictionaryData = dictionary.slice(ROOT_DICTIONARY.length).join(' ');
    const encodedData = encodedMessage.join(' ');

    const a = Math.max(Math.min(Math.round(aSum / aCount), 255), 0);
    /**
     * Encoded Data Format:
     * <width>
     * <height>
     * <average value for A>
     * <dictionary data without the root dictionary which from 0 to 255>
     * <encoded message>
     */
    const data = [width, height, a, dictionaryData, encodedData].join('\n');

    await fs.promises.writeFile(LZW_ENCODED_FILE_PATH, data);
    console.log('');
    console.timeEnd(LZW_ENCODING_RUNTIME_LABEL);

    const originalData = image.bitmap.data.join(' ');

    console.log(
        `Compression Ratio = ${originalData.length} / ${data.length} = ${
            originalData.length / data.length
        }`,
    );
};

export default encoding;
