// artemis-admin/src/pages/ReportApprovalPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Badge
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import reportService, { PendingReport, ReportDetail, ReportStats } from '../services/reportService';

// Artemis renk paleti
const ARTEMIS_COLORS = {
  primary: '#0050A0',
  secondary: '#00B4D8',
  accent: '#7ED957',
  warning: '#FF9500',
  error: '#FF3B30',
  success: '#34C759',
  background: '#F0F4F8',
  cardBg: '#FFFFFF'
};

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: `0 8px 24px ${alpha(ARTEMIS_COLORS.primary, 0.15)}`,
  border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(ARTEMIS_COLORS.primary, 0.25)}`
  }
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontWeight: 600,
  borderRadius: '8px',
  backgroundColor: 
    status === 'onay_bekliyor' ? alpha(ARTEMIS_COLORS.warning, 0.1) :
    status === 'onaylandi' ? alpha(ARTEMIS_COLORS.success, 0.1) :
    status === 'reddedildi' ? alpha(ARTEMIS_COLORS.error, 0.1) :
    alpha(ARTEMIS_COLORS.warning, 0.1),
  color:
    status === 'onay_bekliyor' ? ARTEMIS_COLORS.warning :
    status === 'onaylandi' ? ARTEMIS_COLORS.success :
    status === 'reddedildi' ? ARTEMIS_COLORS.error :
    ARTEMIS_COLORS.warning,
  border: `1px solid ${
    status === 'onay_bekliyor' ? ARTEMIS_COLORS.warning :
    status === 'onaylandi' ? ARTEMIS_COLORS.success :
    status === 'reddedildi' ? ARTEMIS_COLORS.error :
    ARTEMIS_COLORS.warning
  }`
}));

const PriorityIndicator = styled('div')<{ priority: 'high' | 'medium' | 'low' }>(({ priority }) => ({
  width: '4px',
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
  backgroundColor: reportService.getPriorityColor(priority),
  borderRadius: '2px 0 0 2px'
}));

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PendingReport[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats>({
    onay_bekliyor: 0,
    onaylandi: 0,
    reddedildi: 0,
    revizyon_gerekli: 0,
    toplam: 0
  });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'onayla' | 'reddet' | 'revizyon_iste'>('onayla');
  const [actionComment, setActionComment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Tab labels and filters
  const tabFilters = [
    { label: 'Onay Bekliyor', value: 'onay_bekliyor', count: reportStats.onay_bekliyor },
    { label: 'Onaylandı', value: 'onaylandi', count: reportStats.onaylandi },
    { label: 'Reddedildi', value: 'reddedildi', count: reportStats.reddedildi },
    { label: 'Revizyon Gerekli', value: 'revizyon_gerekli', count: reportStats.revizyon_gerekli },
    { label: 'Tümü', value: 'all', count: reportStats.toplam }
  ];

  // Data loading
  useEffect(() => {
    loadData();
  }, []);

  // Filter reports based on selected tab and search
  useEffect(() => {
    filterReports();
  }, [reports, selectedTab, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, statsData] = await Promise.all([
        reportService.getAllReports(),
        reportService.getReportStats()
      ]);
      
      setReports(reportsData);
      setReportStats(statsData);
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Tab filtresi
    if (selectedTab < 4) { // "Tümü" seçili değilse
      const filterValue = tabFilters[selectedTab].value;
      filtered = filtered.filter(report => report.durum === filterValue);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.rapor_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.firma_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.qr_kod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleViewReport = async (reportId: number) => {
    try {
      setLoading(true);
      const reportDetail = await reportService.getReportDetail(reportId);
      setSelectedReport(reportDetail);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('❌ Rapor detayı yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (report: PendingReport, action: 'onayla' | 'reddet' | 'revizyon_iste') => {
    setSelectedReport(report as ReportDetail);
    setActionType(action);
    setActionComment('');
    setActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedReport) return;

    try {
      setProcessing(true);
      await reportService.approveReport(selectedReport.id, {
        islem: actionType,
        aciklama: actionComment
      });
      
      setActionModalOpen(false);
      setActionComment('');
      await loadData(); // Verileri yenile
    } catch (error) {
      console.error('❌ İşlem gerçekleştirilemedi:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return ARTEMIS_COLORS.success;
    if (rate >= 70) return ARTEMIS_COLORS.warning;
    return ARTEMIS_COLORS.error;
  };

  if (loading && reports.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
            <AssignmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Rapor Onay Sistemi
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 7 }}>
          Numune analiz raporlarını inceleyin ve onaylayın
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tabFilters.slice(0, 4).map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: reportService.getStatusColor(stat.value),
                  mb: 1 
                }}>
                  {stat.count}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Search and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rapor no, firma adı veya QR kod ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              sx={{ mr: 2 }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ backgroundColor: ARTEMIS_COLORS.primary }}
            >
              Rapor İndir
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          {tabFilters.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Badge badgeContent={tab.count} color="primary">
                  {tab.label}
                </Badge>
              }
            />
          ))}
        </Tabs>

        {/* Tab Panels */}
        {tabFilters.map((_, index) => (
          <TabPanel key={index} value={selectedTab} index={index}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              {filteredReports.map((report) => {
                const successRate = reportService.calculateSuccessRate(report);
                const priority = reportService.calculatePriority(report.hazirlanma_tarihi);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={report.id}>
                    <StyledCard sx={{ position: 'relative', height: '100%' }}>
                      <PriorityIndicator priority={priority} />
                      
                      <CardContent sx={{ pl: 3 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {report.rapor_no}
                          </Typography>
                          <StatusChip
                            label={reportService.getStatusText(report.durum)}
                            status={report.durum}
                            size="small"
                          />
                        </Box>

                        {/* Firma */}
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          {report.firma_adi || report.company_name}
                        </Typography>

                        {/* QR Kod */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          QR: {report.qr_kod}
                        </Typography>

                        {/* Test Stats */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Başarı Oranı</Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: getSuccessRateColor(successRate)
                              }}
                            >
                              %{successRate}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {report.uygun_test_sayisi}/{report.toplam_test_sayisi} test uygun
                          </Typography>
                        </Box>

                        {/* Tarih */}
                        <Typography variant="caption" color="text.secondary">
                          <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {reportService.formatDate(report.hazirlanma_tarihi)}
                        </Typography>

                        {report.red_nedeni && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="caption">
                              {report.red_nedeni}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewReport(report.id)}
                        >
                          İncele
                        </Button>
                        
                        {report.durum === 'onay_bekliyor' && (
                          <>
                            <Button
                              size="small"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleActionClick(report, 'onayla')}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleActionClick(report, 'reddet')}
                            >
                              Reddet
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </StyledCard>
                  </Grid>
                );
              })}
            </Grid>

            {filteredReports.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {searchTerm ? 'Arama kriterlerine uygun rapor bulunamadı' : 'Bu kategoride rapor bulunmuyor'}
                </Typography>
              </Box>
            )}
          </TabPanel>
        ))}
      </Paper>

      {/* Report Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Rapor Detayı: {selectedReport?.rapor_no}
            </Typography>
            <StatusChip
              label={selectedReport ? reportService.getStatusText(selectedReport.durum) : ''}
              status={selectedReport?.durum || ''}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Grid container spacing={3}>
              {/* Sol Panel - Rapor Bilgileri */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: 'fit-content' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Rapor Bilgileri
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">QR Kod</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedReport.qr_kod}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Firma</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedReport.firma_adi || selectedReport.company_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Alınan Yer</Typography>
                    <Typography variant="body1">
                      {selectedReport.alinan_yer || 'Belirtilmemiş'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Numune Alış Tarihi</Typography>
                    <Typography variant="body1">
                      {selectedReport.numune_alis_tarihi ? 
                        new Date(selectedReport.numune_alis_tarihi).toLocaleDateString('tr-TR') : 
                        'Belirtilmemiş'
                      }
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Hazırlayan</Typography>
                    <Typography variant="body1">
                      {selectedReport.hazirlayan_ad} {selectedReport.hazirlayan_soyad}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Hazırlanma Tarihi</Typography>
                    <Typography variant="body1">
                      {reportService.formatDate(selectedReport.hazirlanma_tarihi)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Sağ Panel - Test Sonuçları */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Test Sonuçları
                  </Typography>


                  {selectedReport.test_sonuclari && selectedReport.test_sonuclari.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Testler</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Birim</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Bulgu</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Limit Değer</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Metot</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedReport.test_sonuclari.map((test: any, index) => {
                            // Test durumunu kontrol et

                            return (
                              <TableRow 
                                key={index}
                                sx={{ 
                                  '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' },
                                  '&:hover': { backgroundColor: '#F5F5F5' }
                                }}
                              >
                                <TableCell sx={{ fontWeight: '500' }}>
                                  {test.testler || '-'}
                                </TableCell>
                                <TableCell>
                                  {test.birim || '-'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: '600' }}>
                                  {test.bulgu || '-'}
                                </TableCell>
                                <TableCell>
                                  {test.limit_deger || '-'}
                                </TableCell>
                                <TableCell>
                                  {test.metot || '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Bu rapor için test sonucu bulunamadı.
                    </Alert>
                  )}
                </Paper>

                {/* Red Nedeni (varsa) */}
                {selectedReport.red_nedeni && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Red Nedeni:
                    </Typography>
                    <Typography variant="body2">
                      {selectedReport.red_nedeni}
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selectedReport?.durum === 'onay_bekliyor' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleActionClick(selectedReport, 'onayla')}
                sx={{ mr: 1 }}
              >
                Onayla
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleActionClick(selectedReport, 'revizyon_iste')}
                sx={{ mr: 1 }}
              >
                Revizyon İste
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleActionClick(selectedReport, 'reddet')}
                sx={{ mr: 2 }}
              >
                Reddet
              </Button>
            </>
          )}
          <Button onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Modal */}
      <Dialog
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'onayla' ? 'Raporu Onayla' :
           actionType === 'reddet' ? 'Raporu Reddet' :
           'Revizyon İste'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder={
              actionType === 'onayla' ? 'Onay açıklaması (opsiyonel)' :
              actionType === 'reddet' ? 'Red nedeni' :
              'Revizyon talebi açıklaması'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionModalOpen(false)}>
            İptal
          </Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            disabled={processing}
            color={
              actionType === 'onayla' ? 'success' :
              actionType === 'reddet' ? 'error' : 'warning'
            }
          >
            {processing ? <CircularProgress size={20} /> : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportApprovalPage;