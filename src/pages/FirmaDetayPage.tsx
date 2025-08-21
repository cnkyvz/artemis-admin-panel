//artemis-admin/src/pages/FirmaDetayPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Rating,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Build as BuildIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';

// Artemis renk paleti
const ARTEMIS_COLORS = {
  primary: '#0050A0',
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${ARTEMIS_COLORS.background}, ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.95)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 8px 20px ${alpha(ARTEMIS_COLORS.primary, 0.1)}`,
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, ${alpha(ARTEMIS_COLORS.cardBg, 0.7)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.3)}`,
  boxShadow: `0 4px 15px ${alpha(ARTEMIS_COLORS.primary, 0.1)}`,
}));

interface FirmaDetay {
  company_id: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
}

interface ServisFormu {
  id: string;
  seri_no: string;
  tarih: string;
  calisan_ad: string;
  calisan_soyad: string;
  aciklamalar: string;
  puan?: number;
  yorum?: string;
}

interface TalepFormu {
  id: string;
  seri_no: string;
  tarih: string;
  aciklamalar: string;
  durum: string;
  teknisyen_cevap?: string;
  cevap_tarihi?: string;
}

interface Degerlendirme {
  id: string;
  puan: number;
  yorum: string;
  tarih: string;
  calisan_ad: string;
  calisan_soyad: string;
  servis_tarihi: string;
}

