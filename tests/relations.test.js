import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { setUpConnection, disconnect } from '../src/mongoose.js';
import Post from '../src/models/Post.js';
import Comment from '../src/models/Comment.js';

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';
const relationsDbUri = testDbUri.replace(/\/[^/]+$/, '/be-boilerplate-relations');
const expectedDbName = relationsDbUri.split('/').pop();

describe('Post/Comment relation refs', () => {
  beforeAll(async () => {
    await setUpConnection(relationsDbUri);
    // Guard: the connection must actually point at the relations database.
    expect(mongoose.connection.name).toBe(expectedDbName);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnect();
  });

  it('populates Post.comments with the referenced comment documents', async () => {
    const comment = await new Comment({ author: 'commenter' }).save();
    const post = await new Post({ author: 'author', content: 'hello' }).save();
    post.comments.push(comment._id);
    await post.save();

    const populated = await Post.findById(post._id).populate('comments');

    expect(populated.comments).toHaveLength(1);
    expect(populated.comments[0]).toMatchObject({
      _id: comment._id,
      author: 'commenter',
    });
  });

  it('populates Comment.postId with the referenced post document', async () => {
    const post = await new Post({ author: 'author', content: 'hello' }).save();
    const comment = await new Comment({ author: 'commenter', postId: post._id }).save();

    const populated = await Comment.findById(comment._id).populate('postId');

    expect(populated.postId).toMatchObject({
      _id: post._id,
      author: 'author',
      content: 'hello',
    });
  });
});
