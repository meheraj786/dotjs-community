import { Request, Response } from "express";
import { Types } from "mongoose";
import Post, { IPost } from "../models/post.model";

interface AuthRequest extends Request {
  user?: { _id: Types.ObjectId; following: Types.ObjectId[] };
}

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, codeBlock, tags, image } = req.body;
    const author = req.user!._id;

    const post = new Post({
      type,
      content,
      codeBlock,
      tags,
      image,
      author,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  console.log(req.ip);
  
  try {
    const currentUser = req.user!;
    const type = req.query.type as string;
    const followingIds = currentUser?.following;

    let matchCondition = {};

    if (type === "following") {
      matchCondition = { author: { $in: followingIds } };
    } else {
      matchCondition = {}; 
    }

    const posts = await Post.aggregate([
      { $match: matchCondition },
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $limit: 50 },
    ]);

    await Post.populate(posts, { path: "author", select: "name avatar" });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name avatar")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name avatar" },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user!._id;

    const post = (await Post.findById(postId)) as IPost;
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.findIndex((id) =>
      (id as Types.ObjectId).equals(currentUserId)
    );

    if (index === -1) {
      post.likes.push(currentUserId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likesCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const checkIsLiked = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user!._id;

    const post = (await Post.findById(postId)) as IPost;
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.some((id) =>
      (id as Types.ObjectId).equals(currentUserId)
    );

    res.json({ isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likesCount = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;

    const post = (await Post.findById(postId)) as IPost;
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    res.json({ likesCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
