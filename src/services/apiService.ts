// src/services/apiService.ts

// API yanıtları için interface tanımları
interface AdminLoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface FileUploadResponse {
  success: boolean;
  fileUrl: string;
  fileName: string;
}

export interface Vehicle {
  id: string;
  plaka: string;
  model: string;
  deviceId: string;
}

export interface JobDetails {
  id: string;
  data: {
    to: string;
    subject: string;
  };
  timestamp?: number;
  failedReason?: string;
}

export interface QueueDetails {
  completed: JobDetails[];
  failed: JobDetails[];
  active: JobDetails[];
  waiting: JobDetails[];
  counts: {
    completed: number;
    failed: number;
    active: number;
    waiting: number;
  };
}

// API base URL'sini production için ayarla
const API_BASE_URL = 'https://api.artemisaritim.com/api';


// Token yardımcı fonksiyonları
const getToken = (): string | null => {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken && adminToken !== 'temp_token') return adminToken;
  
  const userToken = localStorage.getItem('token');
  return userToken;
};

const setToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

const apiService = {
  // Generic GET isteği - sadece önemli loglar
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '' 
        }
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorText = JSON.stringify(errorJson);
          } else {
            errorText = await response.text();
          }
        } catch (e) {
          console.error('❌ Yanıt body okunamadı:', e);
        }
        
        throw new Error(`API yanıt hatası: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/xml')) {
        const text = await response.text();
        return text as unknown as T;
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        
        if (contentType && contentType.includes('text/xml')) {
          return text as unknown as T;
        }
        
        throw new Error('API, JSON yerine farklı tipte yanıt döndürdü');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API GET Error:', error);
      throw error;
    }
  },
    
  // Generic POST isteği - sadece SOAP istekleri için detaylı log
  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        'Authorization': token ? `Bearer ${token}` : ''
      };
      
      let bodyData: string | FormData;
      let isSOAP = false;
      
      // SOAP isteği özel işlemi
      if (typeof data === 'object' && data !== null && 'soapBody' in data && 'soapAction' in data) {
        const soapData = data as { soapBody: string; soapAction: string };
        isSOAP = true;
        
        console.log(`📡 SOAP: ${soapData.soapAction.split('/').pop()}`);
        
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify({
          soapAction: soapData.soapAction,
          soapBody: soapData.soapBody
        });
        
      } else {
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify(data);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: bodyData
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorText = JSON.stringify(errorJson);
          } else {
            errorText = await response.text();
          }
        } catch (e) {
          console.error('❌ Yanıt body okunamadı:', e);
        }
        
        throw new Error(`API yanıt hatası: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      // XML yanıtını işle
      if (contentType && contentType.includes('text/xml')) {
        const text = await response.text();
        if (isSOAP) {
          console.log(`✅ SOAP yanıt: ${Math.round(text.length / 1024)}KB`);
        }
        return text as unknown as T;
      }
      
      // JSON yanıtını işle
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      
      // Diğer yanıt tipleri için text olarak dön
      const text = await response.text();
      return text as unknown as T;
    } catch (error) {
      console.error('❌ API POST Error:', error);
      throw error;
    }
  },

  // PUT isteği
  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API yanıt hatası: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  // DELETE isteği
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': token ? `Bearer ${token}` : '' 
        }
      });
      
      if (!response.ok) {
        throw new Error(`API yanıt hatası: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Dosya yükleme isteği
  uploadFile: async (endpoint: string, file: File): Promise<FileUploadResponse> => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API yanıt hatası: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  },

  // Admin girişi
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      console.log('🔐 Admin giriş yapılıyor...');
      
      const response = await fetch(`${API_BASE_URL}/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json() as AdminLoginResponse;
      
      if (data.token) {
        setToken(data.token);
        console.log('✅ Giriş başarılı');
      }

      return data;
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      throw error;
    }
  },

  // Çıkış yapma (token silme)
  logout: (): void => {
    localStorage.removeItem('admin_token');
  },

  // Token kontrolü
  isAuthenticated: (): boolean => {
    return !!getToken();
  }
};

export default apiService;