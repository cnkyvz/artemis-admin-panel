// src/pages/MailQueuePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Tooltip,
  Alert,
  Button,
  Card,
  IconButton,
  Divider,
  CssBaseline,
  alpha,
  Badge,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  MailOutline as MailOutlineIcon
} from '@mui/icons-material';
import apiService, { QueueDetails, JobDetails } from '../services/apiService';

// Artemis renk paleti
const ARTEMIS_COLORS = {
  primary: '#0050A0',      // Koyu mavi
  primaryLight: '#3378B5', // Açık koyu mavi
  primaryDark: '#00376F',  // Daha koyu mavi
  secondary: '#00B4D8',    // Açık mavi
  secondaryLight: '#47DBFD', // Daha açık mavi
  secondaryDark: '#0089A7', // Koyu açık mavi
  accent: '#7ED957',       // Yeşil
  accentLight: '#A5E989',  // Açık yeşil
  accentDark: '#59A834',   // Koyu yeşil
  warning: '#FF9500',      // Turuncu
  error: '#FF3B30',        // Kırmızı
  success: '#34C759',      // Koyu yeşil
  background: '#F0F4F8',   // Açık gri-mavi
  cardBg: '#FFFFFF',       // Kart arkaplan
  text: '#333333',         // Ana metin
  textLight: '#666666',    // Açık metin
  border: '#E0E7EF'        // Kenarlık
};

// Glassmorphism card bileşeni
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
    ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
  boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
  transition: 'all 0.3s ease',
  transform: 'perspective(1000px)',
  transformStyle: 'preserve-3d',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    boxShadow: `0 15px 35px ${alpha(ARTEMIS_COLORS.primaryDark, 0.2)}`,
    transform: 'perspective(1000px) translateY(-5px)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: `linear-gradient(90deg, ${ARTEMIS_COLORS.primary}, ${ARTEMIS_COLORS.accent})`,
    borderRadius: '5px 5px 0 0',
  }
}));

// 3D efekti ile zenginleştirilmiş chip
const EnhancedChip = styled(Chip)<{ statuscolor: string }>(({ theme, statuscolor }) => ({
  borderRadius: '20px',
  padding: theme.spacing(0.5, 0.5),
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(statuscolor, 0.5)}`,
  background: alpha(statuscolor, 0.1),
  backdropFilter: 'blur(5px)',
  '& .MuiChip-icon': {
    color: statuscolor,
  },
  '&:hover, &.active': {
    background: alpha(statuscolor, 0.2),
    boxShadow: `0 5px 15px ${alpha(statuscolor, 0.3)}`,
    transform: 'translateY(-3px)'
  },
  '&.active': {
    background: alpha(statuscolor, 0.3),
    fontWeight: 'bold'
  }
}));

// Stilize edilmiş tablo container
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: `0 8px 20px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`,
  border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.8)}`,
  background: `linear-gradient(135deg, 
    ${alpha('#FFFFFF', 0.95)}, 
    ${alpha('#F8FAFD', 0.9)})`,
  '& .MuiTableHead-root': {
    background: `linear-gradient(90deg, 
      ${alpha(ARTEMIS_COLORS.primary, 0.1)}, 
      ${alpha(ARTEMIS_COLORS.secondary, 0.05)})`,
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      background: alpha(ARTEMIS_COLORS.background, 0.7),
      transform: 'scale(1.001)'
    }
  },
  '& .MuiTableCell-head': {
    color: ARTEMIS_COLORS.primary,
    fontWeight: 600,
    borderBottom: `2px solid ${alpha(ARTEMIS_COLORS.primary, 0.2)}`
  },
  '& .MuiTableCell-body': {
    borderBottom: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`
  }
}));

// Başlık kutusu
const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2, 0),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, 
      ${ARTEMIS_COLORS.primary}, 
      ${alpha(ARTEMIS_COLORS.secondary, 0.5)},
      transparent)`,
  }
}));

// Stil eklenmiş buton
const GlassButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.primary, 0.1)}, 
    ${alpha(ARTEMIS_COLORS.primary, 0.05)})`,
  border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.2)}`,
  backdropFilter: 'blur(5px)',
  color: ARTEMIS_COLORS.primary,
  '&:hover': {
    background: `linear-gradient(135deg, 
      ${alpha(ARTEMIS_COLORS.primary, 0.15)}, 
      ${alpha(ARTEMIS_COLORS.primary, 0.1)})`,
    boxShadow: `0 5px 15px ${alpha(ARTEMIS_COLORS.primary, 0.2)}`,
    transform: 'translateY(-2px)'
  }
}));

