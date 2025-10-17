import mongoose, { Document, Schema } from "mongoose";
import { IPost } from "./post.model";
import { IUser } from "./user.model";

export interface IComment extends Document {
  content: string;
  author: IUser["_id"];
  post: IPost["_id"];
  likes: IUser["_id"][]; 
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;
