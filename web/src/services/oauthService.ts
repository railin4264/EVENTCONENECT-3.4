import { api } from './api';

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface OAuthConfig {
  google: {
    clientId: string;
    scope: string;
  };
  facebook: {
    appId: string;
    scope: string;
  };
  github: {
    clientId: string;
    scope: string;
  };
  apple: {
    clientId: string;
    scope: string;
  };
}

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

export interface OAuthResponse {
  user: OAuthUser;
  token: string;
  refreshToken: string;
}

class OAuthService {
  private config: OAuthConfig;
  private providers: OAuthProvider[];

  constructor() {
    this.config = {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scope: 'email profile openid',
      },
      facebook: {
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        scope: 'email public_profile',
      },
      github: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
        scope: 'user:email read:user',
      },
      apple: {
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        scope: 'email name',
      },
    };

    this.providers = [
      {
        id: 'google',
        name: 'Google',
        icon: '/icons/google.svg',
        color: '#4285F4',
        enabled: !!this.config.google.clientId,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '/icons/facebook.svg',
        color: '#1877F2',
        enabled: !!this.config.facebook.appId,
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: '/icons/github.svg',
        color: '#333333',
        enabled: !!this.config.github.clientId,
      },
      {
        id: 'apple',
        name: 'Apple',
        icon: '/icons/apple.svg',
        color: '#000000',
        enabled: !!this.config.apple.clientId,
      },
    ];
  }

  /**
   * Obtener proveedores disponibles
   */
  getProviders(): OAuthProvider[] {
    return this.providers.filter(provider => provider.enabled);
  }

  /**
   * Verificar si un proveedor está disponible
   */
  isProviderAvailable(providerId: string): boolean {
    return this.providers.find(p => p.id === providerId)?.enabled || false;
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(): Promise<OAuthResponse> {
    if (!this.config.google.clientId) {
      throw new Error('Google OAuth no está configurado');
    }

    try {
      // Cargar Google Identity Services
      await this.loadGoogleIdentityServices();

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.config.google.clientId,
        scope: this.config.google.scope,
        callback: async (response) => {
          if (response.error) {
            throw new Error(`Error de Google OAuth: ${response.error}`);
          }

          // Obtener información del usuario
          const userInfo = await this.getGoogleUserInfo(response.access_token);
          
          // Enviar al backend para autenticación
          const oauthResponse = await api.auth.oauthLogin({
            provider: 'google',
            accessToken: response.access_token,
            userInfo,
          });

          return oauthResponse;
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      throw new Error(`Error en login con Google: ${error}`);
    }
  }

  /**
   * Login con Facebook
   */
  async loginWithFacebook(): Promise<OAuthResponse> {
    if (!this.config.facebook.appId) {
      throw new Error('Facebook OAuth no está configurado');
    }

    try {
      // Cargar Facebook SDK
      await this.loadFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.login(async (response) => {
          if (response.authResponse) {
            try {
              // Obtener información del usuario
              const userInfo = await this.getFacebookUserInfo(response.authResponse.accessToken);
              
              // Enviar al backend para autenticación
              const oauthResponse = await api.auth.oauthLogin({
                provider: 'facebook',
                accessToken: response.authResponse.accessToken,
                userInfo,
              });

              resolve(oauthResponse);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Usuario canceló el login de Facebook'));
          }
        }, { scope: this.config.facebook.scope });
      });
    } catch (error) {
      throw new Error(`Error en login con Facebook: ${error}`);
    }
  }

  /**
   * Login con GitHub
   */
  async loginWithGitHub(): Promise<OAuthResponse> {
    if (!this.config.github.clientId) {
      throw new Error('GitHub OAuth no está configurado');
    }

    try {
      const state = this.generateState();
      const githubUrl = `https://github.com/login/oauth/authorize?client_id=${this.config.github.clientId}&scope=${this.config.github.scope}&state=${state}`;
      
      // Abrir popup de GitHub
      const popup = window.open(githubUrl, 'github-oauth', 'width=600,height=600');
      
      if (!popup) {
        throw new Error('No se pudo abrir la ventana de GitHub');
      }

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Usuario canceló el login de GitHub'));
          }
        }, 1000);

        // Escuchar mensaje del popup
        window.addEventListener('message', async (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'github-oauth-success') {
            clearInterval(checkClosed);
            popup.close();
            
            try {
              const { code, state: returnedState } = event.data;
              
              if (state !== returnedState) {
                throw new Error('Estado OAuth inválido');
              }

              // Intercambiar código por token
              const tokenResponse = await this.exchangeGitHubCode(code);
              
              // Obtener información del usuario
              const userInfo = await this.getGitHubUserInfo(tokenResponse.access_token);
              
              // Enviar al backend para autenticación
              const oauthResponse = await api.auth.oauthLogin({
                provider: 'github',
                accessToken: tokenResponse.access_token,
                userInfo,
              });

              resolve(oauthResponse);
            } catch (error) {
              reject(error);
            }
          }
        });
      });
    } catch (error) {
      throw new Error(`Error en login con GitHub: ${error}`);
    }
  }

  /**
   * Login con Apple
   */
  async loginWithApple(): Promise<OAuthResponse> {
    if (!this.config.apple.clientId) {
      throw new Error('Apple OAuth no está configurado');
    }

    try {
      // Cargar Apple Sign-In
      await this.loadAppleSignIn();

      return new Promise((resolve, reject) => {
        AppleID.auth.init({
          clientId: this.config.apple.clientId,
          scope: this.config.apple.scope,
          redirectURI: `${window.location.origin}/auth/apple/callback`,
          state: this.generateState(),
        });

        AppleID.auth.signIn().then(async (response) => {
          try {
            // Enviar al backend para autenticación
            const oauthResponse = await api.auth.oauthLogin({
              provider: 'apple',
              accessToken: response.authorization.code,
              userInfo: {
                id: response.user,
                email: response.user?.email,
                name: response.user?.name,
                provider: 'apple',
              },
            });

            resolve(oauthResponse);
          } catch (error) {
            reject(error);
          }
        }).catch(reject);
      });
    } catch (error) {
      throw new Error(`Error en login con Apple: ${error}`);
    }
  }

  /**
   * Login genérico por proveedor
   */
  async loginWithProvider(providerId: string): Promise<OAuthResponse> {
    switch (providerId) {
      case 'google':
        return this.loginWithGoogle();
      case 'facebook':
        return this.loginWithFacebook();
      case 'github':
        return this.loginWithGitHub();
      case 'apple':
        return this.loginWithApple();
      default:
        throw new Error(`Proveedor OAuth no soportado: ${providerId}`);
    }
  }

  /**
   * Logout de todos los proveedores
   */
  async logout(): Promise<void> {
    try {
      // Logout de Google
      if (window.google?.accounts?.oauth2) {
        const token = localStorage.getItem('google_access_token');
        if (token) {
          await google.accounts.oauth2.revoke(token);
          localStorage.removeItem('google_access_token');
        }
      }

      // Logout de Facebook
      if (window.FB) {
        FB.logout();
      }

      // Logout de GitHub (limpiar tokens)
      localStorage.removeItem('github_access_token');

      // Logout de Apple
      if (window.AppleID) {
        AppleID.auth.signOut();
      }

      // Logout del backend
      await api.auth.logout();
    } catch (error) {
      console.error('Error en logout OAuth:', error);
    }
  }

  /**
   * Verificar estado de autenticación
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await api.auth.checkAuth();
      return response.isAuthenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información del usuario de Google
   */
  private async getGoogleUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener información de usuario de Google');
    }

    const userData = await response.json();
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      provider: 'google',
    };
  }

  /**
   * Obtener información del usuario de Facebook
   */
  private async getFacebookUserInfo(accessToken: string): Promise<OAuthUser> {
    return new Promise((resolve, reject) => {
      FB.api('/me', { fields: 'id,email,name,picture' }, (response) => {
        if (response.error) {
          reject(new Error('Error al obtener información de usuario de Facebook'));
          return;
        }

        resolve({
          id: response.id,
          email: response.email,
          name: response.name,
          picture: response.picture?.data?.url,
          provider: 'facebook',
        });
      });
    });
  }

  /**
   * Obtener información del usuario de GitHub
   */
  private async getGitHubUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener información de usuario de GitHub');
    }

    const userData = await response.json();
    
    // Obtener email del usuario
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    let email = '';
    if (emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || emails[0]?.email || '';
    }

    return {
      id: userData.id.toString(),
      email,
      name: userData.name || userData.login,
      picture: userData.avatar_url,
      provider: 'github',
    };
  }

  /**
   * Intercambiar código de autorización por token de acceso (GitHub)
   */
  private async exchangeGitHubCode(code: string): Promise<{ access_token: string }> {
    const response = await fetch('/api/auth/github/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Error al intercambiar código de GitHub');
    }

    return response.json();
  }

  /**
   * Generar estado aleatorio para OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Cargar Google Identity Services
   */
  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar Google Identity Services'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Cargar Facebook SDK
   */
  private async loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve();
        return;
      }

      // Inicializar Facebook SDK
      window.fbAsyncInit = () => {
        FB.init({
          appId: this.config.facebook.appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        resolve();
      };

      // Cargar Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onerror = () => reject(new Error('Error al cargar Facebook SDK'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Cargar Apple Sign-In
   */
  private async loadAppleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.AppleID) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar Apple Sign-In'));
      
      document.head.appendChild(script);
    });
  }
}

// Exportar instancia singleton
export const oauthService = new OAuthService();

// Tipos globales para TypeScript
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: any) => any;
          revoke: (token: string) => Promise<void>;
        };
      };
    };
    FB?: {
      login: (callback: (response: any) => void, options?: any) => void;
      api: (path: string, options: any, callback: (response: any) => void) => void;
      logout: (callback?: () => void) => void;
      init: (config: any) => void;
    };
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
        signOut: () => Promise<void>;
      };
    };
    fbAsyncInit?: () => void;
  }
}
