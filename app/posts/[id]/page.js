'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import BlogPostCard from '../../../components/BlogPostCard';
import CommentSection from '../../../components/CommentSection';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export default function PostPage({ params }) {
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPost() {
            if (!params?.id) return;

            try {
                setLoading(true);
                const data = await api.getPost(params.id);
                if (data) {
                    setPost(data);
                    setError(null);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err.message || 'Failed to load post');
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [params?.id]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <button onClick={handleBack} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-8">
                <button onClick={handleBack} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <div>Post not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={handleBack} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </button>
            <BlogPostCard post={post} />
            <div className="mt-8">
                <CommentSection postId={params.id} />
            </div>
        </div>
    );
} 