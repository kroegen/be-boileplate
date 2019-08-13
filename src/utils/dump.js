exports.dumpPost = post => {
    return {
        id      : post._id,
        author  : post.author,
        content : post.content,
    }
}

exports.dumpComment = comment => {
    return {
        id      : comment._id,
        author  : comment.author,
        content : comment.content,
    }
}

exports.dumpUser = user => {
    return {
        id        : user._id,
        name      : user.name,
        status    : user.status,
        role      : user.role,
        email     : user.email,
        createdAt : user.createdAt,
        updatedAt : user.updatedAt,
    }
}
