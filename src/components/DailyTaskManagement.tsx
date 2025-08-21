import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  Card,
  CardContent,
  IconButton,
  Divider,
  InputAdornment,
  Fade,
  Zoom,
  Avatar,
  Badge,
  Stack,
  Paper,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Group as GroupIcon, 
  Search as SearchIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  DirectionsCarOutlined as DirectionsCarIcon
} from '@mui/icons-material';

import { styled, alpha } from '@mui/material/styles';
import apiService from '../services/apiService';

// Modern Glass Effect Container
const GlassContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha('#ffffff', 0.1)}, 
    ${alpha('#ffffff', 0.05)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${alpha('#ffffff', 0.18)}`,
  boxShadow: `0 8px 32px ${alpha('#000000', 0.1)}`,
  padding: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}));

// Floating Action Bar
const FloatingActionBar = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: `linear-gradient(135deg, 
    ${alpha('#0050A0', 0.95)}, 
    ${alpha('#00B4D8', 0.95)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha('#ffffff', 0.2)}`
}));

// Modern Group Card
const ModernGroupCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'active'
  })<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: '320px',
  maxWidth: '320px',
  marginRight: theme.spacing(2),
  borderRadius: '20px',
  background: active 
    ? `linear-gradient(135deg, 
        ${alpha('#0050A0', 0.1)}, 
        ${alpha('#00B4D8', 0.05)})`
    : `linear-gradient(135deg, 
        ${alpha('#ffffff', 0.9)}, 
        ${alpha('#f8f9fa', 0.8)})`,
  border: active 
    ? `2px solid ${alpha('#0050A0', 0.3)}` 
    : `1px solid ${alpha('#e3f2fd', 0.5)}`,
  boxShadow: active
    ? `0 12px 40px ${alpha('#0050A0', 0.15)}`
    : `0 8px 24px ${alpha('#000000', 0.08)}`,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: active ? 'translateY(-8px) scale(1.02)' : 'none',
  '&:hover': {
    transform: active ? 'translateY(-12px) scale(1.02)' : 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha('#0050A0', 0.2)}`
  }
}));

// Selection Panel
const SelectionPanel = styled(GlassContainer)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(135deg, 
    ${alpha('#f8f9fa', 0.9)}, 
    ${alpha('#ffffff', 0.8)})`
}));

// Smart Chip with hover effects
const SmartChip = styled(Chip)<{ selected?: boolean }>(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: selected ? '#4caf50' : alpha('#f5f5f5', 0.8),
  color: selected ? 'white' : '#333',
  backdropFilter: 'blur(8px)',
  border: selected ? 'none' : `1px solid ${alpha('#ddd', 0.3)}`,
  '&:hover': {
    backgroundColor: selected ? '#45a049' : alpha('#e3f2fd', 0.8),
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: `0 8px 16px ${alpha('#000000', 0.15)}`
  }
}));

// Scrollable area with custom scrollbar
const ScrollableArea = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  paddingBottom: '16px',
  '&::-webkit-scrollbar': {
    height: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#f1f1f1', 0.5),
    borderRadius: '8px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: `linear-gradient(135deg, #0050A0, #00B4D8)`,
    borderRadius: '8px',
    '&:hover': {
      background: `linear-gradient(135deg, #003d7a, #0091a8)`
    }
  }
});

// Search Field with modern styling
const ModernSearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: alpha('#ffffff', 0.8),
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.9),
      transform: 'translateY(-1px)'
    },
    '&.Mui-focused': {
      backgroundColor: alpha('#ffffff', 0.95),
      boxShadow: `0 8px 24px ${alpha('#0050A0', 0.15)}`
    }
  }
}));

interface BackendTaskGroup {
  id: number;
  tarih: string;
  grup_adi: string;
  calisan_ids: string[];
  firma_ids: number[];
  arac_ids: string[]; // ✅ YENİ: Backend'den gelen araç ID'leri
  olusturma_tarihi: string;
  durum: string;
  olusturan_admin_id: number;
  calisan_adlari?: string[];
  firma_adlari?: string[];
}

