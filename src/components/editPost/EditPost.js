"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './editPost.module.css';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/utils/supabaseClient';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

const EditPost = ({ post, slug }) => {
  const [title, setTitle] = useState(post?.title || "");
  const [desc, setDesc] = useState(post?.desc || "");
  const [media, setMedia] = useState(post?.img || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const upload = async (file) => {
      try {
        const name = new Date().getTime() + file.name;
        const { data, url } = await uploadFile("blog", name, file);
        console.log("Upload successful!");
        console.log("Download URL:", url);
        setMedia(url);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
   
    if (file) {
      upload(file);
    }
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          desc,
          img: media,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh(); // This refreshes the page with updated data
      } else {
        console.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Redirect to home page or posts list after successful deletion
        router.push("/");
        router.refresh();
      } else {
        console.error("Failed to delete post");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isEditing) {
    return (
      <div className={styles.actionButtons}>
        <button 
          className={styles.editButton} 
          onClick={() => setIsEditing(true)}
        >
          Edit Post
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Post
        </button>

        {showDeleteConfirm && (
          <div className={styles.deleteConfirmOverlay}>
            <div className={styles.deleteConfirmModal}>
              <h3>Are you sure you want to delete this post?</h3>
              <p>This action cannot be undone.</p>
              <div className={styles.deleteConfirmButtons}>
                <button
                  className={styles.cancelDeleteButton}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.editContainer}>
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          {media && (
            <div className={styles.imagePreview}>
              <Image 
                src={media}
                alt="Post image"
                width={200}
                height={120}
                objectFit="cover"
              />
            </div>
          )}
          
          <div className={styles.editor}>
            <button 
              type="button" 
              className={styles.button} 
              onClick={() => setOpen(!open)}
            >
              <Image src="/plus.png" alt="" width={16} height={16}/>
            </button>
            
            {open && (
              <div className={styles.add}>
                <input
                  type="file"
                  id="image"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{display:"none"}}
                />
                <button type="button" className={styles.addButton}>
                  <label htmlFor="image">
                    <Image src="/image.png" alt="" width={16} height={16}/>
                  </label>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="desc">Content</label>
          <ReactQuill
            className={styles.textArea}
            theme="bubble"
            value={desc}
            onChange={setDesc}
            placeholder="Write something fun..."
          />
        </div>
        
        <div className={styles.buttons}>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;