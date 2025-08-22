// services/employeeService.ts - Tam güncellenmiş hali
import apiService from './apiService';

// Interface ismini IEmployee olarak değiştirin
export interface IEmployee {
  personel_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 1; // Sadece çalışanlar (rol = 1)
  avatar?: string;
  position?: string;
  department?: string;
  phone_number?: string;
  location?: string;
  hire_date?: string;
  birthday?: string;
  education?: string;
  skills?: string[];
  // Performance tipini ekliyoruz
  performance?: {
    current: number;
    history: number[];
    tasks: {
      completed: number;
      inProgress: number;
      overdue: number;
    };
    attendance: number;
    goals: {
      name: string;
      progress: number;
    }[];
  };
  projects?: {
    id: string;
    name: string;
    status: 'completed' | 'active' | 'planned';
    role: string;
  }[];
}

// Değerlendirme interface'i
export interface IEmployeeReview {
  id: number;
  puan: number;
  yorum: string;
  tarih: string;
  firma_adi: string;
  seri_no?: string;
  servis_tarihi?: string;
  servis_aciklama?: string;
}

// Önce yeni bir interface ekleyin (dosyanın IEmployeeReview'dan sonrasına)
export interface IEmployeeWork {
  id: number;
  baslik: string;
  aciklama?: string;
  tarih: string;
  durum: 'tamamlandi' | 'devam_ediyor' | 'beklemede';
  musteri_adi?: string;
  seri_no?: string;
}

// Sonra IEmployeeDetail'i düzeltin
export interface IEmployeeDetail {
  calisan: IEmployee;           // any yerine IEmployee
  degerlendirmeler: IEmployeeReview[];
  son_isler: IEmployeeWork[];   // any[] yerine IEmployeeWork[]
}

const employeeService = {
  // Tüm çalışanları getir
  getAllEmployees: async (): Promise<IEmployee[]> => {
    try {
      console.log('🔍 Çalışanlar getiriliyor...');
      const data = await apiService.get<IEmployee[]>('/calisanlar');
      console.log('✅ Çalışanlar getirildi:', data);
      return data;
    } catch (error) {
      console.error('❌ Çalışanlar getirilirken hata:', error);
      throw error;
    }
  },

  // Çalışan değerlendirmelerini getir
  getEmployeeReviews: async (personelId: number): Promise<IEmployeeReview[]> => {
    try {
      console.log('🔍 Çalışan değerlendirmeleri getiriliyor:', personelId);
      const data = await apiService.get<IEmployeeReview[]>(`/calisan-degerlendirmeleri/${personelId}`);
      console.log('✅ Değerlendirmeler getirildi:', data);
      return data;
    } catch (error) {
      console.error('❌ Değerlendirmeler getirilirken hata:', error);
      return []; // Hata durumunda boş array döndür
    }
  },

  // Çalışan detaylarını getir
  getEmployeeDetail: async (personelId: number): Promise<IEmployeeDetail> => {
    try {
      console.log('🔍 Çalışan detayı getiriliyor:', personelId);
      const data = await apiService.get<IEmployeeDetail>(`/calisan-detay/${personelId}`);
      console.log('✅ Çalışan detayı getirildi:', data);
      return data;
    } catch (error) {
      console.error('❌ Çalışan detayı getirilirken hata:', error);
      throw error;
    }
  },

  // Yeni çalışan oluştur
  createEmployee: async (employeeData: Omit<IEmployee, 'personel_id'>): Promise<IEmployee> => {
    try {
      console.log('➕ Yeni çalışan oluşturuluyor:', employeeData);
      const data = await apiService.post<IEmployee>('/calisanlar', employeeData);
      console.log('✅ Çalışan oluşturuldu:', data);
      return data;
    } catch (error) {
      console.error('❌ Çalışan oluşturulurken hata:', error);
      throw error;
    }
  },

  // Çalışan güncelle
  updateEmployee: async (personel_id: number, employeeData: Partial<IEmployee>): Promise<IEmployee> => {
    try {
      console.log('🔄 Çalışan güncelleniyor:', personel_id, employeeData);
      const data = await apiService.put<IEmployee>(`/calisanlar/${personel_id}`, employeeData);
      console.log('✅ Çalışan güncellendi:', data);
      return data;
    } catch (error) {
      console.error('❌ Çalışan güncellenirken hata:', error);
      throw error;
    }
  },

  // Çalışan sil
  deleteEmployee: async (personel_id: number): Promise<void> => {
    try {
      console.log('🗑️ Çalışan siliniyor:', personel_id);
      await apiService.delete(`/calisanlar/${personel_id}`);
      console.log('✅ Çalışan silindi:', personel_id);
    } catch (error) {
      console.error('❌ Çalışan silinirken hata:', error);
      throw error;
    }
  }
};

export default employeeService;