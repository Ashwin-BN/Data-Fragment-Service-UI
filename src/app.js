// src/app.js

import { signIn, signOut, getUser } from './auth';
import { getUserFragments } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  logoutBtn.onclick = async () => {
    try {
      await signOut();
      userSection.hidden = true;  // Hide user section
      loginBtn.disabled = false;  // Enable login button
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    return;
  }

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  try {
    const userFragments = await getUserFragments(user);
    console.log('User fragments:', userFragments);
  } catch (error) {
    console.error('Error fetching user fragments:', error);
  }

  // TODO: later in the course, we will show all the user's fragments in the HTML...
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
