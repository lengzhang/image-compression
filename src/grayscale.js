import Jimp from 'jimp';

const GRAYSCALE_RUNTIME_LABEL = 'Grayscaling Runtime';
const GRAYSCALE_FILE_PATH = './images/grayscale.png';

/**
 * Encode image by run length coding
 * @param {string} filePath
 */
const encoding = async (filePath) => {
    console.time(GRAYSCALE_RUNTIME_LABEL);
    /** Read image from file **/
    console.log(`Reading image data from ${filePath} ...`);
    const image = await Jimp.read(filePath);

    /** Convert the image to grayscale **/
    image.grayscale().write(GRAYSCALE_FILE_PATH);
    console.timeEnd(GRAYSCALE_RUNTIME_LABEL);
};

export default encoding;
