export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  _count: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}
