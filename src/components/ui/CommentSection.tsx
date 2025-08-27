'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { MessageCircle, Send, Reply, Trash2, Edit2 } from 'lucide-react';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: string;
  authorImage?: string;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  postId: string;
  className?: string;
}

export function CommentSection({ postId, className = '' }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Fetched comments:', data);
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [postId, fetchComments]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
          postId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent,
          postId,
          parentId,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setEditingComment(null);
        setEditContent('');
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    console.log('🔍 Deleting comment:', { commentId, postId, type: typeof commentId });
    
    if (!commentId || commentId === 'undefined') {
      console.error('❌ Invalid comment ID:', commentId);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Comment deleted successfully');
        fetchComments(); // Refresh comments
      } else {
        console.error('❌ Failed to delete comment:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render comment
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {comment.authorImage ? (
                <img src={comment.authorImage} alt={comment.author} className="w-8 h-8 rounded-full" />
              ) : (
                comment.author.charAt(0).toUpperCase()
              )}
            </div>

            {/* Comment Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {editingComment === comment.id ? (
                <div className="mb-3">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit your comment..."
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                      disabled={loading}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {comment.content}
                </p>
              )}

              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-sm">
                {session?.user?.id && (
                  <>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>

                    {session.user.id === comment.authorId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="flex items-center gap-1 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log('🔍 Delete button clicked for comment:', comment);
                            if (!comment.id || comment.id === '') {
                              console.error('❌ Cannot delete comment with invalid ID:', comment);
                              return;
                            }
                            handleDeleteComment(comment.id);
                          }}
                          className="flex items-center gap-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={loading}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              {renderComment(reply, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Comment Form */}
          {session?.user?.id ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Please <button className="text-blue-600 hover:underline">sign in</button> to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
