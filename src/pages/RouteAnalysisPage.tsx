// artemis-admin/src/pages/RouteAnalysisPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Route as RouteIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Servisler
import vehicleService from '../services/vehicleService';
import routeAnalysisService, { CompleteAnalysis, RoutePoint } from '../services/routeAnalysisService';

import { useLocation } from 'react-router-dom';






interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  status: 'active' | 'maintenance' | 'idle';
  location: string;
  fuelLevel: number;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  imageUrl: string;
  lat: number;
  lng: number;
  speed: number;
  registrationDate: string;
  ignition: boolean;
  deviceType: string;
}



// Artemis renk paleti
const ARTEMIS_COLORS = {
  primary: '#0050A0',
  primaryLight: '#3378B5',
  secondary: '#00B4D8',
  accent: '#7ED957',
  warning: '#FF9500',
  error: '#FF3B30',
  success: '#34C759',
  background: '#F0F4F8',
  cardBg: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  border: '#E0E7EF'
};

// MapBox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY25reXZ6IiwiYSI6ImNtYTZ0aWgzeDB0OXoyaXM2c3NxcmhlMHMifQ.PrrRdd0xhCozQsVqUzYvcw';

// Styled Components
const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.7)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.3)}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(ARTEMIS_COLORS.primaryLight, 0.15)}`,
  }
}));

const MapContainer = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryLight, 0.15)}`,
  height: '500px',
  overflow: 'hidden',
  position: 'relative',
}));

const FilterPanel = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.background, 0.9)}, ${alpha(ARTEMIS_COLORS.background, 0.7)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  marginBottom: theme.spacing(3),
}));

