import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import type { EncryptedEnvelope } from "./types";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

export class SessionCrypto {
  private constructor(
    private readonly key: Buffer,
    readonly saltBase64: string
  ) {}

  static create(passphrase: string) {
    if (passphrase.length < 12) {
      throw new Error("ELARIS_EDGE_PASSPHRASE must be at least 12 characters");
    }

    const salt = randomBytes(16);
    return new SessionCrypto(deriveKey(passphrase, salt), salt.toString("base64"));
  }

  static fromPassphrase(passphrase: string, saltBase64: string) {
    if (passphrase.length < 12) {
      throw new Error("ELARIS_EDGE_PASSPHRASE must be at least 12 characters");
    }

    const salt = Buffer.from(saltBase64, "base64");
    return new SessionCrypto(deriveKey(passphrase, salt), saltBase64);
  }

  encryptJson(value: unknown): EncryptedEnvelope {
    return this.encryptBuffer(Buffer.from(JSON.stringify(value), "utf8"));
  }

  decryptJson<T>(envelope: EncryptedEnvelope): T {
    const buffer = this.decryptBuffer(envelope);
    return JSON.parse(buffer.toString("utf8")) as T;
  }

  encryptBuffer(plaintext: Buffer): EncryptedEnvelope {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      version: 1,
      algorithm: "AES-256-GCM",
      ivBase64: iv.toString("base64"),
      tagBase64: tag.toString("base64"),
      ciphertextBase64: ciphertext.toString("base64"),
    };
  }

  decryptBuffer(envelope: EncryptedEnvelope) {
    if (envelope.version !== 1 || envelope.algorithm !== "AES-256-GCM") {
      throw new Error("Unsupported Elaris Edge encrypted envelope");
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(envelope.ivBase64, "base64")
    );
    decipher.setAuthTag(Buffer.from(envelope.tagBase64, "base64"));

    return Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertextBase64, "base64")),
      decipher.final(),
    ]);
  }
}

function deriveKey(passphrase: string, salt: Buffer) {
  return scryptSync(passphrase, salt, KEY_LENGTH);
}