interface Employee {
  personel_id: string;
  first_name: string;
  last_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

interface Vehicle {
  id: string;
  plaka: string;
  model: string;
  deviceId: string;
}

interface TaskGroup {
  id: string;
  name: string;
  selectedEmployees: string[];
  selectedCompanies: number[];
  selectedVehicles: string[]; // 🆕 YENİ
  status: 'new' | 'saved' | 'modified';
  backendId?: number;
  lastSaved?: Date;
}

const DailyTaskManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTodayTasks();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, compRes, vehicleRes] = await Promise.all([
        apiService.get<Employee[]>('/calisanlar'),
        apiService.get<Company[]>('/companies'),
        apiService.get<Vehicle[]>('/araclar') // 🆕 YENİ
      ]);
      console.log('🚗 Frontend: Araç verisi alındı:', vehicleRes); // ✅ DEBUG LOG
      console.log('🚗 Araç sayısı:', vehicleRes?.length || 0); // ✅ DEBUG LOG
      console.log('🚗 İlk araç:', vehicleRes?.[0]); // ✅ DEBUG LOG

      setEmployees(empRes);
      setCompanies(compRes);
      setVehicles(vehicleRes); // 🆕 YENİ
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await apiService.get<BackendTaskGroup[]>(`/gunluk-gorevler/${today}`); // ✅ DÜZELTME: Tip belirtildi
      
      const existingGroups: TaskGroup[] = result.map((task, index) => ({
        id: `group-${task.id}`,
        name: task.grup_adi || `Grup ${index + 1}`,
        selectedEmployees: task.calisan_ids || [],
        selectedCompanies: task.firma_ids || [],
        selectedVehicles: task.arac_ids || [], // ✅ DÜZELTME: Backend'den gelen araç ID'leri
        status: 'saved' as const, // ✅ DÜZELTME: as const eklendi
        backendId: task.id,
        lastSaved: new Date(task.olusturma_tarihi)
      }));
      
      setTaskGroups(existingGroups);
      if (existingGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(existingGroups[0].id);
      }
    } catch (error) {
      console.error('Görev yükleme hatası:', error);
    }
  };

  // ✅ GÜNCELLEME: addNewGroup - status='new' ile oluştur
  const addNewGroup = () => {
    const newGroup: TaskGroup = {
      id: `group-${Date.now()}`,
      name: `Grup ${taskGroups.length + 1}`,
      selectedEmployees: [],
      selectedCompanies: [],
      selectedVehicles: [], // 🆕 YENİ
      status: 'new',
      backendId: undefined,
      lastSaved: undefined
    };
    setTaskGroups([...taskGroups, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  // Araç seçim fonksiyonu
const toggleVehicleSelection = (vehicleId: string) => {
  if (!activeGroupId) return;
  
  setTaskGroups(groups => 
    groups.map(group => {
      if (group.id === activeGroupId) {
        const isSelected = group.selectedVehicles.includes(vehicleId);
        const newVehicles = isSelected 
          ? group.selectedVehicles.filter(id => id !== vehicleId)
          : [...group.selectedVehicles, vehicleId];
        
        return {
          ...group,
          selectedVehicles: newVehicles,
          status: group.status === 'saved' ? 'modified' : group.status
        };
      }
      return group;
    })
  );
};

  // ✅ GÜNCELLEME: deleteGroup - status kontrolü ile
  const deleteGroup = async (groupId: string) => {
    try {
      const group = taskGroups.find(g => g.id === groupId);
      
      // Sadece backend'de kaydedilmiş grupları backend'den sil
      if (group?.status === 'saved' && group.backendId) {
        await apiService.delete(`/gunluk-gorev/${group.backendId}`);
        console.log('✅ Grup backend\'den silindi:', group.backendId);
      }
      
      // Frontend state'ini güncelle
      setTaskGroups(taskGroups.filter(g => g.id !== groupId));
      
      // Aktif grup güncelleme
      if (activeGroupId === groupId) {
        const remainingGroups = taskGroups.filter(g => g.id !== groupId);
        setActiveGroupId(remainingGroups.length > 0 ? remainingGroups[0].id : null);
      }
      
      console.log('🗑️ Grup silindi:', groupId);
    } catch (error) {
      console.error('❌ Grup silme hatası:', error);
    }
  };

  // ✅ GÜNCELLEME: toggleEmployeeSelection - status='modified' yap
  const toggleEmployeeSelection = (employeeId: string) => {
    if (!activeGroupId) return;
    
    setTaskGroups(groups => 
      groups.map(group => {
        if (group.id === activeGroupId) {
          const isSelected = group.selectedEmployees.includes(employeeId);
          const newEmployees = isSelected 
            ? group.selectedEmployees.filter(id => id !== employeeId)
            : [...group.selectedEmployees, employeeId];
          
          return {
            ...group,
            selectedEmployees: newEmployees,
            // 🆕 Kaydedilmiş grup değiştirilirse 'modified' yap
            status: group.status === 'saved' ? 'modified' : group.status
          };
        }
        return group;
      })
    );
  };

  // ✅ GÜNCELLEME: toggleCompanySelection - status='modified' yap  
  const toggleCompanySelection = (companyId: number) => {
    if (!activeGroupId) return;
    
    setTaskGroups(groups => 
      groups.map(group => {
        if (group.id === activeGroupId) {
          const isSelected = group.selectedCompanies.includes(companyId);
          const newCompanies = isSelected 
            ? group.selectedCompanies.filter(id => id !== companyId)
            : [...group.selectedCompanies, companyId];
          
          return {
            ...group,
            selectedCompanies: newCompanies,
            // 🆕 Kaydedilmiş grup değiştirilirse 'modified' yap
            status: group.status === 'saved' ? 'modified' : group.status
          };
        }
        return group;
      })
    );
  };

  // ✅ YENİ: saveAllTasks - Sadece new/modified grupları kaydet
  const saveAllTasks = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const groupsToSave = taskGroups.filter(group => 
        (group.status === 'new' || group.status === 'modified') &&
        group.selectedEmployees.length > 0 && 
        group.selectedCompanies.length > 0
      );
      
      for (const group of groupsToSave) {
        try {
          if (group.status === 'new') {
            // ✅ DÜZELTME: Response tipini belirt
            const response = await apiService.post<{data: {id: number}}>('/gunluk-gorev-olustur', {
              tarih: today,
              grup_adi: group.name,
              calisan_ids: group.selectedEmployees,
              firma_ids: group.selectedCompanies,
              arac_ids: group.selectedVehicles // ✅ Bu artık hata vermeyecek
            });
            
            const responseData = response as any;
            const backendId = responseData?.data?.id || responseData?.id;
            
            setTaskGroups(prevGroups => 
              prevGroups.map(g => 
                g.id === group.id 
                  ? {
                      ...g,
                      status: 'saved' as const, // ✅ DÜZELTME: as const eklendi
                      backendId: backendId,
                      lastSaved: new Date()
                    }
                  : g
              )
            );
            
          } else if (group.status === 'modified' && group.backendId) {
            await apiService.put(`/gunluk-gorev/${group.backendId}`, {
              tarih: today,
              grup_adi: group.name,
              calisan_ids: group.selectedEmployees,
              firma_ids: group.selectedCompanies,
              arac_ids: group.selectedVehicles // ✅ Bu artık hata vermeyecek
            });
            
            setTaskGroups(prevGroups => 
              prevGroups.map(g => 
                g.id === group.id 
                  ? {
                      ...g,
                      status: 'saved' as const, // ✅ DÜZELTME: as const eklendi
                      lastSaved: new Date()
                    }
                  : g
              )
            );
          }
          
        } catch (groupError) {
          console.error(`❌ Grup kayıt hatası (${group.name}):`, groupError);
        }
      }
      
    } catch (error) {
      console.error('❌ Kaydetme genel hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  const unsavedChanges = taskGroups.filter(g => 
    g.status === 'new' || g.status === 'modified'
  ).length;

  // Filtreleme ve hesaplamalar
  const filteredEmployees = employees?.filter(emp => 
    emp?.first_name && emp?.last_name &&
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase())
  ) || [];
  
  const filteredCompanies = companies?.filter(comp => 
    comp?.company_name &&
    comp.company_name.toLowerCase().includes(companySearch.toLowerCase())
  ) || [];
  
const filteredVehicles = vehicles?.filter(vehicle => {
  // Null/undefined kontrolü
  if (!vehicle) return false;
  
  // Plaka kontrolü (sadece plaka, plate değil)
  const plaka = vehicle.plaka || '';
  const model = vehicle.model || '';
  
  // Arama terimi boşsa tüm araçları göster
  if (!vehicleSearch) return true;
  
  // Güvenli arama
  return plaka.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
         model.toLowerCase().includes(vehicleSearch.toLowerCase());
}) || [];

  const activeGroup = taskGroups.find(g => g.id === activeGroupId);
  const totalSelectedItems = activeGroup 
    ? activeGroup.selectedEmployees.length + activeGroup.selectedCompanies.length 
    : 0;

return (
    <Box sx={{ height: 'auto', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      {/* Floating Action Bar - güncellendi */}
      <FloatingActionBar elevation={8}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <GroupIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                Günlük Görev Yöneticisi
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {taskGroups.length} grup • {totalSelectedItems} seçim yapıldı
                {/* 🆕 Kaydedilmemiş değişiklik göstergesi */}
                {unsavedChanges > 0 && (
                  <> • <span style={{ color: '#ffeb3b' }}>{unsavedChanges} kaydedilmemiş</span></>
                )}
              </Typography>
            </Box>
          </Box>
          
          <ButtonGroup variant="contained" sx={{ gap: 1 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addNewGroup}
              sx={{
                borderRadius: '12px',
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Yeni Grup
            </Button>
            <Button
              startIcon={<SaveIcon />}
              onClick={saveAllTasks}
              disabled={saving || unsavedChanges === 0}
              sx={{
                borderRadius: '12px',
                bgcolor: saving ? 'rgba(255,255,255,0.1)' : 
                        unsavedChanges > 0 ? 'rgba(255,193,7,0.9)' : 'rgba(76,175,80,0.9)',
                '&:hover': { 
                  bgcolor: unsavedChanges > 0 ? 'rgba(255,193,7,1)' : 'rgba(76,175,80,1)' 
                }
              }}
            >
              {saving ? 'Kaydediliyor...' : 
               unsavedChanges > 0 ? `${unsavedChanges} Grubu Kaydet` : 'Hepsi Kaydedildi'}
            </Button>
          </ButtonGroup>
        </Stack>
      </FloatingActionBar>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Sol Panel: Grup Kartları */}
        <Grid item xs={12} lg={7}>
          <GlassContainer sx={{ height: '100%', p: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2, 
              color: '#0050A0', 
              fontWeight: 600,
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <GroupIcon />
              Gruplar ({taskGroups.length})
              <Chip 
                label={activeGroup ? `Aktif: ${activeGroup.name}` : 'Grup Seçilmedi'} 
                size="small" 
                color={activeGroup ? 'primary' : 'default'}
              />
            </Typography>
            
            {taskGroups.length === 0 ? (
              <Box sx={{ 
                height: '300px',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: `linear-gradient(135deg, 
                  ${alpha('#f8f9fa', 0.8)}, 
                  ${alpha('#e3f2fd', 0.4)})`,
                borderRadius: '16px',
                border: `2px dashed ${alpha('#0050A0', 0.2)}`
              }}>
                <Avatar sx={{ bgcolor: alpha('#0050A0', 0.1), mb: 2, width: 64, height: 64 }}>
                  <GroupIcon sx={{ fontSize: 32, color: '#0050A0' }} />
                </Avatar>
                <Typography variant="h6" sx={{ mb: 1, color: '#0050A0' }}>
                  Henüz Grup Yok
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Yeni Grup butonuna tıklayarak<br />ilk grubunuzu oluşturun
                </Typography>
              </Box>
            ) : (
              <ScrollableArea sx={{ height: '320px' }}>
                {taskGroups.map((group, index) => (
                  <Zoom in key={group.id} style={{ transitionDelay: `${index * 150}ms` }}>
                    <ModernGroupCard 
                      active={activeGroupId === group.id}
                      onClick={() => setActiveGroupId(group.id)}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        {/* Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: activeGroupId === group.id ? '#0050A0' : alpha('#0050A0', 0.1),
                              width: 32, 
                              height: 32 
                            }}>
                              <GroupIcon sx={{ 
                                fontSize: 18, 
                                color: activeGroupId === group.id ? 'white' : '#0050A0' 
                              }} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                color: activeGroupId === group.id ? '#0050A0' : '#333',
                                fontWeight: 600,
                                fontSize: '1.1rem'
                              }}>
                                {group.name}
                              </Typography>
                              {/* 🆕 Status badge */}
                              <Typography variant="caption" sx={{
                                color: group.status === 'new' ? '#ff9800' :
                                       group.status === 'modified' ? '#2196f3' : '#4caf50',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}>
                                {group.status === 'new' ? '🆕 Yeni' :
                                 group.status === 'modified' ? '✏️ Değiştirildi' : '✅ Kaydedildi'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Düzenle">
                              <IconButton size="small" sx={{ color: '#0050A0' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteGroup(group.id);
                                }}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Stats */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Badge badgeContent={group.selectedEmployees.length} color="primary">
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              bgcolor: alpha('#4caf50', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}>
                              <PersonIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                              <Typography variant="caption" color="#4caf50" fontWeight={600}>
                                Çalışanlar
                              </Typography>
                            </Box>
                          </Badge>
                          
                          <Badge badgeContent={group.selectedCompanies.length} color="secondary">
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              bgcolor: alpha('#ff9800', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}>
                              <BusinessIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                              <Typography variant="caption" color="#ff9800" fontWeight={600}>
                                Firmalar
                              </Typography>
                            </Box>
                          </Badge>

                            {/* 🆕 YENİ: Araç Badge */}
                            <Badge badgeContent={group.selectedVehicles.length} color="info">
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: 2, 
                                bgcolor: alpha('#9c27b0', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <DirectionsCarIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
                                <Typography variant="caption" color="#9c27b0" fontWeight={600}>
                                  Araçlar
                                </Typography>
                              </Box>
                            </Badge>
                        </Stack>

                        {/* Preview kısmına araç preview ekle */}
                        {group.selectedVehicles.length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                            {group.selectedVehicles.slice(0, 2).map((vehicleId) => {
                              const vehicle = vehicles.find(v => v.id === vehicleId);
                              return vehicle ? (
                                <Chip 
                                  key={vehicleId} 
                                  label={vehicle.plaka}
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha('#9c27b0', 0.1),
                                    color: '#9c27b0',
                                    fontWeight: 500
                                  }}
                                />
                              ) : null;
                            })}
                            {group.selectedVehicles.length > 2 && (
                              <Chip 
                                label={`+${group.selectedVehicles.length - 2} araç`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        )}

                        {/* Preview */}
                        <Box>
                          {group.selectedEmployees.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                              {group.selectedEmployees.slice(0, 2).map((empId) => {
                                const emp = employees.find(e => e.personel_id === empId);
                                return emp ? (
                                  <Chip 
                                    key={empId} 
                                    label={`${emp.first_name} ${emp.last_name}`}
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha('#4caf50', 0.1),
                                      color: '#4caf50',
                                      fontWeight: 500
                                    }}
                                  />
                                ) : null;
                              })}
                              {group.selectedEmployees.length > 2 && (
                                <Chip 
                                  label={`+${group.selectedEmployees.length - 2} daha`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          )}

                          {group.selectedCompanies.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                              {group.selectedCompanies.slice(0, 2).map((compId) => {
                                const comp = companies.find(c => c.company_id === compId);
                                return comp ? (
                                  <Chip 
                                    key={compId} 
                                    label={comp.company_name}
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha('#ff9800', 0.1),
                                      color: '#ff9800',
                                      fontWeight: 500
                                    }}
                                  />
                                ) : null;
                              })}
                              {group.selectedCompanies.length > 2 && (
                                <Chip 
                                  label={`+${group.selectedCompanies.length - 2} daha`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          )}
                        </Box>
                      </CardContent>
                    </ModernGroupCard>
                  </Zoom>
                ))}
              </ScrollableArea>
            )}
          </GlassContainer>
        </Grid>

        {/* Sağ Panel: Seçim Araçları */}
        <Grid item xs={12} lg={5}>
          {activeGroup ? (
            <Fade in timeout={600}>
              <SelectionPanel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#0050A0' }}>
                    <EditIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#0050A0', fontWeight: 600 }}>
                      {activeGroup.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Çalışan ve firma seçimlerinizi yapın
                    </Typography>
                  </Box>
                </Box>

                {/* Çalışanlar Seçimi */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    color: '#4caf50', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PersonIcon />
                    Çalışanlar ({activeGroup.selectedEmployees.length} seçili)
                  </Typography>
                  
                  <ModernSearchField
                    size="small"
                    placeholder="Çalışan adı yazın..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#4caf50' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Box sx={{ 
                    maxHeight: '140px', 
                    overflowY: 'auto',
                    p: 1,
                    border: `1px solid ${alpha('#4caf50', 0.2)}`,
                    borderRadius: '12px',
                    bgcolor: alpha('#4caf50', 0.02)
                  }}>
                    {filteredEmployees.map((emp) => (
                      <SmartChip
                        key={emp.personel_id}
                        icon={
                          activeGroup.selectedEmployees.includes(emp.personel_id) 
                            ? <CheckCircleIcon /> 
                            : <RadioButtonUncheckedIcon />
                        }
                        label={`${emp.first_name} ${emp.last_name}`}
                        selected={activeGroup.selectedEmployees.includes(emp.personel_id)}
                        onClick={() => toggleEmployeeSelection(emp.personel_id)}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 🆕 YENİ: Araçlar Seçimi */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    color: '#9c27b0', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <DirectionsCarIcon />
                    Araçlar ({activeGroup.selectedVehicles.length} seçili)
                  </Typography>
                  
                  <ModernSearchField
                    size="small"
                    placeholder="Araç plakası veya model yazın..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#9c27b0' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Box sx={{ 
                    maxHeight: '140px', 
                    overflowY: 'auto',
                    p: 1,
                    border: `1px solid ${alpha('#9c27b0', 0.2)}`,
                    borderRadius: '12px',
                    bgcolor: alpha('#9c27b0', 0.02)
                  }}>
                    {filteredVehicles.map((vehicle) => (
                      <SmartChip
                        key={vehicle.id}
                        icon={
                          activeGroup.selectedVehicles.includes(vehicle.id) 
                            ? <CheckCircleIcon /> 
                            : <RadioButtonUncheckedIcon />
                        }
                        label={`${vehicle.plaka} - ${vehicle.model}`}
                        selected={activeGroup.selectedVehicles.includes(vehicle.id)}
                        onClick={() => toggleVehicleSelection(vehicle.id)}
                        sx={{
                          backgroundColor: activeGroup.selectedVehicles.includes(vehicle.id) ? '#9c27b0' : alpha('#f5f5f5', 0.8),
                          color: activeGroup.selectedVehicles.includes(vehicle.id) ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: activeGroup.selectedVehicles.includes(vehicle.id) ? '#7b1fa2' : alpha('#e1bee7', 0.8),
                          }
                        }}
                      />
                    ))}
                    
                    {filteredVehicles.length === 0 && (
                      <Typography variant="body2" sx={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        py: 2 
                      }}>
                        {vehicleSearch ? 'Arama kriterine uygun araç bulunamadı' : 'Araç yükleniyor...'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Firmalar Seçimi */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    color: '#ff9800', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <BusinessIcon />
                    Firmalar ({activeGroup.selectedCompanies.length} seçili)
                  </Typography>
                  
                  <ModernSearchField
                    size="small"
                    placeholder="Firma adı yazın..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#ff9800' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Box sx={{ 
                    maxHeight: '140px', 
                    overflowY: 'auto',
                    p: 1,
                    border: `1px solid ${alpha('#ff9800', 0.2)}`,
                    borderRadius: '12px',
                    bgcolor: alpha('#ff9800', 0.02)
                  }}>
                    {filteredCompanies.map((comp) => (
                      <SmartChip
                        key={comp.company_id}
                        icon={
                          activeGroup.selectedCompanies.includes(comp.company_id) 
                            ? <CheckCircleIcon /> 
                            : <RadioButtonUncheckedIcon />
                        }
                        label={comp.company_name}
                        selected={activeGroup.selectedCompanies.includes(comp.company_id)}
                        onClick={() => toggleCompanySelection(comp.company_id)}
                      />
                    ))}
                  </Box>
                </Box>
              </SelectionPanel>
            </Fade>
          ) : (
            <SelectionPanel sx={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <Avatar sx={{ bgcolor: alpha('#0050A0', 0.1), mb: 2, width: 64, height: 64 }}>
                <GroupIcon sx={{ fontSize: 32, color: '#0050A0' }} />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, color: '#0050A0' }}>
                Grup Seçiniz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Düzenlemek için sol panelden<br />bir grup seçin veya yeni grup oluşturun
              </Typography>
            </SelectionPanel>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DailyTaskManagement;