import grayscale from './grayscale.js';
import rlcgEncoding from './rlcg/encoding.js';
import rlcgDecoding from './rlcg/decoding.js';
import rlcbpEncoding from './rlcbp/encoding.js';
import rlcbpDecoding from './rlcbp/decoding.js';
import vlchEncoding from './vlch/encoding.js';
import vlchDecoding from './vlch/decoding.js';
import lzwEncoding from './lzw/encoding.js';
import lzwDecoding from './lzw/decoding.js';
import rootMeanSquaredError from './rootMeanSquaredError.js';

const HELP_MESSAGE = `
npm start <compression-command> <image-file-path>

Usage:
npm start grayscale <image-file-path>
npm start rlc-encoding <image-file-path>\t\tEncode the image by Run Length Coding
npm start rlc-decoding <image-file-path>\t\tDecode the image by Run Length Coding
npm start rlcbp-encoding <image-file-path>\t\tEncode the image by Run Length Coding on Bit Planes
npm start rlcbp-decoding <image-file-path>\t\tDecode the image by Run Length Coding on Bit Planes
npm start vlch-encoding <image-file-path>\t\tEncode the image by Variable Length Huffman Coding
npm start vlch-decoding <image-file-path>\t\tDecode the image by Variable Length Huffman Coding
npm start lzw-encoding <image-file-path>\t\tEncode the image by Lempel-Ziv-Welch (LZW) Coding
npm start lzw-decoding <image-file-path>\t\tDecode the image by Lempel-Ziv-Welch (LZW) Coding
npm start rms <image-file-path> <image-file-path>\t\tCompute the Root-Mean-Squared Error of both images
`;

/**
 * Main function for the application
 * @param {string[]} argv
 */
const main = async (argv) => {
    const command = argv[2].toLowerCase();
    const filePath = argv[3];

    try {
        if (!command) {
            throw Error('Compression is missing!!');
        }
        if (!filePath) {
            throw Error('File path is missing!!');
        }

        if (command === 'rms') {
            const filePathTwo = argv[4];

            if (!filePathTwo) {
                throw Error('File path two is missing!!');
            }

            await rootMeanSquaredError(filePath, filePathTwo);

            return;
        }

        const operation =
            command === 'grayscale'
                ? grayscale
                : command === 'rlcg-encoding'
                ? rlcgEncoding
                : command === 'rlcg-decoding'
                ? rlcgDecoding
                : command === 'rlcbp-encoding'
                ? rlcbpEncoding
                : command === 'rlcbp-decoding'
                ? rlcbpDecoding
                : command === 'vlch-encoding'
                ? vlchEncoding
                : command === 'vlch-decoding'
                ? vlchDecoding
                : command === 'lzw-encoding'
                ? lzwEncoding
                : command === 'lzw-decoding'
                ? lzwDecoding
                : null;

        if (operation !== null) await operation(filePath);
    } catch (error) {
        console.log(error.message);
        console.log(HELP_MESSAGE);
    }
};

main(process.argv);
