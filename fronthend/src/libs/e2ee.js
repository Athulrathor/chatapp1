const DB_NAME = "chat-e2ee";
const STORE_NAME = "identity";
const IDENTITY_KEY = "current";

const ENCRYPTION_VERSION = 1;

// ---------- IndexedDB ----------

const openKeyDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveIdentity = async (identity) => {
  const db = await openKeyDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(identity, IDENTITY_KEY);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const loadIdentity = async () => {
  const db = await openKeyDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(IDENTITY_KEY);

    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// ---------- Base64 helpers ----------

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

// ---------- Identity key generation ----------

export const initializeIdentityKey = async () => {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable");
  }

  const existingIdentity = await loadIdentity();

  if (existingIdentity) {
    return {
      publicKey: existingIdentity.publicKey,
      keyVersion: ENCRYPTION_VERSION,
    };
  }

  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false,
    ["deriveBits"],
  );

  const exportedPublicKey = await crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );

  const publicKey = arrayBufferToBase64(exportedPublicKey);

  await saveIdentity({
    privateKey: keyPair.privateKey,
    publicKey,
  });

  return {
    publicKey,
    keyVersion: ENCRYPTION_VERSION,
  };
};

// ---------- Shared encryption key ----------

const deriveEncryptionKey = async ({
  privateKey,
  peerPublicKey,
  salt,
  senderId,
  receiverId,
}) => {
  const importedPeerKey = await crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(peerPublicKey),
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false,
    [],
  );

  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: importedPeerKey,
    },
    privateKey,
    256,
  );

  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveKey"],
  );

  // Both users derive the same conversation context.
  const conversationId = [senderId, receiverId].sort().join(":");

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: new TextEncoder().encode(`chat-e2ee-v1:${conversationId}`),
    },
    hkdfKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
};

// ---------- Encrypt text message ----------

export const encryptMessage = async ({
  text,
  senderId,
  receiverId,
  receiverPublicKey,
}) => {
  if (!text?.trim()) {
    throw new Error("Message cannot be empty");
  }

  const identity = await loadIdentity();

  if (!identity?.privateKey) {
    throw new Error("Encryption identity not initialized");
  }

  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptionKey = await deriveEncryptionKey({
    privateKey: identity.privateKey,
    peerPublicKey: receiverPublicKey,
    salt,
    senderId,
    receiverId,
  });

  const additionalData = new TextEncoder().encode(
    JSON.stringify({
      version: ENCRYPTION_VERSION,
      senderId,
      receiverId,
    }),
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData,
      tagLength: 128,
    },
    encryptionKey,
    new TextEncoder().encode(text),
  );

  return {
    encryptionVersion: ENCRYPTION_VERSION,
    encryptedPayload: {
      ciphertext: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv.buffer),
      salt: arrayBufferToBase64(salt.buffer),
    },
  };
};

// ---------- Decrypt text message ----------

export const decryptMessage = async ({
  message,
  peerPublicKey,
  currentUserId,
}) => {
  if (message.encryptionVersion !== ENCRYPTION_VERSION) {
    throw new Error("Unsupported encryption version");
  }

  const identity = await loadIdentity();

  if (!identity?.privateKey) {
    throw new Error("Encryption identity not initialized");
  }

  const { senderId, receiverId, encryptedPayload } = message;

  if (
    String(senderId) !== String(currentUserId) &&
    String(receiverId) !== String(currentUserId)
  ) {
    throw new Error("You are not a participant in this message");
  }

  if (
    !encryptedPayload?.ciphertext ||
    !encryptedPayload?.iv ||
    !encryptedPayload?.salt
  ) {
    console.log("DECRYPT FUNCTION INPUT:", {
      encryptionVersion: message?.encryptionVersion,
      senderId: message?.senderId,
      receiverId: message?.receiverId,
      encryptedPayload: message?.encryptedPayload,
      payloadKeys: Object.keys(message?.encryptedPayload || {}),
    });
    throw new Error("Invalid encrypted message");
  }

  const salt = new Uint8Array(base64ToArrayBuffer(encryptedPayload.salt));

  const iv = new Uint8Array(base64ToArrayBuffer(encryptedPayload.iv));

  if (salt.length !== 32 || iv.length !== 12) {
    throw new Error("Invalid encryption parameters");
  }

  const encryptionKey = await deriveEncryptionKey({
    privateKey: identity.privateKey,
    peerPublicKey,
    salt,
    senderId,
    receiverId,
  });

  const additionalData = new TextEncoder().encode(
    JSON.stringify({
      version: ENCRYPTION_VERSION,
      senderId,
      receiverId,
    }),
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData,
      tagLength: 128,
    },
    encryptionKey,
    base64ToArrayBuffer(encryptedPayload.ciphertext),
  );

  return new TextDecoder().decode(decryptedBuffer);
};

