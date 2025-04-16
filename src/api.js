// src/api.js

// fragments microservice API
const apiUrl = process.env.API_URL;

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    console.log('Using URL', { res });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Given an authenticated user and fragment ID, request a specific fragment from the
 * fragments microservice. We expect a user to have an `idToken` attached, so we can
 * send that along with the request.
 */
export async function getUserFragmentById(user, fragmentId) {
  console.log('Requesting fragment data by ID...', { fragmentId });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get('Content-Type');
    if (contentType.startsWith('image/')) {
      return await res.blob();
    } else if (contentType.includes('json')) {
      const data = await res.json();
      const returnValue = JSON.stringify(data, null, 2);
      return returnValue;
    } else {
      return await res.text();
    }
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id', { err });
    throw err;
  }
}

export async function getUserFragmentMetadataById(user, fragmentId) {
  console.log('Requesting metadata for fragment ID...', { fragmentId });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}/info`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully got fragment metadata', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id/info', { err });
    throw err;
  }
}

/**
 * Creates a new fragment in the fragments microservice. We expect a user to have an
 * `idToken` attached, so we can send that along with the request.
 */
export async function postUserFragment(user, fragmentData) {
  console.log('Creating new fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': fragmentData.type,
      },
      body: fragmentData.data,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully created fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
    throw err;
  }
}

export async function updateUserFragmentById(user, fragmentId, updatedData) {
  console.log('Updating fragment...', { fragmentId });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'PUT',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': updatedData.type,
      },
      body: updatedData.data,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully updated fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments/:id', { err });
    throw err;
  }
}

export async function deleteUserFragmentById(user, fragmentId) {
  console.log('Deleting fragment...', { fragmentId });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    console.log(`Successfully deleted fragment ID: ${fragmentId}`);
    return true;
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments/:id', { err });
    throw err;
  }
}

export async function getFragmentInType(user, fragmentId, extension) {
  console.log('Requesting fragment in specific type...', { fragmentId, extension });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}${extension}`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to get fragment: ${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get('Content-Type');
    if (contentType.startsWith('image/')) {
      return await res.blob();
    } else if (contentType.includes('json')) {
      const data = await res.json();
      const returnValue = JSON.stringify(data, null, 2);
      return returnValue;
    } else {
      return await res.text();
    }
  } catch (err) {
    console.error('Error getting fragment in specific type:', { err });
    throw err;
  }
}
