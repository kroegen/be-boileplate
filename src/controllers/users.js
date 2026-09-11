// TODO(architecture): Make this controller map HTTP input/output and call framework-independent user services.
import { createUser, getUsers } from '../services/users/index.js';

export { createUser as create, getUsers as list };
