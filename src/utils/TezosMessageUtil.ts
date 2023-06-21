/*eslint no-bitwise: 0*/
import bigInt from 'big-integer';

/**
 * A collection of functions to encode and decode various Tezos P2P message components like amounts, addresses, hashes, etc.
 * 
 * Magic prefixes taken from: https://gitlab.com/tezos/tezos/blob/master/src/lib_crypto/base58.ml#L343
 */
export namespace TezosMessageUtils {
    /**
     * Encodes a boolean as 0 or 255 by calling writeInt.
     * @param {boolean} value 
     */
    export function writeBoolean(value: boolean): string {
        return value ? "ff" : "00";
    }

    /**
     * Takes a bounded hex string that is known to contain a boolean and decodes it as int.
     * @param {string} hex Encoded message part.
     */
    export function readBoolean(hex: string): boolean {
        return parseInt(hex, 16) > 0 ? true : false;
    }

    /**
     * Encodes an uint into hex after converting it to Zarith format.
     * @param {number} value Number to be obfuscated.
     */
    export function writeInt(value: number): string {
        if (value < 0) { throw new Error('Use writeSignedInt to encode negative numbers'); }
        //@ts-ignore
        return Buffer.from(Buffer.from(twoByteHex(value), 'hex').map((v, i) => { return i === 0 ? v : v ^ 0x80; }).reverse()).toString('hex');
    }

    /**
     * Encodes a signed integer into hex.
     * @param {number} value Number to be obfuscated.
     */
    export function writeSignedInt(value: number): string {
        if (value === 0) { return '00'; }

        let n = bigInt(value).abs();
        const l = n.bitLength().toJSNumber();
        let arr: number[] = [];

        for (let i = 0; i < l; i += 7) {
            let byte = bigInt.zero;

            if (i === 0) {
                byte = n.and(0x3f); // first byte makes room for sign flag
                n = n.shiftRight(6);
            } else {
                byte = n.and(0x7f); // NOT base128 encoded
                n = n.shiftRight(7);
            }

            if (value < 0 && i === 0) { byte = byte.or(0x40); } // set sign flag

            if (i + 7 < l) { byte = byte.or(0x80); } // set next byte flag

            arr.push(byte.toJSNumber());
        }

        if (l % 7 === 0) {
            arr[arr.length - 1] = arr[arr.length - 1] | 0x80;
            arr.push(1);
        }

        return arr.map(w => ('0' + w.toString(16)).slice(-2)).join('');
    }

    /**
     * Takes a bounded hex string that is known to contain a number in Zarith format and decodes the uint.
     * @param {string} hex Encoded message part.
     */
    export function readInt(hex: string): number {
        //@ts-ignore
        const h = Buffer.from(Buffer.from(hex, 'hex').reverse().map((v, i) => { return i === 0 ? v : v & 0x7f; })).toString('hex')
        return fromByteHex(h);
    }

    export function readSignedInt(hex: string): number {
        const positive = (Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40) ? false : true;
        //@ts-ignore
        const arr = Buffer.from(hex, 'hex').map((v, i) => i === 0 ? v & 0x3f : v & 0x7f);
        let n = bigInt.zero;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (i === 0) {
                n = n.or(arr[i]);
            } else {
                n = n.or(bigInt(arr[i]).shiftLeft(7 * i - 1));
            }
        }

