var crypto = require("crypto");

module.exports = {
    encryptStringWithPublicKeyX509: async (plaintext, chavePublica) => {
        let strBuffer, encrypted;
        if (typeof plaintext === 'object') {
            strBuffer = JSON.stringify(plaintext);
        } else {
            strBuffer = `${plaintext}`;
        }
        encrypted = crypto.publicEncrypt(`-----BEGIN PUBLIC KEY-----\n ${chavePublica} \n-----END PUBLIC KEY-----`, Buffer.from(strBuffer, 'utf8'));
        //encrypted = crypto.publicEncrypt(chavePublica, Buffer.from(strBuffer, 'utf8'));
        return encrypted.toString("base64");
    }
}