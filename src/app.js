// app.js
import { signIn, signOut, getUser } from './auth';
import { getUserFragments, postUserFragment } from './api';

async function init() {
  // Get our UI elements
  const loginBtn = document.querySelector('#login');
  const fragmentTypeSelect = document.querySelector('#fragmentType');
  const fragmentContent = document.querySelector('#fragmentContent');
  const createFragmentBtn = document.querySelector('#createFragment');
  const fragmentsList = document.querySelector('#fragmentsList');

  // Check if user is already logged in
  const user = await getUser();

  // Initialize UI based on login state
  if (user) {
    updateUIForLoggedInState(user);
  } else {
    updateUIForLoggedOutState();
  }

  // Combined login/logout handler
  loginBtn.onclick = async () => {
    if (await getUser()) {
      await handleLogout();
    } else {
      await handleLogin();
    }
  };

  // Set up fragment creation handler
  createFragmentBtn.onclick = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      alert('Please login first to create fragments');
      return;
    }

    try {
      const fragmentType = fragmentTypeSelect.value;
      const fragmentContentValue = fragmentContent.value.trim();

      if (!fragmentContentValue) {
        alert('Please enter some fragment content');
        return;
      }

      const fragmentData = {
        type: fragmentType,
        data: fragmentContentValue,
      };

      const newFragment = await postUserFragment(currentUser, fragmentData);
      fragmentContent.value = '';
      await refreshFragmentsList(currentUser, fragmentsList);
      console.log('Fragment created successfully:', newFragment);
    } catch (error) {
      console.error('Error creating fragment:', error);
    }
  };
}

function updateUIForLoggedInState(user) {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  loginBtn.textContent = 'Logout';
  loginBtn.classList.remove('btn-primary');
  loginBtn.classList.add('btn-danger');

  userSection.hidden = false;
  userSection.classList.add('visible');
  userSection.querySelector('.username').textContent = user.username;

  refreshFragmentsList(user, document.querySelector('#fragmentsList'));
}

function updateUIForLoggedOutState() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  loginBtn.textContent = 'Login';
  loginBtn.classList.remove('btn-danger');
  loginBtn.classList.add('btn-primary');

  userSection.hidden = true;
  userSection.classList.remove('visible');
}

async function handleLogin() {
  await signIn();
  const user = await getUser();
  if (user) {
    updateUIForLoggedInState(user);
  }
}

async function handleLogout() {
  await signOut();
  updateUIForLoggedOutState();
}

async function refreshFragmentsList(user, container) {
  try {
    const response = await getUserFragments(user);
    const fragments = response.fragments || [];
    container.innerHTML = '';

    console.log('Fragment ID: ', fragments); //checker

    if (fragments.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No fragments found</div>';
      return;
    }

    fragments.forEach((fragmentId) => {
      const fragmentElement = document.createElement('div');
      fragmentElement.className = 'card mb-3';

      fragmentElement.innerHTML = `
          <div class="card-body">
              <h5 class="card-title">${fragmentId}</h5>
              <small class="text-muted">Fragment ID</small>
          </div>
      `;
      container.appendChild(fragmentElement);
    });
  } catch (error) {
    console.error('Error refreshing fragments list:', error);
    container.innerHTML = '<div class="alert alert-danger">Failed to load fragments</div>';
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