        return positive ? n.toJSNumber() : n.negate().toJSNumber();
    }

    /**
     * Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
     * @param {string} hex Encoded message.
     * @param {number} offset Offset within the message to start decoding from.
     */
    export function findInt(hex: string, offset: number, signed: boolean = false) {
        let buffer = '';
        let i = 0;
        while (offset + i * 2 < hex.length) {
            let start = offset + i * 2;
            let end = start + 2;
            let part = hex.substring(start, end);
            buffer += part;
            i += 1;

            if (parseInt(part, 16) < 128) { break; }
        }

        return signed ? { value: readSignedInt(buffer), length: i * 2 } : { value: readInt(buffer), length: i * 2 };
    }

    export function writeString(value: string): string {
        const len = dataLength(value.length);
        const text = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');

        return len + text;
    }

    export function readString(hex: string): string {
        const stringLen = parseInt(hex.substring(0, 8), 16);
        if (stringLen === 0) { return ''; }

        const stringHex = hex.slice(8);

        let text = '';
        for (let i = 0; i < stringHex.length; i += 2) {
            text += String.fromCharCode(parseInt(stringHex.substring(i, i + 2), 16));
        }

        return text;
    }

    function dataLength(value: number) {
        return ('0000000' + (value).toString(16)).slice(-8);
    }

    /**
     * Creates a binary representation of the provided value. This is the equivalent of the PACK instruction in Michelson.
     * 
     * @param value string, number or bytes to encode. A string value can also be code.
     * @param type Type of data to encode, supports various Michelson primitives like int, nat, string, key_hash, address and bytes. This argument should be left blank if encoding a complex value, see format.
     * @param format value format, this argument is used to encode complex values, Michelson and Micheline encoding is supported with the internal parser.
     */
    export function writePackedData(value: string | number | Buffer, type: string): string {
        switch (type) {
            case 'int': {
                return '0500' + writeSignedInt(value as number);
            }
            case 'nat': {
                return '0500' + writeInt(value as number);
            }
            case 'string': {
                return '0501' + writeString(value as string);
            }
            case 'bytes': {
                const buffer = (value as Buffer).toString('hex');
                return `050a${dataLength(buffer.length / 2)}${buffer}`;
            }
            default: {
                throw new Error(`Unrecognized data type or format: '${type}', 'format':`);
            }
        }
    }

    /**
     * Reads PACKed data into an output format specified in the type parameter.
     * 
     * @param {string} hex 
     * @param {string} type One of int, nat, string, key_hash, address, bytes, michelson, micheline (default)
     */
    export function readPackedData(hex: string, type: string): string | number {
        switch (type) {
            case 'int': {
                return readSignedInt(hex.slice(4));
            }
            case 'nat': {
                return readInt(hex.slice(4));
            }
            case 'string': {
                return readString(hex.slice(4));
            }
            case 'bytes': {
                return hex.slice(4 + 8);
            }
            default: {
                throw new Error("Unhandled");
            }
        }
    }

    /**
     * Encodes the provided number as base128.
     * @param n 
     */
    function twoByteHex(n: number): string {
        if (n < 128) { return ('0' + n.toString(16)).slice(-2); }

        let h = '';
        if (n > 2147483648) {
            let r = bigInt(n);
            while (r.greater(0)) {
                h = ('0' + (r.and(127)).toString(16)).slice(-2) + h;
                r = r.shiftRight(7);
            }
        } else {
            let r = n;
            while (r > 0) {
                h = ('0' + (r & 127).toString(16)).slice(-2) + h;
                r = r >> 7;
            }
        }

        return h;
    }

    /**
     * Decodes the provided base128 string into a number
     * @param s 
     */
    function fromByteHex(s: string): number {
        if (s.length === 2) { return parseInt(s, 16); }

        if (s.length <= 8) {
            let n = parseInt(s.slice(-2), 16);

            for (let i = 1; i < s.length / 2; i++) {
                n += parseInt(s.slice(-2 * i - 2, -2 * i), 16) << (7 * i);
            }

            return n;
        }

        let n = bigInt(parseInt(s.slice(-2), 16));

        for (let i = 1; i < s.length / 2; i++) {
            n = n.add(bigInt(parseInt(s.slice(-2 * i - 2, -2 * i), 16)).shiftLeft(7 * i));
        }

        return n.toJSNumber();
    }

    /**
     * Helper to merge two Uint8Arrays.
     * 
     * @param a The first array.
     * @param b The second array.
     * @returns A new array that contains b appended to the end of a.
     */
    function mergeBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
        const merged = new Uint8Array(a.length + b.length)
        merged.set(a)
        merged.set(b, a.length)

        return merged
    }
}
