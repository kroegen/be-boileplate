// TODO(architecture): Make this controller map HTTP input/output and call framework-independent post services.
import { createPost, getPosts } from '../services/posts/index.js';

export { createPost as create, getPosts as list };
