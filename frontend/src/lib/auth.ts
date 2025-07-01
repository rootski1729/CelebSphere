import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  role: 'celebrity' | 'fan';
}

export interface AuthResponse {
  access_token: string;
  user: User;
  expires_in: number;
}

class AuthService {
  private tokenKey = 'celebnetwork_token';
  private userKey = 'celebnetwork_user';

  setAuth(authData: AuthResponse) {
    Cookies.set(this.tokenKey, authData.access_token, { expires: 7 });
    Cookies.set(this.userKey, JSON.stringify(authData.user), { expires: 7 });
  }

  getToken(): string | null {
    return Cookies.get(this.tokenKey) || null;
  }

  getUser(): User | null {
    const userStr = Cookies.get(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    Cookies.remove(this.tokenKey);
    Cookies.remove(this.userKey);
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();