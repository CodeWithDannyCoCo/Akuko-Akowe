"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LikeBookmarkButtons } from "./";
import {
  MessageCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Edit3,
  Trash2,
} from "lucide-react";
import { api, getFullAvatarUrl } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { OptimizedImage } from "../ui";

export default function BlogPostCard({
  post,
  onPostUpdated,
  onPostDeleted,
  isFullPost = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post?.title || "");
  const [editedContent, setEditedContent] = useState(post?.content || "");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isProfilePage = pathname.startsWith("/profile");
  const isPostAuthor =
    user && post?.author && user.username === post.author.username;

  const editorRef = useRef(null);

  useEffect(() => {
    if (isEditing && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = editedContent;
    }
  }, [isEditing, editedContent]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(post?.title || "");
    setEditedContent(post?.content || "");
  };

  const handleSave = async () => {
    try {
      const updatedPost = await api.updatePost(post.id, {
        title: editedTitle,
        content: editedContent,
      });
      setIsEditing(false);
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      setError(err.message || "Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(post.id);
        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
      } catch (err) {
        setError(err.message || "Failed to delete post");
      }
    }
  };

  const renderAuthorAvatar = () => {
    if (!post?.author) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            ?
          </span>
        </div>
      );
    }

    const avatarUrl = post.author.avatar
      ? getFullAvatarUrl(post.author.avatar)
      : null;

    if (avatarUrl) {
      return (
        <Link href={`/profile/${post.author.username}`} className="block">
          <div className="relative w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
            <Image
              src={avatarUrl}
              alt={`${post.author.username}'s avatar`}
              fill
              className="object-cover"
              sizes="32px"
              quality={90}
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02Mi85OEI2PTZFOT5ZXVlZfG1+fW6Ghn6QjpCOd3p3gHj/2wBDARUXFx4eHR8fHXhwLicucHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHD/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </Link>
      );
    }

    return (
      <Link href={`/profile/${post.author.username}`} className="block">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {post.author.username.charAt(0).toUpperCase()}
          </span>
        </div>
      </Link>
    );
  };

  // Function to truncate content
  const truncateContent = (content) => {
    if (!content) return "";
    if (isFullPost) return content;
    // Create a temporary div to handle HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText;
    const words = text.split(" ");
    if (words.length > 50) {
      return words.slice(0, 50).join(" ") + "...";
    }
    return content;
  };

  // Function to render content with formatting
  const renderFormattedContent = (content) => {
    if (!content) return null;

    if (!isFullPost && content.length > 300) {
      return (
        <div
          className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: truncateContent(content),
          }}
        />
      );
    }
    return (
      <div
        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  if (!post) {
    return null;
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto w-full">
      {post.cover_image && (
        <div className="relative w-full aspect-[2/1]">
          <OptimizedImage
            src={post.cover_image}
            alt={post.title}
            priority={isFullPost}
            quality={90}
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          {renderAuthorAvatar()}
          <div className="ml-3 min-w-0">
            <div className="flex items-center gap-2">
              {post.author ? (
                <Link
                  href={`/profile/${post.author.username}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                >
                  {post.author.username}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Unknown Author
                </span>
              )}
              <time
                dateTime={post.created_at}
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400"
              >
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-0 focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => formatText("bold")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("italic")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("underline")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyLeft")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyCenter")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyRight")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyFull")}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[100px] p-3 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-0 focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
              onInput={(e) => setEditedContent(e.currentTarget.innerHTML)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link href={`/posts/${post.id}`}>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-2">
                {post.title}
              </h2>
            </Link>
            {renderFormattedContent(post.content)}
            {!isFullPost && post.content.length > 300 && (
              <Link
                href={`/posts/${post.id}`}
                className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
              >
                Read more
              </Link>
            )}
          </>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <LikeBookmarkButtons
              postId={post.id}
              initialLikes={post.likes_count}
              initialBookmarks={post.bookmarks_count}
              isLiked={post.is_liked}
              isBookmarked={post.is_bookmarked}
              onUpdate={onPostUpdated}
            />
            <Link
              href={`/posts/${post.id}`}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-1.5" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </Link>
          </div>

          {isPostAuthor && isProfilePage && !isEditing && (
            <div className="relative">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                  title="Edit post"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                  title="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
