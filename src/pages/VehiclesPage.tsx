//artemis-admin/src/pages/VehiclesPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  CssBaseline,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  DirectionsCar as DirectionsCarIcon,
  Search as SearchIcon,
  Map as MapIcon,
  List as ListIcon,
  LocalGasStation as LocalGasStationIcon,
  Speed as SpeedIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationOnIcon,
  Build as BuildIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import Map, { 
  Marker, 
  NavigationControl, 
  Source, 
  Layer, 
  FullscreenControl,
  GeolocateControl,
  ScaleControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon } from '@mui/icons-material';

// Araç servisini import et
import vehicleService from '../services/vehicleService';

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

// MapBox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY25reXZ6IiwiYSI6ImNtYTZ0aWgzeDB0OXoyaXM2c3NxcmhlMHMifQ.PrrRdd0xhCozQsVqUzYvcw';

// Artemis renk paleti
const ARTEMIS_COLORS = {
  primary: '#0050A0',    // Koyu mavi
  primaryLight: '#3378B5', // Açık koyu mavi
  primaryDark: '#00376F', // Daha koyu mavi
  secondary: '#00B4D8',  // Açık mavi
  secondaryLight: '#47DBFD', // Daha açık mavi
  secondaryDark: '#0089A7', // Koyu açık mavi
  accent: '#7ED957',     // Yeşil
  accentLight: '#A5E989', // Açık yeşil
  accentDark: '#59A834', // Koyu yeşil
  warning: '#FF9500',    // Turuncu
  error: '#FF3B30',      // Kırmızı
  success: '#34C759',    // Koyu yeşil
  background: '#F0F4F8', // Açık gri-mavi
  cardBg: '#FFFFFF',     // Kart arkaplan
  text: '#333333',       // Ana metin
  textLight: '#666666',  // Açık metin
  border: '#E0E7EF'      // Kenarlık
};

// Yaratıcı Araç Kartı
const VehicleCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  height: '100%',
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.85)}, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.65)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.6)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.2)}`,
  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  transform: 'perspective(1000px) rotateX(0) translateZ(0)',
  transformStyle: 'preserve-3d',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.accent})`,
    borderRadius: '4px 4px 0 0',
  },
  '&:hover': {
    transform: 'perspective(1000px) rotateX(5deg) translateY(-10px) translateZ(20px)',
    boxShadow: `0 25px 50px ${alpha(ARTEMIS_COLORS.primaryDark, 0.3)}`,
  }
}));

// Araç gösterge bileşeni
const VehicleGauge = styled(Box)<{ value: number, color: string }>(({ value, color, theme }) => ({
  width: '100%',
  height: '6px',
  backgroundColor: alpha(ARTEMIS_COLORS.background, 0.7),
  borderRadius: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${value}%`,
    background: color,
    borderRadius: theme.spacing(1),
    transition: 'width 0.5s ease-in-out',
  }
}));

// Durum göstergesi
const StatusIndicator = styled(Box)<{ status: 'active' | 'maintenance' | 'idle' }>(
  ({ status }) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 
      status === 'active' ? ARTEMIS_COLORS.success :
      status === 'maintenance' ? ARTEMIS_COLORS.warning :
      ARTEMIS_COLORS.error,
    boxShadow: `0 0 10px ${
      status === 'active' ? ARTEMIS_COLORS.success :
      status === 'maintenance' ? ARTEMIS_COLORS.warning :
      ARTEMIS_COLORS.error
    }`,
    display: 'inline-block',
    marginRight: '8px'
  })
);

// 3D Araç Görsel Konteynerı
const CarImageContainer = styled(Box)(({ theme }) => ({
  height: '140px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1, 0, 3),
  transform: 'translateZ(30px)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    width: '80%',
    height: '20px',
    background: `radial-gradient(ellipse at center, ${alpha(ARTEMIS_COLORS.primaryDark, 0.3)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: -1,
  }
}));

// Cam görünümlü harita konteynerı
const MapContainer = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: 0,
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
  height: '500px', // Belirli bir yükseklik değeri
  minHeight: '400px',
  width: '100%', // Genişlik ekleyin
  overflow: 'hidden',
  position: 'relative',
}));

