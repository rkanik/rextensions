import { GoogleAuthProvider, signInWithCredential, signOut, type Auth } from 'firebase/auth'

/**
 * Google sign-in for MV3 extensions using Chrome Identity + Firebase.
 *
 * Setup (Google Cloud project linked to Firebase):
 * 1. APIs & Services → Credentials → Create OAuth client ID → Application type: Chrome extension.
 *    Add your extension ID (chrome://extensions, Developer mode).
 * 2. Put that client’s ID in VITE_CHROME_OAUTH_CLIENT_ID (see .env.example) and rebuild.
 * 3. Create a second OAuth client → Application type: Web application.
 *    Authorized redirect URI: https://YOUR_EXTENSION_ID.chromiumapp.org
 *    (no trailing slash). Put that client ID in VITE_GOOGLE_WEB_OAUTH_CLIENT_ID.
 * 4. Firebase Console → Authentication → Settings → Authorized domains:
 *    add chrome-extension://YOUR_EXTENSION_ID
 * 5. Enable the Google sign-in provider in Firebase Authentication.
 *
 * Interactive sign-in uses launchWebAuthFlow when VITE_GOOGLE_WEB_OAUTH_CLIENT_ID is set.
 * Arc/Brave break getAuthToken (Google rejects their custom URI scheme); do not call
 * interactive getAuthToken when the web client is available.
 */

const PROFILE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
] as const

function webOAuthClientId(): string {
  return (import.meta.env.VITE_GOOGLE_WEB_OAUTH_CLIENT_ID as string | undefined)?.trim() ?? ''
}

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

function oauthRedirectUri(): string {
  // Google Cloud Console often rejects a trailing slash; getRedirectURL() adds one.
  return chrome.identity.getRedirectURL().replace(/\/$/, '')
}

function parseAccessTokenFromRedirect(responseUrl: string): string {
  const url = new URL(responseUrl)
  const fromHash = new URLSearchParams(url.hash.replace(/^#/, ''))
  const token = fromHash.get('access_token') || url.searchParams.get('access_token')
  if (!token) {
    const err =
      fromHash.get('error') ||
      url.searchParams.get('error') ||
      'No access_token in OAuth redirect'
    throw new Error(err)
  }
  return token
}

export function getGoogleAccessTokenFromWebAuthFlow(): Promise<string> {
  const clientId = webOAuthClientId()
  if (!clientId) {
    return Promise.reject(
      new Error(
        'VITE_GOOGLE_WEB_OAUTH_CLIENT_ID is missing. Required for Arc/Brave Google sign-in.',
      ),
    )
  }

  const redirectUri = oauthRedirectUri()
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'token')
  authUrl.searchParams.set('scope', PROFILE_SCOPES.join(' '))
  authUrl.searchParams.set('prompt', 'select_account')

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (!responseUrl) {
          reject(new Error('No OAuth redirect returned from launchWebAuthFlow'))
          return
        }
        try {
          resolve(parseAccessTokenFromRedirect(responseUrl))
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      },
    )
  })
}

async function getGoogleAccessTokenForSignIn(): Promise<string> {
  // Prefer launchWebAuthFlow whenever the web client is configured. Arc/Brave break
  // getAuthToken (interactive and sometimes silent) with Google's custom-URI 400.
  if (webOAuthClientId()) {
    return getGoogleAccessTokenFromWebAuthFlow()
  }

  return getGoogleAccessTokenFromChrome(true)
}

export async function signInWithGoogleUsingChromeIdentity(auth: Auth) {
  const accessToken = await getGoogleAccessTokenForSignIn()
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
