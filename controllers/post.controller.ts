import { Request, Response } from "express";
import { Types } from "mongoose";
import Post, { IPost } from "../models/post.model";
import uploadOnCloudinary from "../utils/cloudinary";

interface AuthRequest extends Request {
  user?: { _id: Types.ObjectId; following: Types.ObjectId[] };
}


export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, codeBlock, tags } = req.body;
    const author = req.user!._id;

    let imageUrl = "";

    if (req.file?.path) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (!uploadResult) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      imageUrl = uploadResult.secure_url;
    }

    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];

    const post = new Post({
      type,
      content,
      codeBlock,
      tags: parsedTags,
      image: imageUrl || null,
      author,
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
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
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
    ]);
    await Post.populate(posts, [
      { path: "author", select: "name avatar" },
      {
        path: "comments",
        populate: { path: "author", select: "name avatar" },
      },
    ]);

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

export const getTrendingTopics = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trendingTopics = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          tags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          tag: "$_id",
          postsCount: "$count",
        },
      },
    ]);

    res.json(trendingTopics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostsByTag = async (req: AuthRequest, res: Response) => {
  try {
    const tag = req.params.tag;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      {
        $match: {
          tags: tag,
        },
      },
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalCount = await Post.countDocuments({ tags: tag });

    await Post.populate(posts, [
      { path: "author", select: "name username avatar verified" },
      { path: "comments", select: "content author createdAt" },
    ]);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount,
        hasMore: skip + posts.length < totalCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
