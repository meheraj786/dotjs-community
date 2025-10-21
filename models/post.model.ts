import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IComment } from "./comment.model";

export interface IPost extends Document {
  type: "question" | "thought";
  content: string;
  codeBlock?: string;
  tags: string[];
  image?: string;
  author: IUser["_id"];
  likes: IUser["_id"][];
  comments: IComment["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    type: {
      type: String,
      enum: ["question", "thought"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    codeBlock: String,
    tags: {
      type: [String],
      default: [],
    },
    image: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