const FirmaDetayPage: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Veri state'leri
  const [firmaDetay, setFirmaDetay] = useState<FirmaDetay | null>(null);
  const [servisFormlari, setServisFormlari] = useState<ServisFormu[]>([]);
  const [talepFormlari, setTalepFormlari] = useState<TalepFormu[]>([]);
  const [degerlendirmeler, setDegerlendirmeler] = useState<Degerlendirme[]>([]);

  // Veri çekme fonksiyonları
  const fetchFirmaDetay = async () => {
    try {
      const response = await apiService.get<FirmaDetay>(`/firma/${companyId}`);
      setFirmaDetay(response);
    } catch (err: any) {
      console.error('Firma detay hatası:', err);
      setError('Firma bilgileri alınamadı');
    }
  };

  const fetchServisFormlari = async () => {
    try {
      const response = await apiService.get<ServisFormu[]>(`/firma-bakim-gecmisi/${companyId}`);
      setServisFormlari(response);
    } catch (err: any) {
      console.error('Servis formları hatası:', err);
    }
  };

  const fetchTalepFormlari = async () => {
    try {
      const response = await apiService.get<TalepFormu[]>(`/talep-formlari/${companyId}`);
      setTalepFormlari(response);
    } catch (err: any) {
      console.error('Talep formları hatası:', err);
    }
  };

  const fetchDegerlendirmeler = async () => {
    try {
      // Bu endpoint'i backend'de oluşturmanız gerekecek
      const response = await apiService.get<Degerlendirme[]>(`/firma-degerlendirmeleri/${companyId}`);
      setDegerlendirmeler(response);
    } catch (err: any) {
      console.error('Değerlendirmeler hatası:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
          fetchFirmaDetay(),
          fetchServisFormlari(),
          fetchTalepFormlari(),
          fetchDegerlendirmeler()
        ]);
        setLoading(false);
      };
      
      fetchAllData();
    }
  }, [companyId]);

  // Filtrelenmiş veriler
  const filteredServisFormlari = servisFormlari.filter(form => {
    const formDate = new Date(form.tarih);
    return formDate.getMonth() + 1 === selectedMonth && formDate.getFullYear() === selectedYear;
  });

  const filteredTalepFormlari = talepFormlari.filter(talep => {
    const talepDate = new Date(talep.tarih);
    return talepDate.getMonth() + 1 === selectedMonth && talepDate.getFullYear() === selectedYear;
  });

  // İstatistikler
  const ortalamaPuan = degerlendirmeler.length > 0 
    ? degerlendirmeler.reduce((sum, deg) => sum + deg.puan, 0) / degerlendirmeler.length 
    : 0;

  const bekleyenTalepSayisi = talepFormlari.filter(t => t.durum === 'bekliyor').length;
  const cevaplananTalepSayisi = talepFormlari.filter(t => t.durum === 'cevaplandi').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'bekliyor': return 'warning';
      case 'cevaplandi': return 'success';
      default: return 'default';
    }
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

  if (error || !firmaDetay) {
    return (
      <PageContainer>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Firma bulunamadı'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/firmalar')}
            variant="outlined"
          >
            Geri Dön
          </Button>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Başlık ve Geri Butonu */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/firmalar')}
            sx={{ mr: 2, color: ARTEMIS_COLORS.primary }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                color: ARTEMIS_COLORS.primary,
                mb: 0.5
              }}
            >
              {firmaDetay.company_name}
            </Typography>
            <Typography variant="subtitle1" color={ARTEMIS_COLORS.textLight}>
              Firma Detay Bilgileri ve Performans Analizi
            </Typography>
          </Box>
        </Box>

        {/* Firma Bilgi Kartı */}
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: ARTEMIS_COLORS.primary, 
                      width: 60, 
                      height: 60,
                      mr: 2 
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color={ARTEMIS_COLORS.text}>
                      {firmaDetay.company_name}
                    </Typography>
                    <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                      Müşteri Firma
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                      <Typography variant="body2">{firmaDetay.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <PhoneIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                      <Typography variant="body2">{firmaDetay.phone_number}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ fontSize: 20, color: ARTEMIS_COLORS.textLight, mr: 1 }} />
                      <Typography variant="body2">{firmaDetay.address}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <StatCard>
                      <Typography variant="h4" color={ARTEMIS_COLORS.primary} fontWeight="bold">
                        {servisFormlari.length}
                      </Typography>
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Toplam Servis
                      </Typography>
                    </StatCard>
                  </Grid>
                  <Grid item xs={6}>
                    <StatCard>
                      <Rating 
                        value={ortalamaPuan} 
                        readOnly 
                        precision={0.1}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                        Ortalama Puan
                      </Typography>
                    </StatCard>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Ay/Yıl Filtreleme */}
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ay</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    label="Ay"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleDateString('tr-TR', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    label="Yıl"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <MenuItem key={2024 - i} value={2024 - i}>
                        {2024 - i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" color={ARTEMIS_COLORS.primary}>
                  {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('tr-TR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })} Dönemi
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Tab Menüsü */}
        <StyledCard>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: ARTEMIS_COLORS.textLight,
                  '&.Mui-selected': {
                    color: ARTEMIS_COLORS.primary
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: ARTEMIS_COLORS.primary
                }
              }}
            >
              <Tab 
                label={`Servis Formları (${filteredServisFormlari.length})`}
                icon={<BuildIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Talep Formları (${filteredTalepFormlari.length})`}
                icon={<MessageIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Değerlendirmeler (${degerlendirmeler.length})`}
                icon={<StarIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Genel İstatistikler"
                icon={<AnalyticsIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Servis Formları Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Seri No</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Teknisyen</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Değerlendirme</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredServisFormlari.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {form.seri_no}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(form.tarih)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: ARTEMIS_COLORS.secondary }}>
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          {form.calisan_ad} {form.calisan_soyad}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {form.aciklamalar || 'Açıklama yok'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {form.puan ? (
                          <Box display="flex" alignItems="center">
                            <Rating value={form.puan} readOnly size="small" sx={{ mr: 1 }} />
                            <Typography variant="body2">({form.puan}/5)</Typography>
                          </Box>
                        ) : (
                          <Chip label="Değerlendirilmemiş" size="small" color="warning" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Form Detayı">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/bakim-formu-detay/${form.id}`)}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredServisFormlari.length === 0 && (
              <Box textAlign="center" py={4}>
                <BuildIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.textLight, mb: 2 }} />
                <Typography variant="h6" color={ARTEMIS_COLORS.textLight}>
                  Bu dönemde servis formu bulunmuyor
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Talep Formları Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant="h4" color={ARTEMIS_COLORS.warning} fontWeight="bold">
                      {bekleyenTalepSayisi}
                    </Typography>
                    <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                      Bekleyen Talep
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant="h4" color={ARTEMIS_COLORS.success} fontWeight="bold">
                      {cevaplananTalepSayisi}
                    </Typography>
                    <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                      Cevaplanan Talep
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Seri No</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Talep</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Cevap Tarihi</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTalepFormlari.map((talep) => (
                    <TableRow key={talep.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {talep.seri_no}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(talep.tarih)}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {talep.aciklamalar}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={talep.durum === 'bekliyor' ? 'Bekliyor' : 'Cevaplandı'}
                          color={getDurumColor(talep.durum) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {talep.cevap_tarihi ? formatDate(talep.cevap_tarihi) : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Talep Detayı">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/talep-detay/${talep.id}`)}
                          >
                            <MessageIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredTalepFormlari.length === 0 && (
              <Box textAlign="center" py={4}>
                <MessageIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.textLight, mb: 2 }} />
                <Typography variant="h6" color={ARTEMIS_COLORS.textLight}>
                  Bu dönemde talep formu bulunmuyor
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Değerlendirmeler Tab */}
          <TabPanel value={tabValue} index={2}>
            <List>
              {degerlendirmeler.map((deg) => (
                <ListItem key={deg.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: ARTEMIS_COLORS.accent }}>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {deg.calisan_ad} {deg.calisan_soyad}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Rating value={deg.puan} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            ({formatDate(deg.tarih)})
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          <strong>Servis Tarihi:</strong> {formatDate(deg.servis_tarihi)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {deg.yorum || 'Yorum yazılmamış'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {degerlendirmeler.length === 0 && (
              <Box textAlign="center" py={4}>
                <StarIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.textLight, mb: 2 }} />
                <Typography variant="h6" color={ARTEMIS_COLORS.textLight}>
                  Henüz değerlendirme bulunmuyor
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* İstatistikler Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" mb={2} color={ARTEMIS_COLORS.primary}>
                      Aylık Performans
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color={ARTEMIS_COLORS.success}>
                            {filteredServisFormlari.length}
                          </Typography>
                          <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                            Servis Sayısı
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color={ARTEMIS_COLORS.warning}>
                            {filteredTalepFormlari.length}
                          </Typography>
                          <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                            Talep Sayısı
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" mb={2} color={ARTEMIS_COLORS.primary}>
                      Genel İstatistikler
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color={ARTEMIS_COLORS.primary}>
                            {servisFormlari.length}
                          </Typography>
                          <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                            Toplam Servis
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color={ARTEMIS_COLORS.accent}>
                            {ortalamaPuan.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                            Ortalama Puan
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </TabPanel>
        </StyledCard>
      </Container>
    </PageContainer>
  );
};

export default FirmaDetayPage;