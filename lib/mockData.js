export const users = [
  { id: 1, username: 'double_d', name: 'Double D', email: 'simplytobs@gmail.com', followers: 50, following: [2, 3], profilePicture: '/placeholder.svg?height=100&width=100' },
  { id: 2, username: 'john_doe', name: 'John Doe', email: 'john@example.com', followers: 50, following: [2, 3], profilePicture: '/placeholder.svg?height=100&width=100' },
  { id: 3, username: 'jane_smith', name: 'Jane Smith', email: 'jane@example.com', followers: 75, following: [1, 3], profilePicture: '/placeholder.svg?height=100&width=100' },
  { id: 4, username: 'double_d', name: 'Daniel', email: 'dan@oja.com', followers: 30, following: [1, 2], profilePicture: '/placeholder.svg?height=100&width=100' },
];

export const posts = [
  
  {
    id: 1,
    title: 'Trying out long text',
    content: 'What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
    author: users[1],
    createdAt: '2023-05-03T09:00:00Z',
    comments: [
      { id: 1, content: 'Great post!', author: users[1], createdAt: '2023-05-01T13:00:00Z' },
      { id: 2, content: 'Very helpful, thanks!', author: users[2], createdAt: '2023-05-01T14:00:00Z' },
    ],
    likes: 10,
    bookmarks: 18,
  },
  {
    id: 2,
    title: 'Getting Started with Next.js',
    content: 'Next.js is a powerful React framework that makes building web applications a breeze...',
    author: users[1],
    createdAt: '2023-05-01T12:00:00Z',
    comments: [
      { id: 1, content: 'Great post!', author: users[1], createdAt: '2023-05-01T13:00:00Z' },
      { id: 2, content: 'Very helpful, thanks!', author: users[2], createdAt: '2023-05-01T14:00:00Z' },
    ],
    likes: 15,
    bookmarks: 5,
  },
  {
    id: 3,
    title: 'The Future of Web Development',
    content: 'As we look ahead, the landscape of web development continues to evolve rapidly...',
    author: users[2],
    createdAt: '2023-05-02T10:00:00Z',
    comments: [
      { id: 3, content: 'Interesting perspective!', author: users[0], createdAt: '2023-05-02T11:00:00Z' },
    ],
    likes: 10,
    bookmarks: 3,
  },
  {
    id: 4,
    title: 'Using AI for Development',
    content: 'I am using AI to generate? the code for this new blog site...',
    author: users[3],
    createdAt: '2023-05-03T09:00:00Z',
    comments: [],
    likes: 20,
    bookmarks: 8,
  },
  
  
];

export const userActivity = {
  1: { postsCount: 10, commentsCount: 25, likesCount: 50 },
  2: { postsCount: 15, commentsCount: 30, likesCount: 75 },
  3: { postsCount: 5, commentsCount: 15, likesCount: 30 },
  4: { postsCount: 15, commentsCount: 10, likesCount: 40 },
};

