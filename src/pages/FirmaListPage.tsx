import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

// Artemis renk paleti
const ARTEMIS_COLORS = {
    primary: '#0050A0',
    primaryLight: '#3378B5',
    primaryDark: '#00376F',
    secondary: '#00B4D8',
    secondaryLight: '#47DBFD',
    secondaryDark: '#0089A7',
    accent: '#7ED957',
    accentLight: '#A5E989',
    accentDark: '#59A834',
    warning: '#FF9500',
    error: '#FF3B30',
    success: '#34C759',
    background: '#F0F4F8',
    cardBg: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    border: '#E0E7EF'
};

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${ARTEMIS_COLORS.background}, ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.95)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 4px 12px ${alpha(ARTEMIS_COLORS.primary, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  marginBottom: theme.spacing(1),
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 6px 20px ${alpha(ARTEMIS_COLORS.primary, 0.15)}`,
  }
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.95)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 8px 20px ${alpha(ARTEMIS_COLORS.primary, 0.1)}`,
  height: '100%'
}));

const FilterBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(ARTEMIS_COLORS.cardBg, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.3)}`
}));

// StatChipProps interface'ini StatChip tanımından önce tanımla:
interface StatChipProps {
  chipVariant?: 'success' | 'warning' | 'error' | 'info';
}

// StatChip component'ini şu şekilde değiştir:
const StatChip = styled(Chip)<StatChipProps>(({ chipVariant = 'info' }) => {
  const getColorForVariant = (variant: 'success' | 'warning' | 'error' | 'info'): string => {
    switch (variant) {
      case 'success': return ARTEMIS_COLORS.success;
      case 'warning': return ARTEMIS_COLORS.warning;
      case 'error': return ARTEMIS_COLORS.error;
      case 'info': return ARTEMIS_COLORS.secondary;
      default: return ARTEMIS_COLORS.secondary;
    }
  };
  
  const color = getColorForVariant(chipVariant);
  
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    fontSize: '0.75rem',
    '& .MuiChip-icon': {
      color: color
    }
  };
});

interface Firma {
  company_id: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  son_form_tarihi?: string;
  form_sayisi?: number;
  son_servis_teknisyen?: string;
  ortalama_puan?: number;
  talep_sayisi?: number;
  aktif_talep_sayisi?: number;
}

interface MonthlyStats {
  month: string;
  year: number;
  totalForms: number;
  totalRequests: number;
  averageRating: number;
  topCompanies: Array<{
    company_name: string;
    form_count: number;
  }>;
}

const FirmaListPage: React.FC = () => {
  const navigate = useNavigate();
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('company_name');
  const [filterBy, setFilterBy] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Firma verilerini çekme
  const fetchFirmalar = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<Firma[]>('/firmalar');
      setFirmalar(response);
      setError(null);
    } catch (err: any) {
      console.error('Firma listesi hatası:', err);
      setError('Firma listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Aylık istatistikleri çekme
  const fetchMonthlyStats = async () => {
    try {
      const response = await apiService.get<MonthlyStats>(`/monthly-stats/${selectedYear}/${selectedMonth}`);
      setMonthlyStats(response);
    } catch (err: any) {
      console.error('Aylık istatistik hatası:', err);
      // Mock data for demonstration
      setMonthlyStats({
        month: new Date(selectedYear, selectedMonth - 1).toLocaleDateString('tr-TR', { month: 'long' }),
        year: selectedYear,
        totalForms: firmalar.reduce((sum, f) => sum + (f.form_sayisi || 0), 0),
        totalRequests: firmalar.reduce((sum, f) => sum + (f.talep_sayisi || 0), 0),
        averageRating: firmalar.reduce((sum, f) => sum + (f.ortalama_puan || 0), 0) / firmalar.length,
        topCompanies: firmalar
          .sort((a, b) => (b.form_sayisi || 0) - (a.form_sayisi || 0))
          .slice(0, 5)
          .map(f => ({ company_name: f.company_name, form_count: f.form_sayisi || 0 }))
      });
    }
  };

  useEffect(() => {
    fetchFirmalar();
  }, []);

  useEffect(() => {
    if (firmalar.length > 0) {
      fetchMonthlyStats();
    }
  }, [selectedMonth, selectedYear, firmalar]);

  // Kartı aç/kapat
  const toggleCard = (companyId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCards(newExpanded);
  };

  // Filtreleme ve sıralama
  const filteredFirmalar = firmalar
    .filter(firma => {
      const matchesSearch = firma.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           firma.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'active') return matchesSearch && firma.form_sayisi && firma.form_sayisi > 0;
      if (filterBy === 'inactive') return matchesSearch && (!firma.form_sayisi || firma.form_sayisi === 0);
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'company_name':
          return a.company_name.localeCompare(b.company_name);
        case 'form_sayisi':
          return (b.form_sayisi || 0) - (a.form_sayisi || 0);
        case 'son_form_tarihi':
          return new Date(b.son_form_tarihi || 0).getTime() - new Date(a.son_form_tarihi || 0).getTime();
        default:
          return 0;
      }
    });

  // Firma detayına git
  const handleFirmaClick = (companyId: string) => {
    navigate(`/firma-detay/${companyId}`);
  };

  // Tarih formatla
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hiç form yok';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <PageContainer>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={50} sx={{ color: ARTEMIS_COLORS.primary }} />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Başlık */}
        <Box mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
            <IconButton
              onClick={handleBackToDashboard}
              sx={{
                mr: 2,
                backgroundColor: `${ARTEMIS_COLORS.primary}15`,
                border: `1px solid ${ARTEMIS_COLORS.primary}30`,
                '&:hover': {
                  backgroundColor: `${ARTEMIS_COLORS.primary}25`,
                  transform: 'translateX(-2px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowBackIcon sx={{ color: ARTEMIS_COLORS.primary }} />
            </IconButton>
            
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(90deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Firma Yönetimi
              </Typography>
              <Typography variant="subtitle1" color={ARTEMIS_COLORS.textLight}>
                Müşteri firmalarınızı yönetin ve performanslarını takip edin
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hata mesajı */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filtre Çubuğu */}
        <FilterBar>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sırala</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sırala"
                >
                  <MenuItem value="company_name">Firma Adı</MenuItem>
                  <MenuItem value="form_sayisi">Form Sayısı</MenuItem>
                  <MenuItem value="son_form_tarihi">Son Form Tarihi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrele</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  label="Filtrele"
                >
                  <MenuItem value="all">Tüm Firmalar</MenuItem>
                  <MenuItem value="active">Aktif Firmalar</MenuItem>
                  <MenuItem value="inactive">Pasif Firmalar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ay</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  label="Ay"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleDateString('tr-TR', { month: 'short' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchFirmalar}
                sx={{ 
                  borderColor: ARTEMIS_COLORS.primary,
                  color: ARTEMIS_COLORS.primary,
                  '&:hover': {
                    borderColor: ARTEMIS_COLORS.primaryDark,
                    backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
                  }
                }}
              >
                Yenile
              </Button>
            </Grid>
          </Grid>
        </FilterBar>

        <Grid container spacing={3}>
          {/* Sol Taraf - Firma Listesi */}
          <Grid item xs={12} lg={8}>
            <Box>
              {filteredFirmalar.map((firma) => (
                <CompactCard key={firma.company_id}>
                  {/* Kapalı Kart Görünümü */}
                  <CardContent sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" flex={1}>
                        <Avatar 
                          sx={{ 
                            bgcolor: ARTEMIS_COLORS.primary, 
                            width: 40, 
                            height: 40,
                            mr: 2 
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                        
                        <Box flex={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ 
                              color: ARTEMIS_COLORS.text,
                              fontSize: '1.1rem',
                              mb: 0.5
                            }}
                          >
                            {firma.company_name}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={1}>
                          <StatChip 
                              size="small"
                              label={firma.form_sayisi && firma.form_sayisi > 0 ? 'Aktif' : 'Pasif'}
                              chipVariant={firma.form_sayisi && firma.form_sayisi > 0 ? 'success' : 'warning'}
                            />
                            
                            <StatChip 
                              size="small"
                              label={`${firma.form_sayisi || 0} Form`}
                              chipVariant="info"
                              icon={<AssignmentIcon />}
                            />
                            
                            {firma.ortalama_puan && (
                              <StatChip 
                                size="small"
                                label={`${firma.ortalama_puan.toFixed(1)}/5`}
                                chipVariant={firma.ortalama_puan >= 4 ? 'success' : firma.ortalama_puan >= 3 ? 'warning' : 'error'}
                                icon={<StarIcon />}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Detay Sayfası">
                          <IconButton 
                            onClick={() => handleFirmaClick(firma.company_id)}
                            sx={{ color: ARTEMIS_COLORS.primary }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <IconButton 
                          onClick={() => toggleCard(firma.company_id)}
                          sx={{ color: ARTEMIS_COLORS.textLight }}
                        >
                          {expandedCards.has(firma.company_id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Açık Kart İçeriği */}
                    <Collapse in={expandedCards.has(firma.company_id)}>
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color={ARTEMIS_COLORS.textLight} gutterBottom>
                            İletişim Bilgileri
                          </Typography>
                          
                          <Box mb={1}>
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <EmailIcon sx={{ fontSize: 16, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                              <Typography variant="body2" color={ARTEMIS_COLORS.text}>
                                {firma.email}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <PhoneIcon sx={{ fontSize: 16, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                              <Typography variant="body2" color={ARTEMIS_COLORS.text}>
                                {firma.phone_number}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center">
                              <LocationIcon sx={{ fontSize: 16, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                              <Typography 
                                variant="body2" 
                                color={ARTEMIS_COLORS.text}
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {firma.address}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color={ARTEMIS_COLORS.textLight} gutterBottom>
                            Servis Bilgileri
                          </Typography>
                          
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                                Son Form Tarihi:
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {formatDate(firma.son_form_tarihi)}
                              </Typography>
                            </Box>

                            {firma.son_servis_teknisyen && (
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                                  Son Teknisyen:
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {firma.son_servis_teknisyen}
                                </Typography>
                              </Box>
                            )}

                            {firma.talep_sayisi !== undefined && (
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                                  Toplam Talep:
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {firma.talep_sayisi} ({firma.aktif_talep_sayisi || 0} aktif)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Collapse>
                  </CardContent>
                </CompactCard>
              ))}

              {/* Firma bulunamadı mesajı */}
              {filteredFirmalar.length === 0 && !loading && (
                <Box textAlign="center" py={8}>
                  <BusinessIcon sx={{ fontSize: 80, color: ARTEMIS_COLORS.textLight, mb: 2 }} />
                  <Typography variant="h6" color={ARTEMIS_COLORS.textLight} mb={1}>
                    Firma bulunamadı
                  </Typography>
                  <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                    Arama kriterlerinizi değiştirerek tekrar deneyin
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Sağ Taraf - Yönetici Dashboard */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              {/* Genel İstatistikler */}
              <DashboardCard sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AnalyticsIcon sx={{ color: ARTEMIS_COLORS.primary, mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold" color={ARTEMIS_COLORS.primary}>
                      Genel İstatistikler
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={1}>
                        <Typography variant="h4" color={ARTEMIS_COLORS.primary} fontWeight="bold">
                          {firmalar.length}
                        </Typography>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Toplam Firma
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center" p={1}>
                        <Typography variant="h4" color={ARTEMIS_COLORS.success} fontWeight="bold">
                          {firmalar.filter(f => f.form_sayisi && f.form_sayisi > 0).length}
                        </Typography>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Aktif Firma
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box textAlign="center" p={1}>
                        <Typography variant="h4" color={ARTEMIS_COLORS.warning} fontWeight="bold">
                          {firmalar.reduce((total, f) => total + (f.form_sayisi || 0), 0)}
                        </Typography>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Toplam Form
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box textAlign="center" p={1}>
                        <Typography variant="h4" color={ARTEMIS_COLORS.secondary} fontWeight="bold">
                          {Math.round(firmalar.reduce((total, f) => total + (f.ortalama_puan || 0), 0) / firmalar.length * 10) / 10 || 0}
                        </Typography>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Ortalama Puan
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DashboardCard>

              {/* Aylık Performans */}
              {monthlyStats && (
                <DashboardCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <CalendarIcon sx={{ color: ARTEMIS_COLORS.secondary, mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color={ARTEMIS_COLORS.secondary}>
                        {monthlyStats.month} {monthlyStats.year} Performansı
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Toplam Form
                        </Typography>
                        <Typography variant="h6" color={ARTEMIS_COLORS.primary} fontWeight="bold">
                          {monthlyStats.totalForms}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Toplam Talep
                        </Typography>
                        <Typography variant="h6" color={ARTEMIS_COLORS.warning} fontWeight="bold">
                          {monthlyStats.totalRequests}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Ortalama Puan
                        </Typography>
                        <Typography variant="h6" color={ARTEMIS_COLORS.accent} fontWeight="bold">
                          {monthlyStats.averageRating.toFixed(1)}/5.0
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </DashboardCard>
              )}

              {/* En Aktif Firmalar */}
              {monthlyStats && monthlyStats.topCompanies.length > 0 && (
                <DashboardCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TrendingUpIcon sx={{ color: ARTEMIS_COLORS.accent, mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color={ARTEMIS_COLORS.accent}>
                        En Aktif Firmalar
                      </Typography>
                    </Box>
                    
                    <List dense>
                      {monthlyStats.topCompanies.map((company, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: index === 0 ? ARTEMIS_COLORS.accent : 
                                       index === 1 ? ARTEMIS_COLORS.secondary : 
                                       ARTEMIS_COLORS.warning,
                                fontSize: '0.75rem'
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: index < 3 ? 'bold' : 'normal',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {company.company_name}
                              </Typography>
                            }
                            secondary={`${company.form_count} form`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </DashboardCard>
              )}

              {/* Hızlı Aksiyonlar */}
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AssessmentIcon sx={{ color: ARTEMIS_COLORS.primary, mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold" color={ARTEMIS_COLORS.primary}>
                    Hızlı Aksiyonlar
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate('/raporlar')}
                        sx={{ 
                          mb: 1,
                          borderColor: ARTEMIS_COLORS.primary,
                          color: ARTEMIS_COLORS.primary,
                          '&:hover': {
                            backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
                          }
                        }}
                      >
                        Detaylı Raporlar
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<TimelineIcon />}
                        onClick={() => navigate('/analitics')}
                        sx={{ 
                          mb: 1,
                          borderColor: ARTEMIS_COLORS.secondary,
                          color: ARTEMIS_COLORS.secondary,
                          '&:hover': {
                            backgroundColor: alpha(ARTEMIS_COLORS.secondary, 0.1)
                          }
                        }}
                      >
                        Performans Analizi
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PersonIcon />}
                        onClick={() => navigate('/teknisyenler')}
                        sx={{ 
                          borderColor: ARTEMIS_COLORS.accent,
                          color: ARTEMIS_COLORS.accent,
                          '&:hover': {
                            backgroundColor: alpha(ARTEMIS_COLORS.accent, 0.1)
                          }
                        }}
                      >
                        Teknisyen Performansı
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </DashboardCard>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default FirmaListPage;