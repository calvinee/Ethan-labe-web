/**
 * Fumadocs content collections.
 *
 * The collection declarations intentionally stay dependency-free so the
 * content generator can run in restricted build environments. Field-level
 * validation and editor controls live in public/admin/config.yml.
 */
export const blog = {
  type: 'doc',
  dir: 'content/blog',
};

export const blogNotes = {
  type: 'doc',
  dir: 'content/blog-notes',
};

export const products = {
  type: 'doc',
  dir: 'content/products',
};

export const learning = {
  type: 'doc',
  dir: 'content/learn',
};

export const mindmaps = {
  type: 'doc',
  dir: 'content/mindmaps',
};

export default {};
