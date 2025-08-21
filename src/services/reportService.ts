// src/services/reportService.ts
import apiService from './apiService';

// Type definitions
export interface TestResult {
  id: number;
  nokta_adi: string;
  test_adi: string;
  test_sonucu: number;
  test_sonucu_metin: string;
  test_birimi: string;
  durum: 'uygun' | 'uygun_degil' | 'sinir_deger';
  artemis_numune_no: string;
}

export interface PendingReport {
  id: number;
  rapor_no: string;
  rapor_adi: string;
  qr_kod: string;
  firma_adi: string;
  company_name?: string;
  durum: 'onay_bekliyor' | 'onaylandi' | 'reddedildi' | 'revizyon_gerekli';
  hazirlayan_id: string;
  hazirlayan_ad?: string;
  hazirlayan_soyad?: string;
  hazirlanma_tarihi: string;
  onay_tarihi?: string;
  red_nedeni?: string;
  toplam_test_sayisi: number;
  uygun_test_sayisi: number;
  uygun_olmayan_test_sayisi: number;
  genel_degerlendirme: string;
  oneriler?: string;
}

export interface ReportDetail extends PendingReport {
  test_sonuclari: TestResult[];
  alinan_yer: string;
  numune_alis_tarihi: string;
  rapor_metni?: any;
}

export interface ApprovalAction {
  islem: 'onayla' | 'reddet' | 'revizyon_iste';
  aciklama?: string;
}

export interface ReportStats {
  onay_bekliyor: number;
  onaylandi: number;
  reddedildi: number;
  revizyon_gerekli: number;
  toplam: number;
}

class ReportService {
  
  /**
   * Onay bekleyen raporları getir
   */
  async getPendingReports(): Promise<PendingReport[]> {
    try {
      const response = await apiService.get<PendingReport[]>('/admin/onay-bekleyen-raporlar');
      return response;
    } catch (error) {
      console.error('❌ Onay bekleyen raporlar alınamadı:', error);
      throw new Error('Onay bekleyen raporlar yüklenemedi');
    }
  }

  /**
   * Tüm raporları getir (filtreli)
   */
  async getAllReports(durum?: string): Promise<PendingReport[]> {
    try {
      let url = '/admin/tum-raporlar';
      if (durum) {
        url += `?durum=${durum}`;
      }
      const response = await apiService.get<PendingReport[]>(url);
      return response;
    } catch (error) {
      console.error('❌ Tüm raporlar alınamadı:', error);
      throw new Error('Raporlar yüklenemedi');
    }
  }

  /**
   * Rapor detayını getir
   */
  async getReportDetail(reportId: number): Promise<ReportDetail> {
    try {
      const response = await apiService.get<ReportDetail>(`/rapor-detay/${reportId}`);
      return response;
    } catch (error) {
      console.error('❌ Rapor detayı alınamadı:', error);
      throw new Error('Rapor detayları yüklenemedi');
    }
  }

  /**
   * Raporu onayla/reddet/revizyon iste
   */
  async approveReport(reportId: number, action: ApprovalAction): Promise<PendingReport> {
    try {
      const response = await apiService.post<PendingReport>(
        `/admin/rapor-onayla/${reportId}`, 
        action
      );
      return response;
    } catch (error) {
      console.error('❌ Rapor onay işlemi başarısız:', error);
      throw new Error('Rapor onay işlemi gerçekleştirilemedi');
    }
  }

  /**
   * Rapor istatistiklerini getir
   */
  async getReportStats(): Promise<ReportStats> {
    try {
      const response = await apiService.get<ReportStats>('/admin/rapor-istatistikleri');
      return response;
    } catch (error) {
      console.error('❌ Rapor istatistikleri alınamadı:', error);
      // Fallback olarak pending reports'tan hesapla
      const pendingReports = await this.getPendingReports();
      return {
        onay_bekliyor: pendingReports.length,
        onaylandi: 0,
        reddedildi: 0,
        revizyon_gerekli: 0,
        toplam: pendingReports.length
      };
    }
  }

  /**
   * Test sonuçlarını nokta bazında grupla
   */
  groupTestsByLocation(testResults: TestResult[]): Record<string, TestResult[]> {
    return testResults.reduce((groups, test) => {
      const nokta = test.nokta_adi;
      if (!groups[nokta]) {
        groups[nokta] = [];
      }
      groups[nokta].push(test);
      return groups;
    }, {} as Record<string, TestResult[]>);
  }

  /**
   * Test başarı oranını hesapla
   */
  calculateSuccessRate(report: PendingReport): number {
    if (report.toplam_test_sayisi === 0) return 0;
    return Math.round((report.uygun_test_sayisi / report.toplam_test_sayisi) * 100);
  }

  /**
   * Durum rengini al
   */
  getStatusColor(durum: string): string {
    switch (durum) {
      case 'onay_bekliyor':
        return '#FF9500'; // Turuncu
      case 'onaylandi':
        return '#34C759'; // Yeşil
      case 'reddedildi':
        return '#FF3B30'; // Kırmızı
      case 'revizyon_gerekli':
        return '#FF9500'; // Turuncu
      default:
        return '#666666'; // Gri
    }
  }

  /**
   * Durum metnini al
   */
  getStatusText(durum: string): string {
    switch (durum) {
      case 'onay_bekliyor':
        return 'Onay Bekliyor';
      case 'onaylandi':
        return 'Onaylandı';
      case 'reddedildi':
        return 'Reddedildi';
      case 'revizyon_gerekli':
        return 'Revizyon Gerekli';
      default:
        return 'Bilinmeyen';
    }
  }

  /**
   * Tarih formatla
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Rapor önceliğini hesapla (eski raporlar öncelikli)
   */
  calculatePriority(hazirlanmaTarihi: string): 'high' | 'medium' | 'low' {
    const now = new Date();
    const reportDate = new Date(hazirlanmaTarihi);
    const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 3) return 'high';    // 3+ gün önce → Yüksek öncelik
    if (daysDiff >= 1) return 'medium';  // 1-2 gün önce → Orta öncelik
    return 'low';                        // Bugün → Düşük öncelik
  }

  /**
   * Öncelik rengini al
   */
  getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return '#FF3B30'; // Kırmızı
      case 'medium':
        return '#FF9500'; // Turuncu
      case 'low':
        return '#34C759'; // Yeşil
    }
  }
}

// Singleton instance
const reportService = new ReportService();

export default reportService;