const RouteAnalysisPage: React.FC = () => {
    const location = useLocation();
  // State yönetimi
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<CompleteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

  // Araçları yükle
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicleData = await vehicleService.getAllVehicles();
        setVehicles(vehicleData);
        
        // URL'den vehicleId parametresini kontrol et
        const urlParams = new URLSearchParams(location.search);
        const vehicleId = urlParams.get('vehicleId');
        
        if (vehicleId && vehicleData.length > 0) {
          // URL'den gelen araç ID'sini kontrol et
          const foundVehicle = vehicleData.find(v => v.id === vehicleId);
          if (foundVehicle) {
            setSelectedVehicle(vehicleId);
            console.log('🚗 URL\'den araç seçildi:', foundVehicle.plate, foundVehicle.model);
          } else {
            // Araç bulunamazsa ilk aracı seç
            setSelectedVehicle(vehicleData[0].id);
            console.log('⚠️ URL\'deki araç bulunamadı, ilk araç seçildi');
          }
        } else if (vehicleData.length > 0) {
          // URL'de vehicleId yoksa ilk aracı seç
          setSelectedVehicle(vehicleData[0].id);
        }
      } catch (error) {
        console.error('❌ Araçlar yüklenemedi:', error);
        setError('Araçlar yüklenemedi');
      }
    };

    loadVehicles();
  }, [location.search]);

  // Rota analizini çalıştır
  const runAnalysis = useCallback(async () => {
    if (!selectedVehicle) {
      setError('Lütfen bir araç seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      

      console.log(`🎯 Rota analizi başlatılıyor - ${selectedVehicle}: ${startDateStr} → ${endDateStr}`);

      const analysis = await routeAnalysisService.getCompleteAnalysis(
        selectedVehicle,
        startDateStr,
        endDateStr
      );

      if (analysis) {
        setAnalysisData(analysis);
        setRoutePoints(analysis.routeHistory.data);
        console.log('✅ Rota analizi tamamlandı');
      } else {
        setError('Analiz verisi alınamadı');
      }

    } catch (error) {
      console.error('❌ Rota analizi hatası:', error);
      setError('Rota analizi sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle, startDate, endDate]);

  // Test fonksiyonu
  const testConnection = async () => {
    if (!selectedVehicle) return;

    try {
      setLoading(true);
      const testResult = await routeAnalysisService.testConnection(selectedVehicle);
      console.log('🧪 Test sonucu:', testResult);
      
      // Test sonucunu göster
      setError(null);
    } catch (error) {
      console.error('❌ Test hatası:', error);
      setError('Test başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  // Seçili araç bilgisini al
  const selectedVehicleInfo = vehicles.find(v => v.id === selectedVehicle);

  return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${ARTEMIS_COLORS.background}, ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`,
          backgroundAttachment: 'fixed',
          pb: 4
        }}
      >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Başlık */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              borderRadius: '15px',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: 2,
              background: `linear-gradient(135deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.secondary})`,
              boxShadow: `0 10px 20px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
            }}
          >
            <RouteIcon sx={{ fontSize: 25, color: 'white' }} />
          </Box>
          
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Rota Analizi
          </Typography>
        </Box>

        {/* Filtre Paneli */}
        <FilterPanel>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Araç Seçin</InputLabel>
                <Select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  label="Araç Seçin"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            </Grid>

            <Grid item xs={12} md={3}>
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={runAnalysis}
                  disabled={loading || !selectedVehicle}
                  startIcon={loading ? <CircularProgress size={20} /> : <TimelineIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.secondary})`,
                    flex: 1
                  }}
                >
                  {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </Button>
                
                <Tooltip title="Bağlantı Testi">
                  <span> {/* ← Wrapper span ekleyin */}
                    <IconButton
                      onClick={testConnection}
                      disabled={!selectedVehicle}
                      sx={{ 
                        border: `1px solid ${ARTEMIS_COLORS.primary}`,
                        color: ARTEMIS_COLORS.primary
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </FilterPanel>

        {/* Hata Mesajı */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Seçili Araç Bilgisi */}
        {selectedVehicleInfo && (
          <Paper sx={{ p: 2, mb: 3, background: alpha(ARTEMIS_COLORS.accent, 0.1) }}>
            <Typography variant="h6" sx={{ color: ARTEMIS_COLORS.primary }}>
              Seçili Araç: {selectedVehicleInfo.plate} - {selectedVehicleInfo.model}
            </Typography>
            <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
              Sürücü: {selectedVehicleInfo.driver} | Son Konum: {selectedVehicleInfo.location}
            </Typography>
          </Paper>
        )}

        {/* İstatistik Kartları */}
        {analysisData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Toplam Mesafe
                      </Typography>
                      <Typography variant="h4" sx={{ color: ARTEMIS_COLORS.primary, fontWeight: 'bold' }}>
                        {/* ✅ METADATA'DAN AL */}
                        {analysisData.routeHistory.metadata?.totalDistance?.toFixed(1) || 
                        analysisData.mileageReport.data?.totalDistance?.toFixed(1) || 
                        '0.0'} km
                      </Typography>
                    </Box>
                    <SpeedIcon sx={{ fontSize: 40, color: alpha(ARTEMIS_COLORS.primary, 0.8) }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Çalışma Saati
                      </Typography>
                      <Typography variant="h4" sx={{ color: ARTEMIS_COLORS.accent, fontWeight: 'bold' }}>
                        {/* ✅ METADATA'DAN AL */}
                        {analysisData.routeHistory.metadata?.workingHours?.toFixed(1) || 
                        analysisData.workingHours.data?.totalWorkingHours?.toFixed(1) || 
                        '0.0'} saat
                      </Typography>
                    </Box>
                    <AccessTimeIcon sx={{ fontSize: 40, color: alpha(ARTEMIS_COLORS.accent, 0.8) }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Rota Noktası
                      </Typography>
                      <Typography variant="h4" sx={{ color: ARTEMIS_COLORS.warning, fontWeight: 'bold' }}>
                        {analysisData.routeHistory.totalPoints.toLocaleString()}
                      </Typography>
                    </Box>
                    <MapIcon sx={{ fontSize: 40, color: alpha(ARTEMIS_COLORS.warning, 0.8) }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Ortalama Hız
                      </Typography>
                      <Typography variant="h4" sx={{ color: ARTEMIS_COLORS.secondary, fontWeight: 'bold' }}>
                        {/* ✅ METADATA'DAN AL - km/h OLARAK */}
                        {analysisData.routeHistory.metadata?.averageSpeed?.toFixed(1) || 
                        (routePoints.length > 0 
                          ? (routePoints.reduce((sum, point) => sum + (point.speed || 0), 0) / routePoints.length).toFixed(1)
                          : '0.0'
                        )} km/h
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: alpha(ARTEMIS_COLORS.secondary, 0.8) }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>
        )}

        {/* Harita */}
        {routePoints.length > 0 && (
          <MapContainer>
            <Map
              initialViewState={{
                longitude: routePoints[0]?.longitude || 29.0335,
                latitude: routePoints[0]?.latitude || 41.0082,
                zoom: 12
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              {/* Rota çizgisi */}
              <Source
                id="route"
                type="geojson"
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: routePoints.map(point => [point.longitude, point.latitude])
                  }
                }}
              >
                <Layer
                  id="route"
                  type="line"
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': ARTEMIS_COLORS.primary,
                    'line-width': 4
                  }}
                />
              </Source>

              {/* Başlangıç noktası */}
              {routePoints[0] && (
                <Marker
                  longitude={routePoints[0].longitude}
                  latitude={routePoints[0].latitude}
                  anchor="bottom"
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: ARTEMIS_COLORS.accent,
                      border: `3px solid white`,
                      boxShadow: `0 0 10px ${alpha(ARTEMIS_COLORS.accent, 0.5)}`
                    }}
                  />
                </Marker>
              )}

              {/* Bitiş noktası */}
              {routePoints[routePoints.length - 1] && (
                <Marker
                  longitude={routePoints[routePoints.length - 1].longitude}
                  latitude={routePoints[routePoints.length - 1].latitude}
                  anchor="bottom"
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: ARTEMIS_COLORS.error,
                      border: `3px solid white`,
                      boxShadow: `0 0 10px ${alpha(ARTEMIS_COLORS.error, 0.5)}`
                    }}
                  />
                </Marker>
              )}
            </Map>
          </MapContainer>
        )}

        {/* Boş durum */}
        {!loading && !analysisData && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RouteIcon sx={{ fontSize: 80, color: alpha(ARTEMIS_COLORS.textLight, 0.5), mb: 2 }} />
            <Typography variant="h6" sx={{ color: ARTEMIS_COLORS.textLight, mb: 1 }}>
              Rota Analizi
            </Typography>
            <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
              Bir araç seçin ve tarih aralığını belirleyerek analiz başlatın
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RouteAnalysisPage;