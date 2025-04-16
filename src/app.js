// app.js
import { signIn, signOut, getUser } from './auth';
import {
  getUserFragments,
  postUserFragment,
  getUserFragmentById,
  getUserFragmentMetadataById,
  deleteUserFragmentById,
  updateUserFragmentById,
  getFragmentInType,
} from './api';

import * as bootstrap from 'bootstrap';

async function init() {
  // Get our UI elements
  const loginBtn = document.querySelector('#login');
  const fragmentTypeSelect = document.querySelector('#fragmentType');
  const createFragmentBtn = document.querySelector('#createFragment');
  const fragmentsList = document.querySelector('#fragmentsList');
  const fragmentTextContent = document.querySelector('#fragmentTextContent');
  const fragmentImageContent = document.querySelector('#fragmentImageContent');

  const imageInput = document.querySelector('#imageInput');
  const textInput = document.querySelector('#textInput');

  fragmentTypeSelect.addEventListener('change', () => {
    const selectedContentType = fragmentTypeSelect.value;

    if (selectedContentType.startsWith('text/') || selectedContentType.startsWith('application/')) {
      imageInput.hidden = true;
      textInput.hidden = false;
    } else if (selectedContentType.startsWith('image/')) {
      textInput.hidden = true;
      imageInput.hidden = false;
    } else {
      // fallback (hide both if unknown type)
      textInput.hidden = true;
      imageInput.hidden = true;
    }
  });

  // Trigger the initial toggle once in case there's a default value
  fragmentTypeSelect.dispatchEvent(new Event('change'));

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

      if (fragmentType.startsWith('image/')) {
        const file = fragmentImageContent.files[0];
        if (!file) {
          alert('Please select an image file');
          return;
        }

        const formData = new FormData();
        formData.append('fragment', file);

        const fragmentData = {
          type: fragmentType,
          data: file,
        };

        const newFragment = await postUserFragment(currentUser, fragmentData);
        fragmentImageContent.value = '';
        await refreshFragmentsList(currentUser, fragmentsList);
        console.log('Fragment created successfully:', newFragment);
      } else {
        const content = fragmentTextContent.value.trim();
        if (!content) {
          alert('Please enter some content');
          return;
        }

        let dataToSend = content;

        if (fragmentType === 'application/json') {
          try {
            JSON.parse(content); // validate
            dataToSend = content; // valid JSON string as-is
          } catch (err) {
            alert('Invalid JSON format');
            throw err;
          }
        }

        const fragmentData = {
          type: fragmentType,
          data: dataToSend,
        };

        const newFragment = await postUserFragment(currentUser, fragmentData);
        fragmentTextContent.value = '';
        await refreshFragmentsList(currentUser, fragmentsList);
        console.log('Fragment created successfully:', newFragment);
      }
    } catch (error) {
      console.error('Error creating fragment:', error);
      alert('Error creating fragment');
    }
  };
}

