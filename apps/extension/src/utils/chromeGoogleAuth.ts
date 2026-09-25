import { GoogleAuthProvider, signInWithCredential, signOut, type Auth } from 'firebase/auth'

/**
 * Google sign-in for MV3 extensions using Chrome Identity + Firebase.
 *
 * Setup (Google Cloud project linked to Firebase):
 * 1. APIs & Services → Credentials → Create OAuth client ID → Application type: Chrome extension.
 *    Add your extension ID (chrome://extensions, Developer mode).
 * 2. Put that client’s ID in VITE_CHROME_OAUTH_CLIENT_ID (see .env.example) and rebuild.
 * 3. Firebase Console → Authentication → Settings → Authorized domains:
 *    add chrome-extension://YOUR_EXTENSION_ID
 * 4. Enable the Google sign-in provider in Firebase Authentication.
 */
export function getGoogleAccessTokenFromChrome(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      if (!token) {
        reject(new Error('No OAuth token returned from chrome.identity'))
        return
      }
      resolve(token)
    })
  })
}

export async function signInWithGoogleUsingChromeIdentity(auth: Auth) {
  const accessToken = await getGoogleAccessTokenFromChrome(true)
  const credential = GoogleAuthProvider.credential(null, accessToken)
  await signInWithCredential(auth, credential)
}

export async function signOutGoogleExtensionSession(auth: Auth) {
  await signOut(auth)
  await new Promise<void>((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve()
        return
      }
      chrome.identity.removeCachedAuthToken({ token }, () => resolve())
    })
  })
}