// ---------- Encrypt image ----------

export const encryptImage = async ({
  file,
  senderId,
  receiverId,
  receiverPublicKey,
}) => {
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    throw new Error("A valid image file is required");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5 MB");
  }

  const identity = await loadIdentity();

  if (!identity?.privateKey) {
    throw new Error("Encryption identity not initialized");
  }

  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptionKey = await deriveEncryptionKey({
    privateKey: identity.privateKey,
    peerPublicKey: receiverPublicKey,
    salt,
    senderId,
    receiverId,
  });

  // Bind the original image type to the encrypted data.
  const additionalData = new TextEncoder().encode(
    JSON.stringify({
      version: ENCRYPTION_VERSION,
      senderId,
      receiverId,
      type: "image",
      mimeType: file.type,
    }),
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData,
      tagLength: 128,
    },
    encryptionKey,
    await file.arrayBuffer(),
  );

  return {
    encryptionVersion: ENCRYPTION_VERSION,

    encryptedPayload: {
      iv: arrayBufferToBase64(iv.buffer),
      salt: arrayBufferToBase64(salt.buffer),
      mimeType: file.type,
    },

    // Upload this binary Blob, not the original file.
    encryptedBlob: new Blob([encryptedBuffer], {
      type: "application/octet-stream",
    }),
  };
};

// ---------- Decrypt image ----------

export const decryptImage = async ({
  message,
  encryptedBlob,
  peerPublicKey,
  currentUserId,
}) => {
  if (message.encryptionVersion !== ENCRYPTION_VERSION) {
    throw new Error("Unsupported encryption version");
  }

  const identity = await loadIdentity();

  if (!identity?.privateKey) {
    throw new Error("Your encryption identity is unavailable");
  }

  const { senderId, receiverId } = message;

  const encryptedPayload =
    message.encryptedPayload?.image ?? message.encryptedPayload;

  if (
    String(senderId) !== String(currentUserId) &&
    String(receiverId) !== String(currentUserId)
  ) {
    throw new Error("You are not a participant in this message");
  }

  if (
    !encryptedPayload?.iv ||
    !encryptedPayload?.salt ||
    !encryptedPayload?.mimeType ||
    !(encryptedBlob instanceof Blob)
  ) {
    throw new Error("Invalid encrypted image");
  }

  if (!encryptedPayload.mimeType.startsWith("image/")) {
    throw new Error("Invalid image type");
  }

  const salt = new Uint8Array(base64ToArrayBuffer(encryptedPayload.salt));

  const iv = new Uint8Array(base64ToArrayBuffer(encryptedPayload.iv));

  if (salt.length !== 32 || iv.length !== 12) {
    throw new Error("Invalid encryption parameters");
  }

  const encryptionKey = await deriveEncryptionKey({
    privateKey: identity.privateKey,
    peerPublicKey,
    salt,
    senderId,
    receiverId,
  });

  const additionalData = new TextEncoder().encode(
    JSON.stringify({
      version: ENCRYPTION_VERSION,
      senderId,
      receiverId,
      type: "image",
      mimeType: encryptedPayload.mimeType,
    }),
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData,
      tagLength: 128,
    },
    encryptionKey,
    await encryptedBlob.arrayBuffer(),
  );

  return new Blob([decryptedBuffer], {
    type: encryptedPayload.mimeType,
  });
};
