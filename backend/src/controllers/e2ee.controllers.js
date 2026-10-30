
import User from "../models/user.model.js";

// Register or update the authenticated user's public key.
export const registerPublicKey = async (req, res) => {
  try {
    const { publicKey, keyVersion } = req.body;
    const userId = req.user._id;

    if (
      typeof publicKey !== "string" ||
      !publicKey.trim() ||
      publicKey.length > 2048
    ) {
      return res.status(400).json({
        message: "Invalid public key",
      });
    }

    if (keyVersion !== 1) {
      return res.status(400).json({
        message: "Unsupported key version",
      });
    }

    // Do not silently replace an existing identity key.
    const user = await User.findById(userId).select(
      "e2eePublicKey e2eeKeyVersion"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.e2eePublicKey &&
      user.e2eePublicKey !== publicKey
    ) {
      return res.status(409).json({
        message: "An encryption key already exists. Key rotation requires a separate process.",
      });
    }

    user.e2eePublicKey = publicKey;
    user.e2eeKeyVersion = keyVersion;

    await user.save();

    return res.status(200).json({
      message: "Public key registered successfully",
      keyVersion: user.e2eeKeyVersion,
    });
  } catch (error) {
    console.error("Public key registration error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Retrieve another user's public key.
export const getPublicKey = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select(
      "e2eePublicKey e2eeKeyVersion"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.e2eePublicKey) {
      return res.status(404).json({
        message: "User has not registered an encryption key",
      });
    }

    return res.status(200).json({
      publicKey: user.e2eePublicKey,
      keyVersion: user.e2eeKeyVersion,
    });
  } catch (error) {
    console.error("Public key retrieval error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
