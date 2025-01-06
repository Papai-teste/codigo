var crypto = require("crypto");
var fs = require("fs")
var path = require("path");

module.exports = {
    decryptStringWithPrivateKey: (plaintext) => {
        var absolutePath = path.resolve(__dirname + '/private.pem');
        var privateKey = fs.readFileSync(absolutePath, "utf8");
        const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          passphrase: 'abcd12',
        },
        Buffer.from(plaintext, "base64")
      );
    
      return decrypted.toString("utf8");
    }
}