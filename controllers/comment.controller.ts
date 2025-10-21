import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment, { IComment } from "../models/comment.model";
import Post from "../models/post.model";

interface AuthRequest extends Request {
  user?: { _id: Types.ObjectId };
}

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const author = req.user!._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({ content, author, post: post._id });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name avatar"
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate(
      "author",
      "name avatar"
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    const currentUserId = req.user!._id;

    const comment = (await Comment.findById(commentId)) as IComment;
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!(comment.author as Types.ObjectId).equals(currentUserId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.content = content;
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name avatar"
    );

    res.json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const currentUserId = req.user!._id;

    const comment = (await Comment.findById(commentId)) as IComment;
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Fix 2️⃣: author assertion
    if (!(comment.author as Types.ObjectId).equals(currentUserId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // Fix 3️⃣: use deleteOne instead of remove
    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const currentUserId = req.user!._id;

    const comment = (await Comment.findById(commentId)) as IComment;
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const index = comment.likes.findIndex((id) =>
      (id as Types.ObjectId).equals(currentUserId)
    );

    if (index === -1) {
      comment.likes.push(currentUserId);
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();
    res.json({ likesCount: comment.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommentsByPost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ post: postId })
      .populate("author", "name avatar")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
