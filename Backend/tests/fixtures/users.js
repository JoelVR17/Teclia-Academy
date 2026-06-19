/**
 * User fixtures - plain JS objects (no DB calls)
 * These match the seeded users and are used for testing
 */

export const adminUser = {
  name: 'Admin User',
  email: 'admin@teclia.dev',
  password: 'Admin1234!', // Raw, unhashed
  role: 'admin'
};

export const studentUser = {
  name: 'Student One',
  email: 'student1@teclia.dev',
  password: 'Student1234!', // Raw, unhashed
  role: 'student'
};

export const studentUserTwo = {
  name: 'Student Two',
  email: 'student2@teclia.dev',
  password: 'Student1234!', // Raw, unhashed
  role: 'student'
};

/**
 * Export all fixtures as an object for convenience
 */
export default {
  adminUser,
  studentUser,
  studentUserTwo
};
