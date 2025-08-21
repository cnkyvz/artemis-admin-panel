// artemis-admin/src/services/routeAnalysisService.ts
import apiService from './apiService';

// Tip tanımları
export interface RoutePoint {
  latitude: number;
  longitude: number;
  speed: number;
  date: string;
  mileage: number;
  address: string;
  ignition: boolean;
}

export interface MileageReport {
  totalDistance: number;
  dailyBreakdown: {
    date: string;
    distance: number;
  }[];
}

export interface WorkingHoursReport {
  totalWorkingHours: number;
  totalIdleHours: number;
  dailyBreakdown: any[];
}

export interface HeatPoint {
  latitude: number;
  longitude: number;
  intensity: number;
  duration: number;
}

export interface CompleteAnalysis {
  success: boolean;
  deviceId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  routeHistory: {
    success: boolean;
    data: RoutePoint[];
    totalPoints: number;
    // ✅ METADATA EKLENDİ
    metadata?: {
      totalDistance: number;
      workingHours: number;
      idleHours: number;
      averageSpeed: number;
      totalPoints: number;
      dateRange: {
        startDate: string;
        endDate: string;
      };
    };
  };
  mileageReport: {
    success: boolean;
    data: any;
  };
  workingHours: {
    success: boolean;
    data: any;
  };
  heatMap: {
    success: boolean;
    data: any[];
    totalPoints: number;
  };
}

const routeAnalysisService = {
  // Rota geçmişini getir
  getRouteHistory: async (
    deviceId: string, 
    startDate: string, 
    endDate: string
  ): Promise<RoutePoint[]> => {
    try {
      console.log(`📍 Rota geçmişi isteniyor - ${deviceId}: ${startDate} → ${endDate}`);
      
      const response = await apiService.get<{
        success: boolean;
        data: RoutePoint[];
        totalPoints: number;
      }>(`/route-analysis/route-history/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
      
      console.log(`✅ ${response.totalPoints} rota noktası alındı`);
      return response.data;
    } catch (error) {
      console.error('❌ Rota geçmişi hatası:', error);
      return [];
    }
  },

  // Kilometre raporunu getir  
  getMileageReport: async (
    deviceId: string,
    startDate: string,
    endDate: string
  ): Promise<MileageReport | null> => {
    try {
      console.log(`📊 Kilometre raporu isteniyor - ${deviceId}`);
      
      const response = await apiService.get<MileageReport>(`/route-analysis/mileage-report/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
      
      console.log(`✅ Kilometre raporu alındı - ${response.totalDistance} km`);
      return response;
    } catch (error) {
      console.error('❌ Kilometre raporu hatası:', error);
      return null;
    }
  },

  // Çalışma saati raporunu getir
  getWorkingHoursReport: async (
    deviceId: string,
    startDate: string, 
    endDate: string
  ): Promise<WorkingHoursReport | null> => {
    try {
      console.log(`⏰ Çalışma saati raporu isteniyor - ${deviceId}`);
      
      const response = await apiService.get<WorkingHoursReport>(`/route-analysis/working-hours/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
      
      console.log(`✅ Çalışma saati raporu alındı - ${response.totalWorkingHours} saat`);
      return response;
    } catch (error) {
      console.error('❌ Çalışma saati raporu hatası:', error);
      return null;
    }
  },

  // Heat map verilerini getir
  getHeatMapData: async (
    deviceId: string,
    startDate: string,
    endDate: string
  ): Promise<HeatPoint[]> => {
    try {
      console.log(`🔥 Heat map verisi isteniyor - ${deviceId}`);
      
      const response = await apiService.get<{
        success: boolean;
        data: HeatPoint[];
        totalPoints: number;
      }>(`/route-analysis/heat-map/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
      
      console.log(`✅ ${response.totalPoints} heat point alındı`);
      return response.data;
    } catch (error) {
      console.error('❌ Heat map hatası:', error);
      return [];
    }
  },

  // Komple analiz - Tüm verileri tek seferde getir
  getCompleteAnalysis: async (
    deviceId: string,
    startDate: string,
    endDate: string
  ): Promise<CompleteAnalysis | null> => {
    try {
      console.log(`🎯 Komple analiz isteniyor - ${deviceId}: ${startDate} → ${endDate}`);
      
      const response = await apiService.get<CompleteAnalysis>(`/route-analysis/complete-analysis/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
      
      console.log(`✅ Komple analiz alındı:`, {
        routePoints: response.routeHistory.totalPoints,
        mileageSuccess: response.mileageReport.success,
        heatPoints: response.heatMap.totalPoints
      });
      
      return response;
    } catch (error) {
      console.error('❌ Komple analiz hatası:', error);
      return null;
    }
  },

  // Test endpoint'i
  testConnection: async (deviceId: string): Promise<any> => {
    try {
      console.log(`🧪 Rota analizi test - ${deviceId}`);
      
      const response = await apiService.get<any>(`/route-analysis/test/${deviceId}`);
      
      console.log('✅ Test başarılı:', response.message);
      return response;
    } catch (error) {
      console.error('❌ Test hatası:', error);
      throw error;
    }
  }
};

export default routeAnalysisService;