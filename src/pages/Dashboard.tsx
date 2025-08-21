//artemis-admin/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Grid,
  Box,
  IconButton,
  Tooltip,
  CssBaseline,
  Divider,
  CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AltRouteIcon from '@mui/icons-material/AltRoute';

import { 
  MailOutline as MailOutlineIcon, 
  People as PeopleIcon, 
  DirectionsCar as DirectionsCarIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  CloudQueue as CloudQueueIcon,
  DonutLarge as DonutLargeIcon,
  InsertChart as InsertChartIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import apiService, { QueueDetails } from '../services/apiService';
import reportService, { ReportStats } from '../services/reportService';
import DailyTaskManagement from '../components/DailyTaskManagement';

// Artemis logosu renklerini baz alan genişletilmiş renk paleti
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

// 3D efekti ve modern glassmorphism ile zenginleştirilmiş Dashboard Card
const DashboardCard = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
  transform: 'perspective(1000px)',
  transformStyle: 'preserve-3d',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: `linear-gradient(90deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.accent})`,
    borderRadius: '5px 5px 0 0',
  },
  '&:hover': {
    transform: 'perspective(1000px) rotateX(5deg) translateY(-10px)',
    boxShadow: `0 20px 40px ${alpha(ARTEMIS_COLORS.primaryDark, 0.25)}`,
  }
}));

const StatusIndicator = styled('div', {
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status: 'active' | 'waiting' | 'success' | 'error' }>(
  ({ status }) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 
      status === 'active' ? ARTEMIS_COLORS.primary :
      status === 'waiting' ? ARTEMIS_COLORS.warning :
      status === 'success' ? ARTEMIS_COLORS.success :
      ARTEMIS_COLORS.error,
    boxShadow: `0 0 10px ${
      status === 'active' ? ARTEMIS_COLORS.primary :
      status === 'waiting' ? ARTEMIS_COLORS.warning :
      status === 'success' ? ARTEMIS_COLORS.success :
      ARTEMIS_COLORS.error
    }`,
    marginRight: '8px'
  })
);

