# CodeLeap Network Frontend

Brazilian Portuguese version: [README.pt-BR.md](https://github.com/victorgadder/engineering-test/blob/main/README.pt-BR.md)

React frontend for a CRUD-focused social feed integrated with CodeLeap's test backend at `https://dev.codeleap.co.uk/careers/`.

The project was built with two priorities in mind:

- a polished end-user experience, with responsive layouts, subtle motion and clear interaction flows;
- straightforward implementation, using hooks, reusable UI patterns and a pragmatic data layer.

## Overview

This application includes:

- frontend-only username authentication;
- post creation, listing, editing and deletion;
- posts sorted by newest first;
- search by title, content or username;
- confirmation and editing modals;
- branded login transition animation;
- likes and comments with local persistence;
- user mentions with `@` autocomplete;
- refined hover, focus and transition states.

## Tech Stack

- `React 19`
- `Vite`
- `@tanstack/react-query`
- `framer-motion`
- plain CSS in [`src/style.css`](C:/Users/opah/Documents/Projetos/engineering-test/src/style.css)

## Backends and Integrations

### Main posts API

Posts are integrated with:

- `https://dev.codeleap.co.uk/careers/`

Implemented operations:

- `GET /careers/`
- `POST /careers/`
- `PATCH /careers/{id}/`
- `DELETE /careers/{id}/`

Important notes:

- trailing slashes are intentionally preserved because the Django backend can behave inconsistently without them;
- this remote API may be reset or cleared periodically, so its data should not be treated as durable long-term persistence.

### Simulated social interactions

Likes and comments also trigger requests to:

- `https://jsonplaceholder.typicode.com`

These requests are used to simulate valid external API traffic for features that are not part of CodeLeap's original contract. Functional persistence for those features happens locally in the browser.

## Features

### 1. Login

The login screen supports three paths:

- continue as the last logged-in user;
- select an existing known user from a dropdown;
- create a new unique username.

Implemented rules:

- the `ENTER` button is disabled while the input is empty;
- duplicate usernames cannot be created through the new-user field;
- duplicate names show a validation message;
- login triggers a 3-second branded transition before entering the feed.

Frontend persistence:

- last user: `localStorage`
- known users: `localStorage`

### 2. Main feed

The main feed includes:

- a header with logo, current signed-in user and `Sign out` action;
- a search box;
- a post composer;
- a post list loaded from the API;
- edit and delete controls only for posts owned by the logged-in user.

Important behaviors:

- posts are sorted by `created_datetime` descending;
- listing uses React Query;
- there is periodic refetching;
- the cache is invalidated after create, update and delete operations.

### 3. Likes

Each post has a like button in the card header.

Behavior:

- the visual state switches between white and blue icons;
- the counter is animated;
- likes have a small `pop` effect;
- likes are persisted locally per post;
- each action also triggers a request to `jsonplaceholder` to simulate network integration.

### 4. Comments

Each post includes a comments section with:

- comment listing;
- new comment form;
- comment editing;
- comment deletion.

Permission rules:

- the comment author can edit and delete their own comment;
- the post owner can also delete comments made by other users on that post;
- when the post owner removes someone else's comment, the comment is replaced with:
  `Message deleted by the owner of the post.`

Persistence:

- comments are stored in `localStorage`;
- create, update and delete also trigger requests to an external valid API.

### 5. Mentions with `@`

The app implements user autocomplete when `@` is typed in:

- post creation;
- post editing;
- comment creation;
- comment editing.

Behavior:

- suggestions are based on known users in the app;
- both mouse and keyboard are supported;
- `ArrowUp`, `ArrowDown`, `Enter`, `Tab` and `Escape` are handled.

### 6. Motion and visual refinement

The project includes:

- animated transitions between login, loading and feed;
- staggered post entrance with `fade + slide-up`;
- `scale/fade` modals;
- refined hover states for cards, buttons and icons;
- more elegant input focus states;
- enabled-state feedback for `Create` and `Comment`;
- layered background gradient with subtle texture;
- a soft highlight in the top header.

## Project Structure

```text
src/
  api/
    posts.js
    social.js
  assets/
    codeleap-icon.png
    codeleap-network-logo*.png
    codeleap-share.png
    delete.svg
    edit.svg
    like-blue.svg
    like-white.svg
  components/
    CodeLeapLoadingTransition.jsx
  App.jsx
  main.jsx
  style.css
```

## Main Files

### [`src/main.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/main.jsx)

Initializes React and sets up the `QueryClientProvider`.

### [`src/App.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/App.jsx)

Contains:

- login flow;
- feed flow;
- modal handling;
- local helper components;
- like, comment and mention rules;
- screen transitions powered by `framer-motion`.

### [`src/api/posts.js`](C:/Users/opah/Documents/Projetos/engineering-test/src/api/posts.js)

Integration layer for CodeLeap's official CRUD API.

### [`src/api/social.js`](C:/Users/opah/Documents/Projetos/engineering-test/src/api/social.js)

Integration layer for simulated likes and comments using `jsonplaceholder`.

### [`src/components/CodeLeapLoadingTransition.jsx`](C:/Users/opah/Documents/Projetos/engineering-test/src/components/CodeLeapLoadingTransition.jsx)

Branded login transition animation built with `framer-motion`.

### [`src/style.css`](C:/Users/opah/Documents/Projetos/engineering-test/src/style.css)

Defines the entire visual language of the project:

- layout;
- responsiveness;
- states;
- motion;
- typography;
- visual atmosphere.

## Running Locally

### Requirements

- `Node.js` 18+ recommended
- `npm`

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Local Persistence

Some UI state is intentionally stored in the browser:

- `codeleap_username`
- `codeleap_users`
- `codeleap_comments`
- `codeleap_likes`

This allows the app to:

- remember the last user;
- suggest known users;
- keep likes and comments even when the official API does not support them.

## Technical Decisions

### Why React Query?

React Query is used to:

- fetch posts from the main API;
- invalidate cache after mutations;
- reduce manual loading and refetch logic;
- make async state more predictable.

### Why hooks instead of classes?

The project follows the requested direction:

- functional components;
- hook-based state management;
- simpler composition;
- lower maintenance complexity.

### Why `localStorage` for part of the product?

Because:

- username login does not depend on a real users backend;
- likes and comments are not part of the official test API;
- the remote posts API can be reset over time.

## Responsiveness

The layout was designed for desktop and mobile:

- fluid widths with `min(..., 100%)`;
- breakpoint-based adjustments;
- adaptive header behavior on small screens;
- login dropdown and actions reorganized for mobile;
- modal and card layout kept usable on smaller widths.

## Accessibility and UX

Applied considerations:

- disabled buttons when an action is invalid;
- visual hover and focus feedback;
- clear labels on form fields;
- proper modal dialog structure;
- readable hierarchy and fast-scanning content flow.

## Known Limitations

- the CodeLeap API may return an empty list at certain times, even after previous use;
- likes and comments are not persisted in a dedicated backend, only locally;
- authentication is purely frontend-based, with no real session management;
- a large portion of the app currently lives inside `App.jsx`, which is acceptable for the current scope but could be modularized further as the project grows.

## Possible Future Improvements

- split feed-related UI into smaller files;
- move configuration into environment variables;
- add UI and integration tests;
- implement a dedicated backend for likes, comments and users;
- optimize larger brand assets to reduce bundle weight.

## Author

Project developed by Victor Gadder in the context of a frontend engineering challenge, with emphasis on usability, visual clarity and practical execution.
