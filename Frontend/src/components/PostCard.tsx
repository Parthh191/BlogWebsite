import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;        // Changed from _id to id
  text: string;
  user: string;
  userId: string; // Add this field
  createdAt: string;
}

interface PostCardProps {
  post: {
    id: string;  // Changed from _id to id to match Prisma's default
    title: string;
    description: string;
    imageUrl: string;
    author?: {
      username: string;
    };
    createdAt: string;
    isLiked: boolean; // Add this field
    _count?: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
  onUpdate: () => void;
}

const checkInitialLikeStatus = async (postId: string) => {
  try {
    const response = await fetch(`https://localhost:3000/api/artworks/${postId}/check-like`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to check like status');
    const data = await response.json();
    return data.isLiked;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// Add this utility function near the top of the file, after the interfaces
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  // Add this effect to sync like state with post prop
  useEffect(() => {
    setIsLiked(post.isLiked);
    setLikeCount(post._count?.likes || 0);
  }, [post.isLiked, post._count?.likes]);

  // Add this effect to fetch initial like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!post.id) return;
      const likeStatus = await checkInitialLikeStatus(post.id);
      setIsLiked(likeStatus);
    };
    
    fetchLikeStatus();
  }, [post.id]);

  // Add function to fetch comments
  const fetchComments = async () => {
    if (!post.id) {
      console.error('Post ID is undefined');
      return;
    }

    try {
      const response = await fetch(`https://localhost:3000/api/artworks/${post.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to fetch comments: ${response.statusText}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  // Fetch comments when comments are shown
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!post.id) return;

    // Store current state before optimistic update
    const wasLiked = isLiked;

    // Optimistically update UI
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`https://localhost:3000/api/artworks/${post.id}/likes`, {
        method: 'POST', // Always use POST, let backend handle toggle
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to update like status');
      
      const data = await response.json();
      // Update with server response to ensure consistency
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);

    } catch (error) {
      // Revert optimistic updates if request fails
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Error updating like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleShare = async () => {
    if (!post.id) {
      console.error('Post ID is undefined');
      return;
    }

    // Create the share data
    const shareData = {
      title: post.title,
      text: post.description,
      url: `${window.location.origin}/artwork/${post.id}`, // Adjust this URL according to your routing
      // If you want to share the image directly (optional)
      // files: [await (await fetch(post.imageUrl)).blob()]
    };

    try {
      // Check if the Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        
        // Record the share in your backend
        const response = await fetch(`https://localhost:3000/api/artworks/${post.id}/shares`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to record share');
        onUpdate();
        toast.success('Post shared successfully!');
      } else {
        // Fallback for browsers that don't support the Web Share API
        toast.error('Sharing is not supported on this browser');
        // Optional: You could show a modal with copy link functionality here
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled the share
        return;
      }
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.id) {
      console.error('Post ID is undefined');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://localhost:3000/api/artworks/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });
      
      if (!response.ok) throw new Error(`Failed to add comment: ${response.statusText}`);
      
      const newCommentData = await response.json();
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
      onUpdate();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`https://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      // Update comments state by filtering out the deleted comment
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden bg-gradient-to-br from-white to-pink-50
                 w-full sm:w-[95%] md:w-[85%] lg:w-[75%] xl:w-[60%] 
                 mx-auto mt-5
                 shadow-[0_0_15px_rgba(66,108,255,0.2),0_0_15px_rgba(147,51,234,0.2),4px_4px_15px_rgba(66,108,255,0.2),-4px_-4px_15px_rgba(147,51,234,0.2)]
                 hover:shadow-[0_0_20px_rgba(66,108,255,0.3),0_0_20px_rgba(147,51,234,0.3),8px_8px_20px_rgba(66,108,255,0.3),-8px_-8px_20px_rgba(147,51,234,0.3)]
                 transition-all duration-500 ease-in-out
                 hover:scale-[1.02]" // Added multi-directional shadow and subtle scale effect
    >
      {/* Post Header */}
      <div className="flex items-center p-2 sm:p-3 bg-white mx-2 sm:mx-3 md:mx-4 lg:mx-5">  
        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-xs sm:text-sm">{post.author?.username?.[0]?.toUpperCase()}</span>
        </div>
        <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium">{post.author?.username || 'Unknown Artist'}</span>
      </div>

      {/* Post Image */}
      <div className="relative pb-[75%] bg-white mx-2 sm:mx-3 md:mx-4 lg:mx-5"> 
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="absolute w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Action Buttons */}
      <div className="p-2 sm:p-3 bg-gradient-to-br from-white via-white to-pink-100 mx-2 sm:mx-3 md:mx-4 lg:mx-5">  
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleLike}
            className="focus:outline-none transition-colors duration-200"
          >
            <svg 
              className={`w-7 h-7 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'} hover:text-red-500 transition-colors duration-200`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="focus:outline-none"
          >
            <svg className="w-7 h-7 text-gray-500 hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="focus:outline-none"
          >
            <svg className="w-7 h-7 text-gray-500 hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Like Count - Updated to use local state */}
        <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
          {likeCount} likes
        </div>

        {/* Caption */}
        <div className="mt-1 sm:mt-2">
          <span className="text-xs sm:text-sm font-medium mr-2">{post.author?.username}</span>
          <span className="text-xs sm:text-sm text-gray-600">{post.description}</span>
        </div>

        {/* Comments Section */}
        <div className="mt-1 sm:mt-2">
          {(post._count?.comments ?? 0) > 0 && !showComments && (
            <button
              onClick={() => setShowComments(true)}
              className="text-xs sm:text-sm text-gray-500"
            >
              View all {post._count?.comments} comments
            </button>
          )}
        </div>

        {/* Comments Display and Form */}
        {showComments && (
          <div className="mt-2 sm:mt-4">
            <div className="max-h-40 sm:max-h-60 overflow-y-auto space-y-1 sm:space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="text-xs sm:text-sm flex justify-between items-start group">
                  <div>
                    <span className="font-medium mr-2">{comment.user}</span>
                    <span className="text-gray-600">{comment.text}</span>
                  </div>
                  {comment.userId === JSON.parse(localStorage.getItem('user') || '{}').id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="mt-2 sm:mt-4 flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-xs sm:text-sm border-none focus:ring-0 focus:outline-none"
                disabled={isLoading}
              />
              {newComment.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-2 text-blue-500 font-semibold text-xs sm:text-sm disabled:opacity-50"
                >
                  Post
                </button>
              )}
            </form>
          </div>
        )}

        {/* Timestamp - Update this section */}
        <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
          {formatDate(post.createdAt)}
        </div>
      </div>
    </motion.div>
  );
}
