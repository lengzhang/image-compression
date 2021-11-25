import Jimp from 'jimp';

const RMS_RUNTIME_LABEL = 'Root-Mean-Squared Error Runtime';

const rootMeanSquaredError = async (filePathOne, filePathTwo) => {
    console.time(RMS_RUNTIME_LABEL);
    /** Read first image from file **/
    console.log(`Reading first image data from ${filePathOne} ...`);
    const imageOne = await Jimp.read(filePathOne);
    /** Read second image from file **/
    console.log(`Reading second image data from ${filePathTwo} ...`);
    const imageTwo = await Jimp.read(filePathTwo);

    const dataOne = imageOne.bitmap.data;
    const dataTwo = imageTwo.bitmap.data;

    let sum = 0;
    for (let i = 0; i < dataOne.length; i++) {
        const diff = parseInt(dataOne[i] ?? 0) - parseInt(dataTwo[i] ?? 0);
        sum = sum + diff * diff;
    }

    const mse = sum / dataOne.length;
    const rmse = Math.sqrt(mse);
    console.log(`Root-Mean-Squared Error = ${rmse}`);

    console.log('');
    console.timeEnd(RMS_RUNTIME_LABEL);
};

export default rootMeanSquaredError;
