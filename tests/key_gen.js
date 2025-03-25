import crypto from 'crypto';

// Secret key for encryption (must be the same as used in the API)
const SECRET_KEY = 'default-secret-key-change-me'; // Replace with your actual key
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
    const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16); // Generate a random IV

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex')
    };
}

// Example text to encrypt
const text = "This is a secret message!";
const result = encrypt(text);

console.log("Encrypted Data:", result.encryptedData);
console.log("IV:", result.iv);
