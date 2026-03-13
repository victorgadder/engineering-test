import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPost, deletePost, getPosts, updatePost } from "./api/posts";
import {
  registerCommentCreate,
  registerCommentDelete,
  registerCommentUpdate,
  registerLikeInteraction,
} from "./api/social";
import deleteIcon from "./assets/delete.svg";
import editIcon from "./assets/edit.svg";
import likeWhiteIcon from "./assets/like-white.svg";
import likeBlueIcon from "./assets/like-blue.svg";
import codeleapIcon from "./assets/codeleap-icon.png";
import codeleapNetworkLogo from "./assets/codeleap-network-logo3.png";
import codeleapNetworkLogo2 from "./assets/codeleap-network-logo4.png";
import codeleapShare from "./assets/codeleap-share.png";
import CodeLeapLoadingTransition from "./components/CodeLeapLoadingTransition";

const STORAGE_KEY = "codeleap_username";
const USERS_STORAGE_KEY = "codeleap_users";
const COMMENTS_STORAGE_KEY = "codeleap_comments";
const LIKES_STORAGE_KEY = "codeleap_likes";

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: 0.22, ease: "easeInOut" },
  },
};

const modalTransition = {
  initial: { opacity: 0, scale: 0.94, y: 18 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

const postListTransition = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const postCardTransition = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

function getStoredUsers() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getStoredObj(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function formatRelativeTime(dateString) {
  const timestamp = new Date(dateString).getTime();
  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSeconds < 60) return "just now";

  const steps = [
    { limit: 3600, unit: "minute", seconds: 60 },
    { limit: 86400, unit: "hour", seconds: 3600 },
    { limit: 2592000, unit: "day", seconds: 86400 },
    { limit: 31536000, unit: "month", seconds: 2592000 },
    { limit: Infinity, unit: "year", seconds: 31536000 },
  ];

  const rule = steps.find((item) => diffSeconds < item.limit);
  const value = Math.floor(diffSeconds / rule.seconds);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, rule.unit);
}

function getMentionContext(text, cursor) {
  const safeCursor = Number.isFinite(cursor) ? cursor : text.length;
  const textUntilCursor = text.slice(0, safeCursor);
  const match = textUntilCursor.match(/(^|\s)@([a-zA-Z0-9._-]*)$/);
  if (!match) return null;

  const mentionText = match[2];
  return {
    query: mentionText.toLowerCase(),
    start: safeCursor - mentionText.length - 1,
    end: safeCursor,
  };
}

function insertMention(text, range, user) {
  return text.slice(0, range.start) + `@${user} ` + text.slice(range.end);
}

function Button({ children, className = "", ...props }) {
  return (
    <button className={`button ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

function AnimatedScreen({ screenKey, className, children }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <main key={screenKey} className={className}>
        {children}
      </main>
    );
  }

  return (
    <motion.main
      key={screenKey}
      className={className}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.main>
  );
}

function InputField({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function AnimatedCounter({ value, className = "" }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={`animated-counter ${className}`.trim()}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="animated-counter-value"
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.92 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function MentionTextarea({ label, value, onChange, users, placeholder, rows = 4, className = "" }) {
  const textareaRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [mentionRange, setMentionRange] = useState(null);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredUsers = useMemo(() => {
    if (!mentionRange) return [];
    return users
      .filter((user) => user.toLowerCase().includes(mentionRange.query))
      .slice(0, 6);
  }, [users, mentionRange]);

  function updateMentionState(nextText, cursor) {
    const context = getMentionContext(nextText, cursor);
    setMentionRange(context);
    setIsMentionOpen(Boolean(context));
    setHighlightedIndex(0);
  }

  function applyMention(user) {
    if (!mentionRange) return;
    const nextValue = insertMention(value, mentionRange, user);
    onChange(nextValue);
    setIsMentionOpen(false);
    setMentionRange(null);
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      const nextCursor = mentionRange.start + user.length + 2;
      textareaRef.current.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <div className="mention-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            updateMentionState(nextValue, event.target.selectionStart);
          }}
          onKeyDown={(event) => {
            if (!isMentionOpen || filteredUsers.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((prev) => (prev + 1) % filteredUsers.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((prev) => (prev === 0 ? filteredUsers.length - 1 : prev - 1));
            } else if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();
              applyMention(filteredUsers[highlightedIndex]);
            } else if (event.key === "Escape") {
              setIsMentionOpen(false);
            }
          }}
          onClick={(event) => updateMentionState(event.target.value, event.target.selectionStart)}
          onBlur={() => window.setTimeout(() => setIsMentionOpen(false), 120)}
          placeholder={placeholder}
          rows={rows}
        />
        <AnimatePresence>
          {isMentionOpen && filteredUsers.length > 0 && (
            <motion.ul
              className="mention-list"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {filteredUsers.map((user, index) => (
                <li key={user}>
                  <button
                    type="button"
                    className={index === highlightedIndex ? "active" : ""}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyMention(user)}
                  >
                    @{user}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </label>
  );
}

function Modal({ title, children, onClose }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="overlay"
      role="dialog"
      aria-modal="true"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <motion.div
        className="modal"
        initial={prefersReducedMotion ? false : modalTransition.initial}
        animate={prefersReducedMotion ? {} : modalTransition.animate}
        exit={prefersReducedMotion ? {} : modalTransition.exit}
      >
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        {children}
        <button className="sr-only" onClick={onClose} type="button">
          Close modal
        </button>
      </motion.div>
    </motion.div>
  );
}
function PostCard({
  post,
  currentUsername,
  mentionUsers,
  isOwnPost,
  likedByCurrentUser,
  likesCount,
  comments,
  commentDraft,
  editingComment,
  commentsBusy,
  onEditPost,
  onDeletePost,
  onToggleLike,
  onChangeCommentDraft,
  onCreateComment,
  onStartEditComment,
  onChangeEditComment,
  onSaveEditComment,
  onCancelEditComment,
  onRequestDeleteComment,
}) {
  const prefersReducedMotion = useReducedMotion();
  const commentCount = comments.length;

  return (
    <motion.article
      className="post-card"
      variants={prefersReducedMotion ? undefined : postCardTransition}
    >
      <header className="post-card-header">
        <h2>{post.title}</h2>
        <div className="post-actions">
          <button
            className={`like-button ${likesCount > 0 ? "active" : ""}`.trim()}
            onClick={() => onToggleLike(post)}
            type="button"
          >
            <span className="like-icon-wrap" aria-hidden="true">
              <img className="like-icon like-icon-white" src={likeWhiteIcon} alt="" />
              <img className="like-icon like-icon-blue" src={likeBlueIcon} alt="" />
            </span>
            <AnimatedCounter value={likesCount} className="like-count" />
          </button>
          {isOwnPost && (
            <>
              <button className="icon-button" onClick={() => onDeletePost(post)} type="button" aria-label="Delete post">
                <img src={deleteIcon} alt="" aria-hidden="true" />
              </button>
              <button className="icon-button" onClick={() => onEditPost(post)} type="button" aria-label="Edit post">
                <img src={editIcon} alt="" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </header>
      <div className="post-meta">
        <strong>@{post.username}</strong>
        <span>{formatRelativeTime(post.created_datetime)}</span>
      </div>
      <p className="post-content">{post.content}</p>

      <section className="comments-section">
        <div className="comments-heading">
          <h4>Comments</h4>
          <AnimatedCounter value={commentCount} className="comments-count" />
        </div>
        {comments.length === 0 && <p className="empty-comments">No comments yet.</p>}

        {comments.map((comment) => {
          const isCommentAuthor = comment.username === currentUsername;
          const isPostOwner = post.username === currentUsername;
          const canEditComment = isCommentAuthor && !comment.deletedByOwner;
          const canDeleteComment = isCommentAuthor || isPostOwner;
          const isEditing =
            editingComment &&
            editingComment.postId === post.id &&
            editingComment.commentId === comment.id;

          return (
            <div className="comment-card" key={comment.id}>
              <div className="comment-meta">
                <strong>@{comment.username}</strong>
                <span>{formatRelativeTime(comment.createdAt)}</span>
              </div>

              {comment.deletedByOwner ? (
                <p className="comment-deleted">Message deleted by the owner of the post.</p>
              ) : isEditing ? (
                <>
                  <MentionTextarea
                    value={editingComment.content}
                    onChange={onChangeEditComment}
                    users={mentionUsers}
                    rows={3}
                    className="comment-editor"
                  />
                  <div className="comment-actions">
                    <Button type="button" className="outline" onClick={onCancelEditComment}>Cancel</Button>
                    <Button type="button" className="success" onClick={onSaveEditComment} disabled={!editingComment.content.trim() || commentsBusy}>Save</Button>
                  </div>
                </>
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}

              {!comment.deletedByOwner && !isEditing && (canEditComment || canDeleteComment) && (
                <div className="comment-actions">
                  {canEditComment && (
                    <Button type="button" className="outline" onClick={() => onStartEditComment(post.id, comment)}>Edit</Button>
                  )}
                  {canDeleteComment && (
                    <Button type="button" className="danger" onClick={() => onRequestDeleteComment(post, comment, isCommentAuthor)}>Delete</Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="comment-form">
          <MentionTextarea
            label="Add a comment"
            value={commentDraft}
            onChange={(nextValue) => onChangeCommentDraft(post.id, nextValue)}
            users={mentionUsers}
            rows={2}
            placeholder="Write a comment and use @ to mention users"
          />
          <div className="align-right">
            <Button
              type="button"
              className={`primary ${commentDraft.trim() && !commentsBusy ? "cta-ready" : ""}`.trim()}
              disabled={!commentDraft.trim() || commentsBusy}
              onClick={() => onCreateComment(post.id, commentDraft)}
            >
              Comment
            </Button>
          </div>
        </div>
      </section>
    </motion.article>
  );
}

function LoginScreen({ onLogin, lastUsername, existingUsers }) {
  const [username, setUsername] = useState("");
  const [selectedExistingUser, setSelectedExistingUser] = useState(() => existingUsers[0] ?? "");
  const normalizedUsername = username.trim().toLowerCase();
  const userAlreadyExists =
    normalizedUsername.length > 0 &&
    existingUsers.some((user) => user.toLowerCase() === normalizedUsername);
  const canEnter = username.trim().length > 0 && !userAlreadyExists;
  const canLoginExisting = selectedExistingUser.trim().length > 0;

  useEffect(() => {
    if (selectedExistingUser && existingUsers.includes(selectedExistingUser)) return;
    setSelectedExistingUser(existingUsers[0] ?? "");
  }, [existingUsers, selectedExistingUser]);

  return (
    <AnimatedScreen screenKey="login" className="login-screen">
      <section className="login-modal">
        <img
          className="login-logo"
          src={codeleapNetworkLogo2}
          alt="CodeLeap Network"
        />
        <p className="last-user-label">Continue from the last user:</p>
        {lastUsername ? (
          <button type="button" className="last-user-button" onClick={() => onLogin(lastUsername)}>
            {lastUsername}
          </button>
        ) : (
          <p className="last-user-empty">No previous user found.</p>
        )}

        <div className="existing-user-block">
          <p className="last-user-label">Or choose an existing user:</p>
          <div className="existing-user-row">
            <select className="existing-user-select" value={selectedExistingUser} onChange={(event) => setSelectedExistingUser(event.target.value)}>
              {existingUsers.length === 0 && <option value="">No existing users yet</option>}
              {existingUsers.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            <Button type="button" className="primary" disabled={!canLoginExisting} onClick={() => onLogin(selectedExistingUser)}>
              ENTER
            </Button>
          </div>
        </div>

        <form onSubmit={(event) => {
          event.preventDefault();
          if (!canEnter) return;
          onLogin(username.trim());
        }}>
          <InputField
            label="Please enter your username"
            placeholder="John doe"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {userAlreadyExists && (
            <p className="field-error">This user already exists. Please choose a different username.</p>
          )}
          <div className="align-right">
            <Button type="submit" className="primary" disabled={!canEnter}>ENTER</Button>
          </div>
        </form>
      </section>
    </AnimatedScreen>
  );
}
function FeedScreen({ username, onLogout, knownUsers }) {
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [likesByPost, setLikesByPost] = useState(() => getStoredObj(LIKES_STORAGE_KEY));
  const [commentsByPost, setCommentsByPost] = useState(() => getStoredObj(COMMENTS_STORAGE_KEY));
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likesByPost));
  }, [likesByPost]);

  useEffect(() => {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(commentsByPost));
  }, [commentsByPost]);

  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: getPosts, refetchInterval: 12000 });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setTitle("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      setEditingPost(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      setDeletingPost(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const likeMutation = useMutation({ mutationFn: registerLikeInteraction });
  const commentCreateMutation = useMutation({ mutationFn: registerCommentCreate });
  const commentUpdateMutation = useMutation({ mutationFn: registerCommentUpdate });
  const commentDeleteMutation = useMutation({ mutationFn: registerCommentDelete });

  const commentsBusy = commentCreateMutation.isPending || commentUpdateMutation.isPending || commentDeleteMutation.isPending;

  const mentionUsers = useMemo(() => {
    const users = new Set([username, ...knownUsers]);
    (postsQuery.data ?? []).forEach((post) => users.add(post.username));
    Object.values(commentsByPost).forEach((list) => list.forEach((comment) => users.add(comment.username)));
    return Array.from(users).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [username, knownUsers, postsQuery.data, commentsByPost]);

  const filteredPosts = useMemo(() => {
    if (!postsQuery.data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return postsQuery.data;
    return postsQuery.data.filter((post) =>
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.username.toLowerCase().includes(term)
    );
  }, [postsQuery.data, search]);

  function toggleLike(post) {
    if (likeMutation.isPending) return;
    const key = String(post.id);
    const likedUsers = likesByPost[key] ?? [];
    const isLiked = likedUsers.includes(username);

    likeMutation.mutate(
      { postId: post.id, username, action: isLiked ? "unlike" : "like" },
      {
        onSuccess: () => {
          setLikesByPost((prev) => {
            const current = prev[key] ?? [];
            return {
              ...prev,
              [key]: isLiked ? current.filter((user) => user !== username) : [...current, username],
            };
          });
        },
      },
    );
  }

  function createComment(postId, text) {
    const trimmed = text.trim();
    if (!trimmed || commentCreateMutation.isPending) return;

    commentCreateMutation.mutate(
      { postId, username, content: trimmed },
      {
        onSuccess: (response) => {
          setCommentsByPost((prev) => {
            const key = String(postId);
            const list = prev[key] ?? [];
            const id = response?.id ?? `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const newComment = {
              id,
              username,
              content: trimmed,
              createdAt: new Date().toISOString(),
              deletedByOwner: false,
            };
            return { ...prev, [key]: [...list, newComment] };
          });

          setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        },
      },
    );
  }

  function saveEditedComment() {
    if (!editingComment || commentUpdateMutation.isPending) return;
    const trimmed = editingComment.content.trim();
    if (!trimmed) return;
    const snapshot = { ...editingComment };

    commentUpdateMutation.mutate(
      { id: snapshot.commentId, content: trimmed },
      {
        onSettled: () => {
          setCommentsByPost((prev) => {
            const key = String(snapshot.postId);
            const list = prev[key] ?? [];
            return {
              ...prev,
              [key]: list.map((comment) =>
                comment.id === snapshot.commentId ? { ...comment, content: trimmed } : comment,
              ),
            };
          });
          setEditingComment(null);
        },
      },
    );
  }

  function confirmDeleteComment() {
    if (!deletingComment || commentDeleteMutation.isPending) return;

    commentDeleteMutation.mutate(deletingComment.commentId, {
      onSuccess: () => {
        setCommentsByPost((prev) => {
          const key = String(deletingComment.postId);
          const list = prev[key] ?? [];

          if (deletingComment.deleteType === "owner-soft-delete") {
            return {
              ...prev,
              [key]: list.map((comment) =>
                comment.id === deletingComment.commentId
                  ? { ...comment, content: "", deletedByOwner: true }
                  : comment,
              ),
            };
          }

          return {
            ...prev,
            [key]: list.filter((comment) => comment.id !== deletingComment.commentId),
          };
        });
        if (editingComment?.commentId === deletingComment.commentId) setEditingComment(null);
        setDeletingComment(null);
      },
    });
  }

  return (
    <AnimatedScreen screenKey="feed" className="feed-screen">
      <div className="feed-container">
        <header className="topbar">
          <img
            className="topbar-logo"
            src={codeleapNetworkLogo}
            alt="CodeLeap Network"
          />
          <div className="topbar-actions">
            <div className="user-badge">
              <span className="user-badge-label">Signed in as</span>
              <strong className="user-badge-name">{username}</strong>
            </div>
            <button className="logout-link" type="button" onClick={() => setIsSignOutModalOpen(true)}>sign out</button>
          </div>
        </header>

        <section className="search-area">
          <InputField label="Search posts" placeholder="Filter by title, content or username" value={search} onChange={(event) => setSearch(event.target.value)} />
        </section>

        <section className="composer">
          <h2>What's on your mind?</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim() || !content.trim() || createMutation.isPending) return;
              createMutation.mutate({ username, title: title.trim(), content: content.trim() });
            }}
          >
            <InputField label="Title" placeholder="Hello world" value={title} onChange={(event) => setTitle(event.target.value)} />
            <MentionTextarea label="Content" placeholder="Content here (type @ to mention users)" value={content} onChange={setContent} users={mentionUsers} rows={4} />
            <div className="align-right">
              <Button
                type="submit"
                className={`primary ${title.trim() && content.trim() && !createMutation.isPending ? "cta-ready" : ""}`.trim()}
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </section>

        {postsQuery.isLoading && <p className="status">Loading posts...</p>}
        {postsQuery.isError && <p className="status error">Could not load posts. Please refresh and try again.</p>}

        <motion.section
          className="post-list"
          variants={prefersReducedMotion ? undefined : postListTransition}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
        >
          {filteredPosts.map((post) => {
            const postLikes = likesByPost[String(post.id)] ?? [];
            const postComments = commentsByPost[String(post.id)] ?? [];
            return (
              <PostCard
                key={post.id}
                post={post}
                currentUsername={username}
                mentionUsers={mentionUsers}
                isOwnPost={post.username === username}
                likedByCurrentUser={postLikes.includes(username)}
                likesCount={postLikes.length}
                comments={postComments}
                commentDraft={commentDrafts[post.id] ?? ""}
                editingComment={editingComment}
                commentsBusy={commentsBusy}
                onEditPost={(selectedPost) => setEditingPost({ ...selectedPost })}
                onDeletePost={setDeletingPost}
                onToggleLike={toggleLike}
                onChangeCommentDraft={(postId, nextValue) => setCommentDrafts((prev) => ({ ...prev, [postId]: nextValue }))}
                onCreateComment={createComment}
                onStartEditComment={(postId, comment) => setEditingComment({ postId, commentId: comment.id, content: comment.content })}
                onChangeEditComment={(nextValue) => setEditingComment((prev) => (prev ? { ...prev, content: nextValue } : prev))}
                onSaveEditComment={saveEditedComment}
                onCancelEditComment={() => setEditingComment(null)}
                onRequestDeleteComment={(targetPost, comment, isAuthor) =>
                  setDeletingComment({
                    postId: targetPost.id,
                    commentId: comment.id,
                    deleteType: isAuthor ? "author-delete" : "owner-soft-delete",
                  })
                }
              />
            );
          })}
          {!postsQuery.isLoading && filteredPosts.length === 0 && <p className="status">No posts found for this search.</p>}
        </motion.section>
      </div>
      <AnimatePresence>
      {deletingPost && (
        <Modal title="Are you sure you want to delete this item?" onClose={() => setDeletingPost(null)}>
          <div className="modal-actions">
            <Button type="button" className="outline" onClick={() => setDeletingPost(null)}>Cancel</Button>
            <Button type="button" className="danger" onClick={() => deleteMutation.mutate(deletingPost.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}

      {deletingComment && (
        <Modal title="Are you sure you want to delete this comment?" onClose={() => setDeletingComment(null)}>
          <div className="modal-actions">
            <Button type="button" className="outline" onClick={() => setDeletingComment(null)}>Cancel</Button>
            <Button type="button" className="danger" onClick={confirmDeleteComment} disabled={commentDeleteMutation.isPending}>
              {commentDeleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}

      {isSignOutModalOpen && (
        <Modal title="Are you sure you want to sign out?" onClose={() => setIsSignOutModalOpen(false)}>
          <div className="modal-actions">
            <Button type="button" className="outline" onClick={() => setIsSignOutModalOpen(false)}>Cancel</Button>
            <Button type="button" className="danger" onClick={onLogout}>Sign out</Button>
          </div>
        </Modal>
      )}

      {editingPost && (
        <Modal title="Edit item" onClose={() => setEditingPost(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!editingPost.title.trim() || !editingPost.content.trim() || updateMutation.isPending) return;
              updateMutation.mutate({ id: editingPost.id, title: editingPost.title.trim(), content: editingPost.content.trim() });
            }}
          >
            <InputField
              label="Title"
              placeholder="Hello world"
              value={editingPost.title}
              onChange={(event) => setEditingPost((prev) => ({ ...prev, title: event.target.value }))}
            />
            <MentionTextarea
              label="Content"
              placeholder="Content here (type @ to mention users)"
              rows={4}
              value={editingPost.content}
              users={mentionUsers}
              onChange={(nextValue) => setEditingPost((prev) => ({ ...prev, content: nextValue }))}
            />
            <div className="modal-actions">
              <Button type="button" className="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
              <Button type="submit" className="success" disabled={!editingPost.title.trim() || !editingPost.content.trim() || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </AnimatePresence>
    </AnimatedScreen>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [pendingUsername, setPendingUsername] = useState("");
  const [isLoginTransitionActive, setIsLoginTransitionActive] = useState(false);
  const [lastUsername, setLastUsername] = useState(() => window.localStorage.getItem(STORAGE_KEY) ?? "");
  const [knownUsers, setKnownUsers] = useState(getStoredUsers);

  function applyLogin(nextUsername) {
    window.localStorage.setItem(STORAGE_KEY, nextUsername);
    setLastUsername(nextUsername);
    setKnownUsers((previousUsers) => {
      const alreadyExists = previousUsers.some((user) => user.toLowerCase() === nextUsername.toLowerCase());
      if (alreadyExists) return previousUsers;
      const nextUsers = [...previousUsers, nextUsername];
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      return nextUsers;
    });
    setUsername(nextUsername);
  }

  function handleLogin(nextUsername) {
    setPendingUsername(nextUsername);
    setIsLoginTransitionActive(true);
  }

  function handleLoginTransitionComplete() {
    if (!pendingUsername) return;
    applyLogin(pendingUsername);
    setPendingUsername("");
    setIsLoginTransitionActive(false);
  }

  function handleLogout() {
    setUsername("");
  }

  if (!username) {
    return (
      <AnimatePresence mode="wait">
        {isLoginTransitionActive ? (
          <AnimatedScreen screenKey="login-transition" className="login-transition-screen">
            <CodeLeapLoadingTransition
              iconSrc={codeleapIcon}
              fullLogoSrc={codeleapShare}
              durationMs={3000}
              height={180}
              onComplete={handleLoginTransitionComplete}
            />
          </AnimatedScreen>
        ) : (
          <LoginScreen
            onLogin={handleLogin}
            lastUsername={lastUsername}
            existingUsers={knownUsers}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <FeedScreen username={username} onLogout={handleLogout} knownUsers={knownUsers} />
    </AnimatePresence>
  );
}