// İkonlu bilgi çubuğu
const InfoBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  background: alpha(ARTEMIS_COLORS.background, 0.8),
  backdropFilter: 'blur(5px)',
  marginBottom: theme.spacing(1)
}));

// Durum ikonu bileşeni
const StatusIcon = ({ status }: { status: 'completed' | 'failed' | 'active' | 'waiting' }) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: ARTEMIS_COLORS.success }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: ARTEMIS_COLORS.error }} />;
      case 'active':
      case 'waiting':
        return <PendingIcon sx={{ color: status === 'active' ? ARTEMIS_COLORS.warning : ARTEMIS_COLORS.secondary }} />;
      default:
        return null;
    }
  };

  return getIcon();
};

const MailQueuePage: React.FC = () => {
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'completed' | 'failed' | 'active' | 'waiting' | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateAnimation, setUpdateAnimation] = useState(false);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

// MailQueuePage.tsx içinde - fetchQueueDetails fonksiyonu
// MailQueuePage.tsx içinde - fetchQueueDetails fonksiyonunu değiştirin
const fetchQueueDetails = useCallback(async (showLoadingIndicator = true) => {
  if (showLoadingIndicator) {
    setLoading(true);
  }
  setError(null);
  
  try {
    console.log('🔄 Mail kuyruğu verileri alınıyor...');
    const response = await apiService.get<QueueDetails>('/queue-details');
    
    // Önce API yanıtını log'a yazdırın
    console.log('📊 Ham API Yanıt:', JSON.stringify(response));
    
    // Sayıları log'a yazdırın
    console.log('📊 Tamamlanan:', response.counts.completed);
    console.log('📊 Başarısız:', response.counts.failed);
    console.log('📊 Aktif:', response.counts.active);
    console.log('📊 Bekleyen:', response.counts.waiting);
    console.log('📊 Toplam:', 
      response.counts.completed + 
      response.counts.failed + 
      response.counts.active + 
      response.counts.waiting
    );
    
    // API'den gelen yanıtı doğrudan kullan, override etme
    setQueueDetails(response); 
    setLastUpdate(new Date());
    
    // Yenileme animasyonu
    setUpdateAnimation(true);
    setTimeout(() => setUpdateAnimation(false), 1000);
  } catch (error: unknown) {
    console.error('❌ Kuyruk detayları alınamadı', error);
    const errorMessage = error instanceof Error ? error.message : 'Kuyruk verisi alınamadı';
    setError(errorMessage || 'Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  console.log('🔍 RENDER kontrolü - counts değerleri:', {
    completed: queueDetails.counts.completed,
    failed: queueDetails.counts.failed,
    active: queueDetails.counts.active,
    waiting: queueDetails.counts.waiting,
    total: queueDetails.counts.completed + queueDetails.counts.failed + queueDetails.counts.active + queueDetails.counts.waiting
  });
}, [queueDetails]);

  // Sayfa yüklendiğinde ve periyodik olarak veri çek
  useEffect(() => {
    fetchQueueDetails();
    
    // Her 15 saniyede bir güncelle (loading animasyonu olmadan)
    const interval = setInterval(() => {
      fetchQueueDetails(false); // loading göstermeden yenile
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchQueueDetails]);

  // İşleri tabloya render et
  const renderJobsTable = (jobs: JobDetails[], status: 'completed' | 'failed' | 'active' | 'waiting') => {
    if (jobs.length === 0) {
      return (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            background: alpha(ARTEMIS_COLORS.secondary, 0.1),
            border: `1px solid ${alpha(ARTEMIS_COLORS.secondary, 0.3)}`,
            '& .MuiAlert-icon': {
              color: ARTEMIS_COLORS.secondary
            }
          }}
        >
          Bu kategoride mail işi bulunmuyor.
        </Alert>
      );
    }
    
    return (
      <Fade in={true} timeout={500}>
        <Box>
          <InfoBar>
            <Typography variant="caption" sx={{ mr: 1, color: ARTEMIS_COLORS.textLight }}>
              Toplam: {jobs.length} kayıt
            </Typography>
            <IconButton size="small" sx={{ color: ARTEMIS_COLORS.primary }}>
              <FilterListIcon fontSize="small" />
            </IconButton>
          </InfoBar>
          
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>İş ID</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Konu</TableCell>
                  {status !== 'waiting' && <TableCell>Zaman</TableCell>}
                  {status === 'failed' && <TableCell>Hata Nedeni</TableCell>}
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 
                            status === 'completed' ? ARTEMIS_COLORS.success : 
                            status === 'failed' ? ARTEMIS_COLORS.error : 
                            status === 'active' ? ARTEMIS_COLORS.warning : 
                            ARTEMIS_COLORS.secondary,
                          mr: 1,
                          boxShadow: `0 0 5px ${alpha(
                            status === 'completed' ? ARTEMIS_COLORS.success : 
                            status === 'failed' ? ARTEMIS_COLORS.error : 
                            status === 'active' ? ARTEMIS_COLORS.warning : 
                            ARTEMIS_COLORS.secondary, 0.5)}`
                        }} />
                        <Typography variant="body2" fontFamily="monospace">
                          {job.id.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{job.data.to || 'Bilinmiyor'}</TableCell>
                    <TableCell>
                      <Tooltip title={job.data.subject || 'Konu yok'}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: 250,
                            fontWeight: 500
                          }}
                        >
                          {job.data.subject || 'Konu yok'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    {status !== 'waiting' && (
                      <TableCell>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          {job.timestamp 
                            ? new Date(job.timestamp).toLocaleString('tr-TR') 
                            : '-'}
                        </Typography>
                      </TableCell>
                    )}
                    {status === 'failed' && (
                      <TableCell>
                        <Tooltip title={job.failedReason || 'Bilinmeyen hata'}>
                          <Typography 
                            variant="body2" 
                            color="error" 
                            noWrap 
                            sx={{ 
                              maxWidth: 250,
                              fontStyle: 'italic'
                            }}
                          >
                            {job.failedReason || 'Bilinmeyen hata'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      </Fade>
    );
  };

  // Tam sayfa loading gösterimi
  if (loading && !queueDetails.completed.length) {
    return (
      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(135deg, 
          ${ARTEMIS_COLORS.background}, 
          ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`
      }}>
        <Box textAlign="center">
          <CircularProgress 
            size={60} 
            sx={{ 
              color: ARTEMIS_COLORS.primary,
              boxShadow: `0 0 30px ${alpha(ARTEMIS_COLORS.primary, 0.3)}`
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 2,
              color: ARTEMIS_COLORS.primary,
              fontWeight: 500
            }}
          >
            Mail Kuyruğu Yükleniyor...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Ana görünüm
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(135deg, 
          ${ARTEMIS_COLORS.background}, 
          ${alpha(ARTEMIS_COLORS.secondary, 0.1)})`,
        backgroundAttachment: 'fixed', // Arka planın sabit kalmasını sağlar
        position: 'relative',
        overflowX: 'hidden' // Yatay taşmayı engelle
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
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <MailOutlineIcon sx={{ fontSize: 25, color: 'white' }} />
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
              Mail Kuyruğu Yönetimi
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge 
              badgeContent={queueDetails.counts.failed} 
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
            
            <GlassButton 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => fetchQueueDetails()}
              disabled={loading}
            >
              Yenile
              {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
            </GlassButton>
          </Box>
        </HeaderBox>
        
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Fade in={updateAnimation}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: ARTEMIS_COLORS.success,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
              Veriler güncellendi!
            </Typography>
          </Fade>
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: ARTEMIS_COLORS.textLight,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              background: alpha(ARTEMIS_COLORS.error, 0.1),
              border: `1px solid ${alpha(ARTEMIS_COLORS.error, 0.3)}`,
            }}
            action={
              <Button 
                color="error" 
                size="small" 
                onClick={() => fetchQueueDetails()}
                sx={{ fontWeight: 'bold' }}
              >
                Tekrar Dene
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <GlassCard>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: ARTEMIS_COLORS.text,
                  pb: 1,
                  borderBottom: `2px solid ${alpha(ARTEMIS_COLORS.border, 0.8)}`
                }}
              >
                Mail İstatistikleri
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3, 
                  color: ARTEMIS_COLORS.textLight,
                  fontWeight: 500
                }}
              >
                Toplam {queueDetails.counts.completed + queueDetails.counts.failed + queueDetails.counts.active + queueDetails.counts.waiting} mail işi
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <EnhancedChip 
                  icon={<CheckCircleIcon />} 
                  label={`Tamamlanan: ${queueDetails.counts.completed}`} 
                  onClick={() => setExpandedSection(expandedSection === 'completed' ? null : 'completed')}
                  className={expandedSection === 'completed' ? 'active' : ''}
                  statuscolor={ARTEMIS_COLORS.success}
                />
                
                <EnhancedChip 
                  icon={<ErrorIcon />} 
                  label={`Başarısız: ${queueDetails.counts.failed}`} 
                  onClick={() => setExpandedSection(expandedSection === 'failed' ? null : 'failed')}
                  className={expandedSection === 'failed' ? 'active' : ''}
                  statuscolor={ARTEMIS_COLORS.error}
                />
                
                <EnhancedChip 
                  icon={<PendingIcon />} 
                  label={`Aktif: ${queueDetails.counts.active}`} 
                  onClick={() => setExpandedSection(expandedSection === 'active' ? null : 'active')}
                  className={expandedSection === 'active' ? 'active' : ''}
                  statuscolor={ARTEMIS_COLORS.warning}
                />
                
                <EnhancedChip 
                  icon={<PendingIcon />} 
                  label={`Bekleyen: ${queueDetails.counts.waiting}`} 
                  onClick={() => setExpandedSection(expandedSection === 'waiting' ? null : 'waiting')}
                  className={expandedSection === 'waiting' ? 'active' : ''}
                  statuscolor={ARTEMIS_COLORS.secondary}
                />
              </Box>
              
              <Box sx={{ 
                mt: 4, 
                p: 2, 
                borderRadius: 2,
                background: alpha(ARTEMIS_COLORS.background, 0.5),
                border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.8)}`,
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: ARTEMIS_COLORS.textLight,
                    display: 'block',
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  Detayları görmek için bir kategori seçin
                </Typography>
              </Box>
            </GlassCard>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <GlassCard>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3
              }}>
                {expandedSection && (
                  <IconButton 
                    onClick={() => setExpandedSection(null)}
                    sx={{ 
                      mr: 1,
                      color: ARTEMIS_COLORS.primary,
                      background: alpha(ARTEMIS_COLORS.background, 0.5),
                      '&:hover': {
                        background: alpha(ARTEMIS_COLORS.background, 0.8),
                      }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: ARTEMIS_COLORS.text,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <StatusIcon status={expandedSection || 'waiting'} />
                  <Box component="span" sx={{ ml: 1 }}>
                    {expandedSection 
                      ? `${expandedSection === 'completed' ? 'Tamamlanan' : 
                        expandedSection === 'failed' ? 'Başarısız' : 
                        expandedSection === 'active' ? 'Aktif' : 'Bekleyen'} Mail İşleri` 
                      : 'Mail İş Listesi'}
                  </Box>
                </Typography>
                
                {expandedSection && (
                  <Chip 
                    label={`${expandedSection === 'completed' 
                      ? queueDetails.counts.completed 
                      : expandedSection === 'failed' 
                        ? queueDetails.counts.failed 
                        : expandedSection === 'active' 
                          ? queueDetails.counts.active 
                          : queueDetails.counts.waiting} kayıt`}
                    size="small"
                    sx={{ 
                      background: alpha(
                        expandedSection === 'completed' ? ARTEMIS_COLORS.success : 
                        expandedSection === 'failed' ? ARTEMIS_COLORS.error : 
                        expandedSection === 'active' ? ARTEMIS_COLORS.warning : 
                        ARTEMIS_COLORS.secondary, 0.1),
                      color: 
                        expandedSection === 'completed' ? ARTEMIS_COLORS.success : 
                        expandedSection === 'failed' ? ARTEMIS_COLORS.error : 
                        expandedSection === 'active' ? ARTEMIS_COLORS.warning : 
                        ARTEMIS_COLORS.secondary,
                      border: `1px solid ${alpha(
                        expandedSection === 'completed' ? ARTEMIS_COLORS.success : 
                        expandedSection === 'failed' ? ARTEMIS_COLORS.error : 
                        expandedSection === 'active' ? ARTEMIS_COLORS.warning : 
                        ARTEMIS_COLORS.secondary, 0.3)}`
                    }}
                  />
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {expandedSection === null && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                    border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
                    color: ARTEMIS_COLORS.primaryDark,
                    '& .MuiAlert-icon': {
                      color: ARTEMIS_COLORS.primary
                    }
                  }}
                >
                  Detayları görmek için sol panelden bir kategori seçin.
                </Alert>
              )}
              
              {expandedSection === 'failed' && renderJobsTable(queueDetails.failed, 'failed')}
              {expandedSection === 'active' && renderJobsTable(queueDetails.active, 'active')}
              {expandedSection === 'waiting' && renderJobsTable(queueDetails.waiting, 'waiting')}
              {expandedSection === 'completed' && renderJobsTable(queueDetails.completed, 'completed')}
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MailQueuePage;