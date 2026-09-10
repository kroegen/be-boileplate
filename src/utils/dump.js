export const dumpPost = (post) => {
  return {
    id: post._id,
    author: post.author,
    content: post.content,
  };
};

export const dumpComment = (comment) => {
  return {
    id: comment._id,
    author: comment.author,
    content: comment.content,
  };
};

export const dumpUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    status: user.status,
    role: user.role,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