// Araç bilgi detay penceresi
const VehicleDetailPanel = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.6)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.2)}`,
  height: '100%',
  width: '400px',
  overflow: 'auto',
  position: 'relative',
}));

// Filtreleme panel bileşeni
const FilterPanel = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.background, 0.9)}, 
    ${alpha(ARTEMIS_COLORS.background, 0.7)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}));

// Araç bilgi elementi
const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(ARTEMIS_COLORS.background, 0.5),
  marginBottom: theme.spacing(1.5),
}));

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'idle'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ YENİ

  const handleRouteAnalysis = (vehicleId: string) => {
    navigate(`/route-analysis?vehicleId=${vehicleId}`);
  };

// ✅ YENİ: useRef ile interval kontrolü
const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const isInitialLoadRef = useRef(true);

  // Araçları TNB Mobile API'sinden çekme
  const fetchVehicles = useCallback(async (isBackgroundRefresh = false) => {
    try {
      // İlk yükleme değilse ve arka plan yenilemesi ise loading'i gösterme
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);
      
      // TNB Mobile API'sinden araçları çek
      const vehiclesData = await vehicleService.getAllVehicles();
      
      setVehicles(vehiclesData as unknown as Vehicle[]);
      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (err) {
      console.error('❌ Araçlar yüklenirken hata:', err);
      
      // Sadece ilk yüklemede hata göster
      if (!isBackgroundRefresh) {
        setError('Araçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  // Sayfa yüklendiğinde araçları çek
  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchVehicles(false); // İlk yükleme
      isInitialLoadRef.current = false;
    }
    
    // Otomatik yenileme setup
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchVehicles(true); // arka plan yenilemesi
      }, 30000);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, fetchVehicles]);

  // Filtreleme işlemi
  useEffect(() => {
    let result = vehicles;
    
    // Arama filtresi
    if (searchTerm) {
      result = result.filter(
        vehicle => 
          vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      result = result.filter(vehicle => vehicle.status === statusFilter);
    }
    
    setFilteredVehicles(result);
  }, [searchTerm, vehicles, statusFilter]);

  // Araç detay görüntüleme
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailOpen(true);
  };

  // Menü kontrolü
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Detay panelini kapat
  const handleDetailClose = () => {
    setDetailOpen(false);
  };

  // Verileri yenile
  const handleRefresh = useCallback(() => {
    fetchVehicles(false); // Manuel yenileme, loading göster
  }, [fetchVehicles]);

  // Otomatik yenileme durumunu değiştir
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(!autoRefresh);
  }, [autoRefresh]);

  // Durum sayaçlarını hesapla
  const countsByStatus = {
    active: filteredVehicles.filter(v => v.status === 'active').length,
    maintenance: filteredVehicles.filter(v => v.status === 'maintenance').length,
    idle: filteredVehicles.filter(v => v.status === 'idle').length,
    total: filteredVehicles.length
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(135deg, 
          ${ARTEMIS_COLORS.background}, 
          ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <CssBaseline />
      
      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: 4, 
          pb: 8
        }}
      >
        {/* Başlık ve Kontrol Paneli */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: -10,
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, 
              ${ARTEMIS_COLORS.primary}, 
              ${alpha(ARTEMIS_COLORS.secondary, 0.5)},
              transparent)`,
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  borderRadius: '15px',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: 2,
                  background: `linear-gradient(135deg, 
                    ${ARTEMIS_COLORS.primary}, 
                    ${ARTEMIS_COLORS.secondary})`,
                  boxShadow: `0 10px 20px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 25, color: 'white' }} />
              </Box>
              
              <Typography 
                variant="h4"
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(90deg, 
                    ${ARTEMIS_COLORS.primary}, 
                    ${ARTEMIS_COLORS.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 4px 10px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`
                }}
              >
                Araç Takibi
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge 
                badgeContent={2} 
                color="error"
                sx={{ mr: 2 }}
              >
                <IconButton 
                  sx={{ 
                    background: alpha(ARTEMIS_COLORS.primary, 0.1),
                    '&:hover': {
                      background: alpha(ARTEMIS_COLORS.primary, 0.2),
                    },
                  }}
                >
                  <NotificationsIcon sx={{ color: ARTEMIS_COLORS.primary }} />
                </IconButton>
              </Badge>
              
              <Button 
                variant="contained"
                startIcon={<AddCircleIcon />}
                sx={{ 
                  background: `linear-gradient(135deg, 
                    ${ARTEMIS_COLORS.primary}, 
                    ${ARTEMIS_COLORS.secondary})`,
                  borderRadius: 2,
                  boxShadow: `0 5px 15px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, 
                      ${ARTEMIS_COLORS.primaryLight}, 
                      ${ARTEMIS_COLORS.secondaryLight})`,
                  }
                }}
              >
                Yeni Araç Ekle
              </Button>
            </Box>
          </Box>
          
          {/* Filtreler ve Arama */}
          <FilterPanel>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
              <TextField
                size="small"
                placeholder="Araç, sürücü veya plaka ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: ARTEMIS_COLORS.textLight }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(ARTEMIS_COLORS.cardBg, 0.7),
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary
                    }
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="Tümü" 
                  onClick={() => setStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                  sx={{ 
                    fontWeight: statusFilter === 'all' ? 'bold' : 'normal',
                    borderRadius: 2
                  }}
                />
                <Chip 
                  label="Aktif" 
                  onClick={() => setStatusFilter('active')}
                  color={statusFilter === 'active' ? 'success' : 'default'}
                  variant={statusFilter === 'active' ? 'filled' : 'outlined'}
                  sx={{ 
                    fontWeight: statusFilter === 'active' ? 'bold' : 'normal',
                    borderRadius: 2
                  }}
                />
                <Chip 
                  label="Bakımda" 
                  onClick={() => setStatusFilter('maintenance')}
                  color={statusFilter === 'maintenance' ? 'warning' : 'default'}
                  variant={statusFilter === 'maintenance' ? 'filled' : 'outlined'}
                  sx={{ 
                    fontWeight: statusFilter === 'maintenance' ? 'bold' : 'normal',
                    borderRadius: 2
                  }}
                />
                <Chip 
                  label="Boşta" 
                  onClick={() => setStatusFilter('idle')}
                  color={statusFilter === 'idle' ? 'error' : 'default'}
                  variant={statusFilter === 'idle' ? 'filled' : 'outlined'}
                  sx={{ 
                    fontWeight: statusFilter === 'idle' ? 'bold' : 'normal',
                    borderRadius: 2
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Grid Görünümü">
              <span>
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  sx={{ 
                    backgroundColor: viewMode === 'grid' ? alpha(ARTEMIS_COLORS.primary, 0.1) : 'transparent',
                    color: viewMode === 'grid' ? ARTEMIS_COLORS.primary : ARTEMIS_COLORS.textLight
                  }}
                >
                  <ListIcon />
                </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Harita Görünümü">
              <span>
                <IconButton 
                  onClick={() => setViewMode('map')}
                  sx={{ 
                    backgroundColor: viewMode === 'map' ? alpha(ARTEMIS_COLORS.primary, 0.1) : 'transparent',
                    color: viewMode === 'map' ? ARTEMIS_COLORS.primary : ARTEMIS_COLORS.textLight
                  }}
                >
                  <MapIcon />
                </IconButton>
                </span>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 1 }} />
              
              <Tooltip title={autoRefresh ? "Otomatik Yenileme Açık" : "Otomatik Yenileme Kapalı"}>
              <span>
                <IconButton 
                  onClick={toggleAutoRefresh}
                  color={autoRefresh ? "success" : "default"}
                  sx={{ 
                    backgroundColor: autoRefresh ? alpha(ARTEMIS_COLORS.success, 0.1) : 'transparent',
                  }}
                >
                  <RefreshIcon />
                </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Yenile">
              <span>
                <IconButton 
                  onClick={handleRefresh}
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    animation: (loading || isRefreshing) ? 'spin 1.5s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Daha Fazla">
              <span>
                <IconButton onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
                </span>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <PieChartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Araç İstatistikleri" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <BuildIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Bakım Programı" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Ayarlar" />
                </MenuItem>
              </Menu>
            </Box>
          </FilterPanel>
  
          {lastUpdated && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight, fontStyle: 'italic' }}>
                Son güncelleme: {lastUpdated}
              </Typography>
            </Box>
          )}
          
          {/* İstatistik Özeti Karları */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(ARTEMIS_COLORS.success, 0.15)}, 
                    ${alpha(ARTEMIS_COLORS.success, 0.05)})`,
                  backdropFilter: 'blur(5px)',
                  border: `1px solid ${alpha(ARTEMIS_COLORS.success, 0.2)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>Aktif Araçlar</Typography>
                  <Typography variant="h4" fontWeight="bold" color={ARTEMIS_COLORS.success}>{countsByStatus.active}</Typography>
                </Box>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: alpha(ARTEMIS_COLORS.success, 0.8),
                    filter: `drop-shadow(0 4px 6px ${alpha(ARTEMIS_COLORS.success, 0.4)})`
                  }} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(ARTEMIS_COLORS.warning, 0.15)}, 
                    ${alpha(ARTEMIS_COLORS.warning, 0.05)})`,
                  backdropFilter: 'blur(5px)',
                  border: `1px solid ${alpha(ARTEMIS_COLORS.warning, 0.2)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>Bakımdaki Araçlar</Typography>
                  <Typography variant="h4" fontWeight="bold" color={ARTEMIS_COLORS.warning}>{countsByStatus.maintenance}</Typography>
                </Box>
                <BuildIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: alpha(ARTEMIS_COLORS.warning, 0.8),
                    filter: `drop-shadow(0 4px 6px ${alpha(ARTEMIS_COLORS.warning, 0.4)})`
                  }} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(ARTEMIS_COLORS.error, 0.15)}, 
                    ${alpha(ARTEMIS_COLORS.error, 0.05)})`,
                  backdropFilter: 'blur(5px)',
                  border: `1px solid ${alpha(ARTEMIS_COLORS.error, 0.2)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>Boştaki Araçlar</Typography>
                  <Typography variant="h4" fontWeight="bold" color={ARTEMIS_COLORS.error}>{countsByStatus.idle}</Typography>
                </Box>
                <ErrorIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: alpha(ARTEMIS_COLORS.error, 0.8),
                    filter: `drop-shadow(0 4px 6px ${alpha(ARTEMIS_COLORS.error, 0.4)})`
                  }} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(ARTEMIS_COLORS.primary, 0.15)}, 
                    ${alpha(ARTEMIS_COLORS.primary, 0.05)})`,
                  backdropFilter: 'blur(5px)',
                  border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.2)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>Toplam Araç</Typography>
                  <Typography variant="h4" fontWeight="bold" color={ARTEMIS_COLORS.primary}>{countsByStatus.total}</Typography>
                </Box>
                <DirectionsCarIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: alpha(ARTEMIS_COLORS.primary, 0.8),
                    filter: `drop-shadow(0 4px 6px ${alpha(ARTEMIS_COLORS.primary, 0.4)})`
                  }} 
                />
              </Box>
            </Grid>
          </Grid>
  
          {/* Hata durumunu göster */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
          
          {/* Araç Listesi veya Harita Görünümü */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress sx={{ color: ARTEMIS_COLORS.primary }} />
            </Box>
          ) : viewMode === 'grid' ? (
            // Grid Görünümü
            <Grid container spacing={3}>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                    <VehicleCard onClick={() => handleVehicleClick(vehicle)}>
                      {/* Araç Durumu */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatusIndicator status={vehicle.status} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 
                                vehicle.status === 'active' ? ARTEMIS_COLORS.success : 
                                vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning : 
                                ARTEMIS_COLORS.error,
                              fontWeight: 500
                            }}
                          >
                            {vehicle.status === 'active' ? 'Aktif' : 
                            vehicle.status === 'maintenance' ? 'Bakımda' : 'Boşta'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={vehicle.plate} 
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            fontWeight: 'bold',
                            backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                            color: ARTEMIS_COLORS.primary,
                            border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
                          }}
                        />
                      </Box>
                      
                      {/* Araç Resmi */}
                      <CarImageContainer>
                        <Box
                          component="img"
                          src={vehicle.imageUrl}
                          alt={vehicle.model}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: 'translateZ(20px) rotateY(0deg)',
                            transition: 'transform 0.5s ease',
                            filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
                            '&:hover': {
                              transform: 'translateZ(30px) rotateY(10deg)',
                            }
                          }}
                        />
                      </CarImageContainer>
                      
                      {/* Araç Modeli */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          textAlign: 'center', 
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        {vehicle.model}
                      </Typography>
                      
                      {/* Sürücü Bilgisi */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: alpha(ARTEMIS_COLORS.background, 0.5),
                          p: 1.5,
                          borderRadius: 1,
                          mb: 2
                        }}
                      >
                        <PersonIcon sx={{ color: ARTEMIS_COLORS.primary, mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {vehicle.driver || 'Atanmamış'}
                        </Typography>
                      </Box>
                      
                      {/* Yakıt ve Kilometre Bilgisi */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
                            Yakıt Seviyesi
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            %{vehicle.fuelLevel}
                          </Typography>
                        </Box>
                        <VehicleGauge 
                          value={vehicle.fuelLevel} 
                          color={
                            vehicle.fuelLevel > 60 ? ARTEMIS_COLORS.success :
                            vehicle.fuelLevel > 25 ? ARTEMIS_COLORS.warning :
                            ARTEMIS_COLORS.error
                          } 
                        />
                      </Box>
                      
                      {/* Lokasyon Bilgisi */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: alpha(ARTEMIS_COLORS.background, 0.3),
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon sx={{ color: ARTEMIS_COLORS.primary, mr: 0.5, fontSize: 18 }} />
                          <Typography variant="caption">
                            {vehicle.location}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${vehicle.speed} km/s`}
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: alpha(
                              vehicle.status === 'active' ? ARTEMIS_COLORS.primary : ARTEMIS_COLORS.textLight, 
                              0.1
                            ),
                            color: vehicle.status === 'active' ? ARTEMIS_COLORS.primary : ARTEMIS_COLORS.textLight,
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Tooltip title="Rota Analizi">
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteAnalysis(vehicle.id);
                            }}
                            sx={{
                              color: ARTEMIS_COLORS.accent,
                              backgroundColor: alpha(ARTEMIS_COLORS.accent, 0.1),
                              transform: 'translateZ(10px)',
                              '&:hover': {
                                backgroundColor: alpha(ARTEMIS_COLORS.accent, 0.2),
                              }
                            }}
                          >
                            <RouteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Detaylı Görüntüle">
                        <span>
                          <IconButton 
                            size="small" 
                            sx={{
                              color: ARTEMIS_COLORS.primary,
                              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                              transform: 'translateZ(10px)',
                              '&:hover': {
                                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2),
                              }
                            }}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    </VehicleCard>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color={ARTEMIS_COLORS.textLight}>
                      {searchTerm || statusFilter !== 'all' ? 
                        'Arama kriterlerine uygun araç bulunamadı.' : 
                        'Hiç araç bulunamadı.'}
                    </Typography>
                    {searchTerm || statusFilter !== 'all' ? (
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        sx={{ mt: 2 }}
                      >
                        Filtreleri Temizle
                      </Button>
                    ) : null}
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            // Harita Görünümü
            <>
              {/* Durum göstergeleri - Container dışında sağ üste */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography variant="h6" sx={{ color: ARTEMIS_COLORS.text, fontWeight: 600 }}>
                  Araç Lokasyonları
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 4,
                    marginLeft: 'auto'
                  }}
                ></Box>
                <Chip 
                  icon={<StatusIndicator status="active" />} 
                  label="Aktif" 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ARTEMIS_COLORS.success, 0.1),
                    color: ARTEMIS_COLORS.success,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.success, 0.3)}`,
                    marginRight: 2
                  }}
                />
                <Chip 
                  icon={<StatusIndicator status="maintenance" />} 
                  label="Bakımda" 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ARTEMIS_COLORS.warning, 0.1),
                    color: ARTEMIS_COLORS.warning,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.warning, 0.3)}`,
                    marginRight: 2
                  }}
                />
                <Chip 
                  icon={<StatusIndicator status="idle" />} 
                  label="Boşta" 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ARTEMIS_COLORS.error, 0.1),
                    color: ARTEMIS_COLORS.error,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.error, 0.3)}`,
                  }}
                />
              </Box>
              <MapContainer>
                <Box sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Map
                    initialViewState={{
                      longitude: 29.0335,
                      latitude: 41.0082,
                      zoom: 11,
                      pitch: 45,
                      bearing: 0
                    }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '8px',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                  >
                    {/* 3D binaları etkinleştirme */}
                    <Source
                      id="mapbox-dem"
                      type="raster-dem"
                      url="mapbox://mapbox.mapbox-terrain-dem-v1"
                      tileSize={512}
                      maxzoom={14}
                    />
                    {/* 3D binalar için katman ekle */}
                    <Layer
                      id="3d-buildings"
                      source="composite"
                      source-layer="building"
                      filter={['==', 'extrude', 'true']}
                      type="fill-extrusion"
                      minzoom={15}
                      paint={{
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.6
                      }}
                    />
                    
                    {/* Navigasyon kontrolleri */}
                    <NavigationControl position="top-right" />
                    
                    {/* Tam ekran kontrolü */}
                    <FullscreenControl position="top-right" />
                    
                    {/* Geolocator - kullanıcının konumunu gösterme */}
                    <GeolocateControl
                      position="top-right"
                      positionOptions={{ enableHighAccuracy: true }}
                      trackUserLocation={true}
                    />
                    
                    {/* Ölçek çubuğu */}
                    <ScaleControl position="bottom-right" />
                    
                    {/* Araç markerları */}
                    {filteredVehicles.map((vehicle) => (
                      <Marker
                        key={vehicle.id}
                        longitude={vehicle.lng}
                        latitude={vehicle.lat}
                        anchor="bottom"
                        onClick={() => handleVehicleClick(vehicle)}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: alpha(
                              vehicle.status === 'active' ? ARTEMIS_COLORS.success :
                              vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                              ARTEMIS_COLORS.error,
                              0.3
                            ),
                            border: `3px solid ${
                              vehicle.status === 'active' ? ARTEMIS_COLORS.success :
                              vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                              ARTEMIS_COLORS.error
                            }`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            boxShadow: `0 0 20px ${alpha(
                              vehicle.status === 'active' ? ARTEMIS_COLORS.success :
                              vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                              ARTEMIS_COLORS.error,
                              0.6
                            )}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.3) translateY(-5px)',
                              boxShadow: `0 10px 25px ${alpha(
                                vehicle.status === 'active' ? ARTEMIS_COLORS.success :
                                vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                                ARTEMIS_COLORS.error,
                                0.8
                              )}`,
                            },
                            animation: vehicle.status === 'active' ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                              '0%': { boxShadow: `0 0 0 0 ${alpha(ARTEMIS_COLORS.success, 0.7)}` },
                              '70%': { boxShadow: `0 0 0 10px ${alpha(ARTEMIS_COLORS.success, 0)}` },
                              '100%': { boxShadow: `0 0 0 0 ${alpha(ARTEMIS_COLORS.success, 0)}` }
                            }
                          }}
                        >
                          <DirectionsCarIcon 
                            sx={{ 
                              color: 
                                vehicle.status === 'active' ? ARTEMIS_COLORS.success :
                                vehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                                ARTEMIS_COLORS.error,
                              fontSize: 22,
                              filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.3))`
                            }} 
                          />
                        </Box>
                      </Marker>
                    ))}
                  </Map>
                </Box>
              </MapContainer>
            </>
          )}
          
          {/* Araç Detay Çekmecesi */}
          <Drawer
            anchor="right"
            open={detailOpen}
            onClose={handleDetailClose}
            PaperProps={{
              sx: {width: { xs: '100%', sm: 400 },
              background: `linear-gradient(135deg, 
                ${alpha(ARTEMIS_COLORS.background, 0.9)}, 
                ${alpha(ARTEMIS_COLORS.background, 0.8)})`,
              backdropFilter: 'blur(20px)',
              pt: 2
            }
          }}
        >
          {selectedVehicle && (
            <VehicleDetailPanel>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Araç Detayları</Typography>
                <IconButton onClick={handleDetailClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box
                sx={{
                  position: 'relative',
                  height: 150,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3,
                  background: `linear-gradient(180deg, 
                    ${alpha(ARTEMIS_COLORS.primary, 0.1)}, 
                    ${alpha(ARTEMIS_COLORS.secondary, 0.05)})`,
                  borderRadius: 2
                }}
              >
                <Box
                  component="img"
                  src={selectedVehicle.imageUrl}
                  alt={selectedVehicle.model}
                  sx={{
                    maxWidth: '80%',
                    maxHeight: '80%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
                  }}
                />
                <Chip 
                  label={selectedVehicle.plate} 
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontWeight: 'bold',
                    backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2),
                    color: ARTEMIS_COLORS.primary,
                    borderRadius: 1
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                  {selectedVehicle.model}
                </Typography>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: alpha(
                      selectedVehicle.status === 'active' ? ARTEMIS_COLORS.success :
                      selectedVehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                      ARTEMIS_COLORS.error,
                      0.1
                    ),
                    color: 
                      selectedVehicle.status === 'active' ? ARTEMIS_COLORS.success :
                      selectedVehicle.status === 'maintenance' ? ARTEMIS_COLORS.warning :
                      ARTEMIS_COLORS.error,
                  }}
                >
                  <StatusIndicator status={selectedVehicle.status} />
                  <Typography variant="body2" fontWeight="medium">
                    {selectedVehicle.status === 'active' ? 'Aktif' : 
                    selectedVehicle.status === 'maintenance' ? 'Bakımda' : 'Boşta'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" sx={{ color: ARTEMIS_COLORS.primary, mb: 2, fontWeight: 600 }}>
                Temel Bilgiler
              </Typography>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Sürücü</Typography>
                </Box>
                <Typography variant="body2" fontWeight="500">{selectedVehicle.driver || 'Atanmamış'}</Typography>
              </InfoItem>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Konum</Typography>
                </Box>
                <Typography variant="body2" fontWeight="500">{selectedVehicle.location}</Typography>
              </InfoItem>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Hız</Typography>
                </Box>
                <Typography variant="body2" fontWeight="500">{selectedVehicle.speed} km/s</Typography>
              </InfoItem>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsCarIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Kilometre</Typography>
                </Box>
                <Typography variant="body2" fontWeight="500">{selectedVehicle.mileage.toLocaleString()} km</Typography>
              </InfoItem>
              
              <Typography variant="subtitle2" sx={{ color: ARTEMIS_COLORS.primary, mt: 3, mb: 2, fontWeight: 600 }}>
                Yakıt Durumu
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalGasStationIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                    <Typography variant="body2">Yakıt Seviyesi</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    color={
                      selectedVehicle.fuelLevel > 60 ? ARTEMIS_COLORS.success :
                      selectedVehicle.fuelLevel > 25 ? ARTEMIS_COLORS.warning :
                      ARTEMIS_COLORS.error
                    }
                  >
                    %{selectedVehicle.fuelLevel}
                  </Typography>
                </Box>
                <VehicleGauge 
                  value={selectedVehicle.fuelLevel} 
                  color={
                    selectedVehicle.fuelLevel > 60 ? ARTEMIS_COLORS.success :
                    selectedVehicle.fuelLevel > 25 ? ARTEMIS_COLORS.warning :
                    ARTEMIS_COLORS.error
                  } 
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ color: ARTEMIS_COLORS.primary, mt: 3, mb: 2, fontWeight: 600 }}>
                Bakım Bilgileri
              </Typography>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BuildIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Son Bakım</Typography>
                </Box>
                <Typography variant="body2" fontWeight="500">{selectedVehicle.lastMaintenance}</Typography>
              </InfoItem>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BuildIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Sonraki Bakım</Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  color={ARTEMIS_COLORS.warning}
                >
                  {selectedVehicle.nextMaintenance}
                </Typography>
              </InfoItem>
              
              <InfoItem>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsCarIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.primary, mr: 1 }} />
                  <Typography variant="body2">Kontak Durumu</Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  color={selectedVehicle.ignition ? ARTEMIS_COLORS.success : ARTEMIS_COLORS.error}
                >
                  {selectedVehicle.ignition ? 'Açık' : 'Kapalı'}
                </Typography>
              </InfoItem>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<BuildIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Bakım Planla
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LocationOnIcon />}
                  sx={{ 
                    borderRadius: 2,
                    background: `linear-gradient(135deg, 
                      ${ARTEMIS_COLORS.primary}, 
                      ${ARTEMIS_COLORS.secondary})`,
                  }}
                >
                  Rotayı Görüntüle
                </Button>
              </Box>
            </VehicleDetailPanel>
          )}
        </Drawer>

        {/* Bildirim Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default VehiclesPage;