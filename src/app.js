// src/app.js

import { signIn, getUser } from './auth';
import { getUserFragments } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    console.log('User not authenticated');
    return;
  }

  console.log('User authenticated:', user);

  try {
    const fragments = await getUserFragments(user);
    console.log('User fragments:', fragments);
    // Update UI with fragments data
  } catch (error) {
    console.error('Error fetching user fragments:', error);
    // Handle error in UI
  }

  // Update the UI to welcome the user
  userSection.hidden = false;
  userSection.classList.add('visible');

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
