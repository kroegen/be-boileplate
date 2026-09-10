const Post = require('../../models/Post');
const { STATUS_SUCCESS } = require('../../utils').statusCodes;

exports.createPost = async (req, res) => {
  const { author, content } = req.body;
  const post = await new Post({ author, content });

  await post.save();
  await res.send({ status: STATUS_SUCCESS, data: { post } });
};
