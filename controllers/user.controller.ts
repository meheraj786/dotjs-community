import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/user.model";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  user?: IUser & { _id: Types.ObjectId };
}

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password, avatar });
    await user.save();

    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (_req: AuthRequest, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
};

export const followUser = async (req: AuthRequest, res: Response) => {
  const userIdToFollow = req.params.id as string;
  const currentUser = req.user!;

  const currentUserId = currentUser._id as Types.ObjectId;

  if (currentUserId.equals(userIdToFollow))
    return res.status(400).json({ message: "Cannot follow yourself" });

  const userToFollow = await User.findById(userIdToFollow);
  if (!userToFollow) return res.status(404).json({ message: "User not found" });

  const userToFollowId = userToFollow._id as Types.ObjectId;

  if (
    !userToFollow.followers.some((id: Types.ObjectId) =>
      id.equals(currentUserId)
    )
  ) {
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userToFollowId);

    await userToFollow.save();
    await currentUser.save();
  }

  res.json({ message: "Followed successfully" });
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const userIdToUnfollow = req.params.id as string;
    const currentUser = req.user!;
    const currentUserId = currentUser._id as Types.ObjectId;

    if (currentUserId.equals(userIdToUnfollow)) {
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow)
      return res.status(404).json({ message: "User not found" });

    const userToUnfollowId = userToUnfollow._id as Types.ObjectId;

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id: Types.ObjectId) => !id.equals(currentUserId)
    );

    currentUser.following = currentUser.following.filter(
      (id: Types.ObjectId) => !id.equals(userToUnfollowId)
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
