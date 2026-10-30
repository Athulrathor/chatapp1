import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import User from "../models/user.model.js";
import cloudinary from "../libs/cloudinary.js";
import { getProfileImageStream, saveProfileImage } from "../libs/gridfs.js";

export const getProfileImage = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await getProfileImageStream(fileId);

    res.set("Content-Type", file.contentType);
    res.set("Cache-Control", "public, max-age=86400");

    file.stream.pipe(res);
  } catch (error) {
    console.error("Profile image retrieval failed:", error);

    res.status(404).json({
      message: "Profile image not found",
    });
  }
};

export const signup = async (req, res) => {
<<<<<<< HEAD

    const { fullname, email, password, publicKey } = req.body;

    try {

        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salts = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salts);

        let key = "";

        if (!publicKey) {
            key = "sdghfsiudhgfaudsyashgd6a7s5d79a8sdyalsjdha97sd8a7s";
        } else {
            key = publicKey;
        }

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            publicKey: key
        });

        if (newUser) {

            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
                publicKey: newUser.publicKey
            });

        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" });
=======
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
>>>>>>> main
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Validate optional profile image
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Only JPEG, PNG, and WEBP images are allowed",
        });
      }
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePic = "";

    // Store profile image in GridFS
    if (req.file) {
      const fileId = await saveProfileImage(req.file.buffer, req.file.mimetype);

      profilePic = fileId;
    }

    const newUser = new User({
      fullname: fullname.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    return res.status(201).json({
      id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

<<<<<<< HEAD
    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!!!" });
        }

        const isPassword = await bcrypt.compare(password, user.password);

        if (!isPassword) {
            return res.status(400).json({ message: "Invalid credentials!!!" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
            publicKey: user.publicKey
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error!!!" });
    }
=======
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!!!" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(400).json({ message: "Invalid credentials!!!" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error!!!" });
  }
>>>>>>> main
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out successfully!!!" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal server error!!!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG, PNG, and WEBP images are allowed",
      });
    }

    // 1. Upload image to GridFS.
    const fileId = await saveProfileImage(
      req.file.buffer,
      req.file.mimetype,
    );

    // 3. Save URL in user document.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: fileId },
      { new: true },
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

export const checkAuth = async (req, res) => {
<<<<<<< HEAD
    
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller!!!", error.message);
        res.status(500).json({ message: "Internal server error!!!" });
    }
}
=======
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller!!!", error.message);
    res.status(500).json({ message: "Internal server error!!!" });
  }
};
>>>>>>> main
