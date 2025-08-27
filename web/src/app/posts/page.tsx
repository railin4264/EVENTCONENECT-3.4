'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { toast } from 'react-hot-toast';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  images?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function AuthRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
        <p className="text-gray-600">Debes iniciar sesión para ver los posts.</p>
      </div>
    </div>
  );
}

function PostsContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await apiService.get('/api/posts');
      setPosts(response.data || []);
    } catch (error) {
      toast.error('Error cargando posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/api/posts', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      toast.success('Post creado exitosamente');
    } catch (error) {
      toast.error('Error creando post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await apiService.post(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: post.likes.includes(user?._id || '') 
              ? post.likes.filter(id => id !== user?._id)
              : [...post.likes, user?._id || '']
            }
          : post
      ));
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Posts de la Comunidad</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Post
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publicar
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {post.author.firstName[0]}{post.author.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={post.images[0]}
                    alt="Post image"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    post.likes.includes(user?._id || '')
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{post.likes.length} likes</span>
                </button>
                
                <div className="text-sm text-gray-500">
                  {post.comments.length} comentarios
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading during SSR or initial mount
  if (!mounted) {
    return <LoadingSpinner />;
  }

  // Show loading while auth is loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show auth required if no user
  if (!user) {
    return <AuthRequired />;
  }

  // Show the actual content
  return <PostsContent />;
}