const IconContainer = styled(Box)(({ theme }) => ({
  borderRadius: '15px',
  width: '60px',
  height: '60px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  transform: 'translateZ(20px)',
  background: `linear-gradient(135deg, 
    ${ARTEMIS_COLORS.primary}, 
    ${ARTEMIS_COLORS.secondary})`,
  boxShadow: `0 10px 20px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
}));

const ValueDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: `linear-gradient(90deg, 
    ${ARTEMIS_COLORS.primary}, 
    ${ARTEMIS_COLORS.accent})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transform: 'translateZ(15px)',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  transform: 'translateZ(10px)',
  height: '150px',
  width: '100%',
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [updateAnimation, setUpdateAnimation] = useState(false);
  const [queueDetails, setQueueDetails] = useState<QueueDetails>({
    completed: [],
    failed: [],
    active: [],
    waiting: [],
    counts: {
      completed: 0,
      failed: 0,
      active: 0,
      waiting: 0
    }
  });
  const [reportStats, setReportStats] = useState<ReportStats>({
    onay_bekliyor: 0,
    onaylandi: 0,
    reddedildi: 0,
    revizyon_gerekli: 0,
    toplam: 0
  });
  const [firmaSayisi, setFirmaSayisi] = useState(0);

  // Mail kuyruk detaylarını çekme fonksiyonu

const fetchQueueDetails = async (showLoadingIndicator = true) => {
  if (showLoadingIndicator) {
    setLoading(true);
  }
  
  try {
    // Mevcut queue details
    const queueResponse = await apiService.get<QueueDetails>('/queue-details');
    setQueueDetails(queueResponse);
    
    // Yeni rapor istatistikleri  ← YENİ EKLENEN
    const reportStatsResponse = await reportService.getReportStats();
    setReportStats(reportStatsResponse);
    
    // Güncelleme animasyonu göster
    setTimeout(() => {
      setUpdateAnimation(true);
      setTimeout(() => setUpdateAnimation(false), 2000);
    }, 100);
  } catch (error) {
    console.error('Veriler alınamadı', error);
  } finally {
    if (showLoadingIndicator) {
      setLoading(false);
    }
  }
};

interface Company {
  company_id: string;
  company_name: string;
  email: string;
}

  // Sayfa yüklendiğinde veri çekme
  useEffect(() => {
    fetchQueueDetails();

    const fetchFirmaSayisi = async () => {
      try {
        const response = await apiService.get<Company[]>('/companies');
        setFirmaSayisi(response.length);
      } catch (error) {
        console.error('Firma sayısı alınamadı:', error);
      }
    };

    fetchFirmaSayisi();
    
    // Her 60 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchQueueDetails(false); // loading göstermeden yenile
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Animasyon stilleri için
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const dashboardItems = [
    {
      title: 'Mail Kuyruğu',
      icon: <MailOutlineIcon sx={{ fontSize: 30, color: 'white' }} />,
      value: queueDetails.counts.completed + queueDetails.counts.waiting + queueDetails.counts.active,
      label: 'Toplam Mail',
      trend: 'up',
      color: ARTEMIS_COLORS.primary,
      route: '/mail-queue',
      status: 'active' as const,
      chart: null,
      statText: `${queueDetails.counts.active} aktif, ${queueDetails.counts.waiting} bekliyor`
    },
    {
      title: 'Rapor Onayları',
      icon: <AssignmentIcon sx={{ fontSize: 30, color: 'white' }} />,
      value: reportStats.onay_bekliyor,
      label: 'Onay Bekliyor',
      trend: reportStats.onay_bekliyor > 0 ? 'up' : 'stable',
      color: ARTEMIS_COLORS.warning,
      route: '/report-approval',
      status: reportStats.onay_bekliyor > 0 ? 'waiting' as const : 'success' as const,
      chart: null,
      statText: `${reportStats.toplam} toplam, ${reportStats.onaylandi} onaylandı`
    },
    {
      title: 'Çalışanlar',
      icon: <PeopleIcon sx={{ fontSize: 30, color: 'white' }} />,
      value: 8,
      label: 'Toplam Çalışan',
      trend: 'up',
      color: ARTEMIS_COLORS.secondary,
      route: '/employees',
      status: 'success' as const,
      chart: null,
      statText: '7 aktif, 1 izinli'
    },
    {
      title: 'Firmalar',
      icon: <BusinessIcon sx={{ fontSize: 30, color: 'white' }} />,
      value: firmaSayisi, // Bu değer useEffect'te güncellenecek
      label: 'Toplam Firma',
      trend: 'up',
      color: ARTEMIS_COLORS.secondary,
      route: '/firmalar',
      status: 'success' as const,
      chart: null,
      statText: 'Aktif firmalar'
    },
    {
      title: 'Araç Takibi',
      icon: <DirectionsCarIcon sx={{ fontSize: 30, color: 'white' }} />,
      value: 14,
      label: 'Toplam Araç',
      trend: 'up',
      color: ARTEMIS_COLORS.accent,
      route: '/vehicles',
      status: 'waiting' as const,
      chart: null,
      statText: '4 kullanımda, 1 bakımda'
    }
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
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
      
      {/* Güncelleme bildirim animasyonu */}
      {updateAnimation && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            p: 1,
            borderRadius: 2,
            background: alpha(ARTEMIS_COLORS.success, 0.2),
            border: `1px solid ${alpha(ARTEMIS_COLORS.success, 0.5)}`,
            display: 'flex',
            alignItems: 'center',
            boxShadow: `0 4px 15px ${alpha(ARTEMIS_COLORS.success, 0.3)}`,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease',
            animation: 'fadeInOut 2s ease'
          }}
        >
          <CheckCircleIcon sx={{ color: ARTEMIS_COLORS.success, mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: ARTEMIS_COLORS.success }}>
            Veriler güncellendi
          </Typography>
        </Box>
      )}

      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: 5,
          pb: 8
        }}
      >
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              background: `linear-gradient(90deg, 
                ${ARTEMIS_COLORS.primary}, 
                ${ARTEMIS_COLORS.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              textShadow: `0 4px 10px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`
            }}
          >
            Artemis Kontrol Paneli
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: ARTEMIS_COLORS.textLight,
              maxWidth: '700px',
              margin: '0 auto'
            }}
          >
            Güncel sistemsel bilgilere hızlı erişim sağlayan akıllı yönetim arayüzü
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: ARTEMIS_COLORS.primary }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={4}>
              {dashboardItems.map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <DashboardCard 
                    onClick={() => handleCardClick(item.route)}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StatusIndicator status={item.status} />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: ARTEMIS_COLORS.text,
                            fontWeight: 600
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                      <Tooltip title="Detaylı Görüntüle">
                        <IconButton 
                          sx={{ 
                            background: alpha(ARTEMIS_COLORS.primary, 0.1),
                            '&:hover': {
                              background: alpha(ARTEMIS_COLORS.primary, 0.2),
                            },
                            transform: 'translateZ(25px)'
                          }}
                        >
                          <ArrowForwardIcon sx={{ color: ARTEMIS_COLORS.primary }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <IconContainer>
                      {item.icon}
                    </IconContainer>
                    
                    <ValueDisplay variant="h3">
                      {item.value}
                    </ValueDisplay>
                    
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: ARTEMIS_COLORS.textLight,
                        mb: 1
                      }}
                    >
                      {item.label}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        background: alpha(ARTEMIS_COLORS.background, 0.6),
                        p: 1,
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <TrendingUpIcon sx={{ 
                        color: ARTEMIS_COLORS.success, 
                        mr: 1,
                        fontSize: 18
                      }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: ARTEMIS_COLORS.textLight,
                          fontWeight: 500
                        }}
                      >
                        {item.statText}
                      </Typography>
                    </Box>
                    
                    {item.chart && (
                      <ChartContainer>
                        {item.chart}
                      </ChartContainer>
                    )}
                  </DashboardCard>
                </Grid>
              ))}
            </Grid>
            
            <Box 
              sx={{ 
                mt: 5,
                background: `linear-gradient(135deg, 
                  ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
                  ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                p: 3,
                boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
                border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: ARTEMIS_COLORS.text,
                }}
              >
                <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle', color: ARTEMIS_COLORS.primary }} />
                Günlük Görev Yönetimi
              </Typography>
              
              <DailyTaskManagement />
            </Box>
            
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    background: `linear-gradient(135deg, 
                      ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
                      ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    p: 3,
                    height: '100%',
                    boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      color: ARTEMIS_COLORS.text,
                    }}
                  >
                    <CloudQueueIcon sx={{ mr: 1, verticalAlign: 'middle', color: ARTEMIS_COLORS.secondary }} />
                    Sistem Durumu
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StatusIndicator status="success" />
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.text }}>
                      Tüm sistemler çalışıyor
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
                      CPU Kullanımı
                    </Typography>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.text, fontWeight: 600 }}>
                      24%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
                      Bellek Kullanımı
                    </Typography>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.text, fontWeight: 600 }}>
                      42%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.textLight }}>
                      Disk Kullanımı
                    </Typography>
                    <Typography variant="body2" sx={{ color: ARTEMIS_COLORS.text, fontWeight: 600 }}>
                      56%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box 
                  sx={{ 
                    background: `linear-gradient(135deg, 
                      ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
                      ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    p: 3,
                    height: '100%',
                    boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      color: ARTEMIS_COLORS.text,
                    }}
                  >
                    <DonutLargeIcon sx={{ mr: 1, verticalAlign: 'middle', color: ARTEMIS_COLORS.primary }} />
                    Hızlı Eylemler
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {[
                      { title: 'Mail Gönder', icon: <MailOutlineIcon />, color: ARTEMIS_COLORS.primary },
                      { title: 'Çalışan Ekle', icon: <PeopleIcon />, color: ARTEMIS_COLORS.success },
                      { title: 'Araç Ata', icon: <DirectionsCarIcon />, color: ARTEMIS_COLORS.secondary },
                      { title: 'Rapor Oluştur', icon: <InsertChartIcon />, color: ARTEMIS_COLORS.warning }
                    ].map((action, idx) => (
                      <Grid item xs={6} md={3} key={idx}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            background: alpha(action.color, 0.1),
                            border: `1px solid ${alpha(action.color, 0.2)}`,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: alpha(action.color, 0.2),
                            }
                          }}
                        >
                          <Box 
                            sx={{ 
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: alpha(action.color, 0.2),
                              margin: '0 auto 8px auto',
                            }}
                          >
                            <Box sx={{ color: action.color }}>
                              {action.icon}
                            </Box>
                          </Box>
                          <Typography variant="caption" sx={{ color: ARTEMIS_COLORS.text, fontWeight: 500 }}>
                            {action.title}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;