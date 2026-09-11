// TODO(architecture): Make this controller map HTTP input/output and call framework-independent comment services.
import { createComment, getComments } from '../services/comments/index.js';

export { createComment as create, getComments as list };