// Helper function to get convertible types
function getConvertibleTypes(currentType) {
  const conversionRules = {
    'text/markdown': ['text/html', 'text/plain'],
    'text/html': ['text/plain'],
    'text/csv': ['text/plain', 'application/json'],
    'application/json': ['application/yaml', 'text/plain'],
    'application/yaml': ['text/plain'],
    'image/png': ['image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
    'image/jpeg': ['image/png', 'image/webp', 'image/gif', 'image/avif'],
    'image/webp': ['image/png', 'image/jpeg', 'image/gif', 'image/avif'],
    'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  };

  return conversionRules[currentType] || [];
}

function getExtensionForType(contentType) {
  const extensionMap = {
    'text/plain': '.txt',
    'text/markdown': '.md',
    'text/html': '.html',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/yaml': '.yaml',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'image/gif': '.gif',
  };

  return extensionMap[contentType] || '';
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

// Helper function to get type-specific class
function getTypeSpecificClass(contentType) {
  switch (true) {
    case contentType.startsWith('image/'):
      return `image-fragment`;
    case contentType === 'application/json':
      return 'json-fragment';
    case contentType === 'text/markdown':
      return 'markdown-fragment';
    case contentType === 'text/html':
      return 'html-fragment';
    case contentType === 'text/csv':
      return 'csv-fragment';
    case contentType === 'application/yaml':
      return 'yaml-fragment';
    default:
      return 'text-fragment';
  }
}

// Update your refreshFragmentsList function to include click handlers
async function refreshFragmentsList(user, container) {
  try {
    const response = await getUserFragments(user);
    const fragments = response.fragments || [];
    container.innerHTML = '';

    if (fragments.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No fragments found</div>';
      return;
    }

    // Sort fragments by creation date (newest first)
    const sortedFragments = [...fragments].sort((a, b) => {
      return new Date(b.created) - new Date(a.created);
    });

    sortedFragments.forEach((fragment) => {
      const fragmentElement = document.createElement('div');

      fragmentElement.className = 'card mb-3 cursor-pointer';

      // Add type-specific class based on content type
      const typeClass = getTypeSpecificClass(fragment.type);
      fragmentElement.classList.add(typeClass);

      fragmentElement.style.cursor = 'pointer';

      fragmentElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title"><strong>ID:</strong> ${fragment.id}</h5>
          <small class="text-muted">
            <strong>Type:</strong> ${fragment.type}<br>
            <strong>Created:</strong> ${new Date(fragment.created).toLocaleString()}<br>
          </small>
        </div>
      `;

      fragmentElement.addEventListener('click', async () => {
        // Get both the fragment data and metadata
        const fullFragment = await getUserFragmentById(user, fragment.id);
        const metadata = await getUserFragmentMetadataById(user, fragment.id);

        // Combine the metadata with the content
        const fragmentData = {
          ...metadata.fragment,
          content: fullFragment,
        };

        showFragmentModal(fragment.type, fragmentData);
      });

      container.appendChild(fragmentElement);
    });
  } catch (error) {
    console.error('Error refreshing fragments list:', error);
    container.innerHTML = '<div class="alert alert-danger">Failed to load fragments</div>';
  }
}

// Extracted update function
async function handleUpdateFragment(content) {
  const fragmentId = content.id;
  const user = await getUser();
  if (!user) {
    alert('Please login first to update fragments');
    return false;
  }

  // Get new content based on fragment type
  let newContent;
  if (content.type.startsWith('image/')) {
    const newFile = await new Promise((resolve) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = content.type;
      fileInput.onchange = (e) => resolve(e.target.files[0]);
      fileInput.click();
    });
    if (!newFile) {
      alert('No file selected');
      return false;
    }
    newContent = newFile;
  } else {
    const newText = prompt(
      'Enter new content:',
      typeof content.content === 'string'
        ? content.content
        : new TextDecoder().decode(content.content)
    );
    if (!newText) {
      alert('No content entered');
      return false;
    }
    newContent = newText;
  }

  try {
    const updatedData = {
      type: content.type,
      data: newContent,
    };
    await updateUserFragmentById(user, fragmentId, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating fragment:', error);
    alert('Failed to update fragment. Please try again.');
    return false;
  }
}

// Extracted delete function
async function handleDeleteFragment(content) {
  const fragmentId = content.id;
  const user = await getUser();
  if (!user) {
    alert('Please login first to delete fragments');
    return false;
  }

  const confirmed = confirm(
    `Are you sure you want to delete fragment ${fragmentId}? This action cannot be undone.`
  );
  if (!confirmed) return false;

  try {
    await deleteUserFragmentById(user, fragmentId);
    return true;
  } catch (error) {
    console.error('Error deleting fragment:', error);
    alert('Failed to delete fragment. Please try again.');
    return false;
  }
}

async function handleFragmentConversion(content, targetType) {
  if (targetType === content.type) {
    alert('Please select a different content type for conversion');
    return false;
  }

  try {
    const extension = getExtensionForType(targetType);
    const convertedContent = await getFragmentInType(await getUser(), content.id, extension);

    // Update the converted content column
    const convertedContentPlaceholder = document.getElementById('convertedContentPlaceholder');
    convertedContentPlaceholder.innerHTML = '';

    if (targetType.startsWith('image/')) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-container';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(convertedContent);
      img.classList.add('img-fluid', 'max-width-100');
      imgContainer.appendChild(img);
      convertedContentPlaceholder.appendChild(imgContainer);
    } else {
      const contentPre = document.createElement('pre');
      contentPre.className = 'content-pre mt-3';
      if (convertedContent instanceof ArrayBuffer) {
        const textDecoder = new TextDecoder();
        const textContent = textDecoder.decode(convertedContent);
        contentPre.textContent = textContent;
      } else if (typeof convertedContent === 'string') {
        contentPre.textContent = convertedContent;
      } else {
        const textContent = await convertedContent.text();
        contentPre.textContent = textContent;
      }
      convertedContentPlaceholder.appendChild(contentPre);
    }

    // Update the content object
    content.type = targetType;
    content.content = convertedContent;
    return true;
  } catch (error) {
    console.error('Error converting fragment:', error);
    alert('Error: An unexpected error occurred during conversion.');
    return false;
  }
}

async function showFragmentModal(type, content) {
  const modal = document.getElementById('fragmentModal');
  const modalBody = document.querySelector('#fragmentModalBody');

  // Clear previous content
  modalBody.innerHTML = '';

  // Create a container for better organization
  const container = document.createElement('div');
  container.className = 'fragment-details-container';

  // Display metadata section
  const metadataSection = document.createElement('div');
  metadataSection.className = 'metadata-section mb-3';
  const metadataTable = document.createElement('table');
  metadataTable.className = 'table table-borderless';

  // Add metadata rows
  const metadataRows = [
    ['ID', content.id],
    ['Owner ID', content.ownerId],
    ['Type', content.type],
    ['Size', formatFileSize(content.size)],
    ['Created', new Date(content.created).toLocaleString()],
    ['Updated', new Date(content.updated).toLocaleString()],
  ];

  metadataRows.forEach(([key, value]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
          <td class="fw-bold">${key}</td>
          <td>${value}</td>
      `;
    metadataTable.appendChild(row);
  });

  metadataSection.appendChild(metadataTable);
  container.appendChild(metadataSection);

  // Add the content type selector
  const contentTypeSelector = document.createElement('div');
  contentTypeSelector.className = 'content-type-selector mb-3';
  contentTypeSelector.innerHTML = `
      <label for="contentTypeSelect" class="form-label">Content Types for Conversion</label>
      <select id="contentTypeSelect" class="form-select mt-2">
          ${getConvertibleTypes(type)
            .map((t) => `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`)
            .join('')}
      </select>
  `;
  container.appendChild(contentTypeSelector);

  // Create a two-column layout for content display
  const contentRow = document.createElement('div');
  contentRow.className = 'row mt-3';

  // Original content column
  const originalCol = document.createElement('div');
  originalCol.className = 'col-md-6';
  originalCol.innerHTML = `
      <h5 class="mb-3">Original Content</h5>
      ${
        type.startsWith('image/')
          ? `<div class="image-container">
              <img src="${URL.createObjectURL(content.content)}" class="img-fluid max-width-100">
          </div>`
          : `<pre class="content-pre">${
              typeof content.content === 'string'
                ? content.content
                : new TextDecoder().decode(content.content)
            }</pre>`
      }
  `;

  // Converted content column
  const convertedCol = document.createElement('div');
  convertedCol.className = 'col-md-6';
  convertedCol.innerHTML = `
      <h5 class="mb-3">Converted Content</h5>
      <div id="convertedContentPlaceholder"></div>
  `;

  contentRow.appendChild(originalCol);
  contentRow.appendChild(convertedCol);
  container.appendChild(contentRow);

  modalBody.appendChild(container);

  // Initialize Bootstrap modal
  const bootstrapModal = new bootstrap.Modal(modal, {
    keyboard: true,
    backdrop: true,
  });

  // Show the modal
  bootstrapModal.show();

  // update button
  const oldUpdateBtn = document.getElementById('updateFragmentBtn');
  const newUpdateBtn = oldUpdateBtn.cloneNode(true);
  oldUpdateBtn.replaceWith(newUpdateBtn);

  // delete button
  const oldDeleteBtn = document.getElementById('deleteFragmentBtn');
  const newDeleteBtn = oldDeleteBtn.cloneNode(true);
  oldDeleteBtn.replaceWith(newDeleteBtn);

  // convert button
  const oldConvertBtn = document.getElementById('convertFragmentBtn');
  const newConvertBtn = oldConvertBtn.cloneNode(true);
  oldConvertBtn.replaceWith(newConvertBtn);

  newUpdateBtn.addEventListener('click', async () => {
    const success = await handleUpdateFragment(content);
    if (success) {
      bootstrapModal.hide();
      await refreshFragmentsList(await getUser(), document.querySelector('#fragmentsList'));
      alert('Fragment updated successfully!');
    }
  });

  newDeleteBtn.addEventListener('click', async () => {
    const success = await handleDeleteFragment(content);
    if (success) {
      bootstrapModal.hide();
      await refreshFragmentsList(await getUser(), document.querySelector('#fragmentsList'));
      alert('Fragment deleted successfully!');
    }
  });

  newConvertBtn.addEventListener('click', async () => {
    const targetType = document.getElementById('contentTypeSelect').value;
    const success = await handleFragmentConversion(content, targetType);
    if (success) {
      // Update the content object
      content.type = targetType;
    }
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
