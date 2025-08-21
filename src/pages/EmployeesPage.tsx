//artemis-admin/src/pages/EmployeesPage.tsx
import React, { useState, useEffect } from 'react';
import employeeService, { IEmployee, IEmployeeReview } from '../services/employeeService';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import ArtemisAvatar from '../components/Avatar/Avatar';
import { 
Container, 
Typography, 
Grid, 
Box,
Paper,
Avatar,
Chip,
Tabs,
Tab,
TextField,
InputAdornment,
Button,
IconButton,
Tooltip,
CircularProgress,
Divider,
Badge,
Menu,
MenuItem,
ListItemIcon,
ListItemText,
Card,
CardContent,
TableContainer,
Table,
TableHead,
TableBody,
TableRow,
TableCell,
Drawer,
CssBaseline,
alpha,
LinearProgress,
Dialog
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
Search as SearchIcon,
Person as PersonIcon,
Group as GroupIcon,
Work as WorkIcon,
InsertChart as InsertChartIcon,
TrendingUp as TrendingUpIcon,
EmojiEvents as EmojiEventsIcon,
CheckCircle as CheckCircleIcon,
Warning as WarningIcon,
Error as ErrorIcon,
Mail as MailIcon,
Phone as PhoneIcon,
Cake as CakeIcon,
LocationOn as LocationOnIcon,
School as SchoolIcon,
MoreVert as MoreVertIcon,
Star as StarIcon,
StarBorder as StarBorderIcon,
FilterList as FilterListIcon,
Sort as SortIcon,
Refresh as RefreshIcon,
Close as CloseIcon,
Add as AddIcon,
KeyboardArrowDown as KeyboardArrowDownIcon,
NotificationsActive as NotificationsActiveIcon,
CameraAlt as CameraAltIcon,
ArrowBack as ArrowBackIcon
} from '@mui/icons-material';


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

// Departman renkleri
const DEPARTMENT_COLORS = {
  'Teknik Servis': ARTEMIS_COLORS.primary,
  'Yönetim': ARTEMIS_COLORS.secondary,
  'Destek': ARTEMIS_COLORS.accent,
  'Finans': ARTEMIS_COLORS.warning,
  'İnsan Kaynakları': '#E91E63',
  'Geliştirme': '#9C27B0'
  };

// 3D Çalışan Kartı
const EmployeeCard = styled(Card)(({ theme }) => ({
borderRadius: theme.spacing(3),
padding: theme.spacing(0),
height: '100%',
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.7)})`,
backdropFilter: 'blur(10px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.6)}`,
boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
transform: 'perspective(1000px) rotateX(0) translateZ(0)',
transformStyle: 'preserve-3d',
overflow: 'hidden',
position: 'relative',
cursor: 'pointer',
'&:hover': {
  transform: 'perspective(1000px) rotateX(5deg) translateY(-10px) translateZ(20px)',
  boxShadow: `0 20px 40px ${alpha(ARTEMIS_COLORS.primaryDark, 0.25)}`,
}
}));

// Performans göstergesi
const PerformanceProgress = styled(LinearProgress)<{ value: number }>(({ value }) => ({
height: 8,
borderRadius: 4,
backgroundColor: alpha(ARTEMIS_COLORS.background, 0.7),
'& .MuiLinearProgress-bar': {
  borderRadius: 4,
  backgroundColor: 
    value >= 80 ? ARTEMIS_COLORS.success :
    value >= 60 ? ARTEMIS_COLORS.accent :
    value >= 40 ? ARTEMIS_COLORS.warning :
    ARTEMIS_COLORS.error
}
}));



// 3D İstatistik Kartı
const StatsCard = styled(Box)(({ theme }) => ({
borderRadius: theme.spacing(2),
padding: theme.spacing(2),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.85)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.65)})`,
backdropFilter: 'blur(10px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
boxShadow: `0 8px 20px ${alpha(ARTEMIS_COLORS.primaryDark, 0.12)}`,
transition: 'all 0.3s ease',
transform: 'perspective(1000px)',
transformStyle: 'preserve-3d',
'&:hover': {
  transform: 'translateY(-5px)',
  boxShadow: `0 12px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.18)}`,
}
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

// Çalışan detay bileşeni
const EmployeeDetailPanel = styled(Box)(({ theme }) => ({
borderRadius: theme.spacing(2),
padding: theme.spacing(3),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
backdropFilter: 'blur(20px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.6)}`,
boxShadow: `0 10px 30px ${alpha(ARTEMIS_COLORS.primaryDark, 0.25)}`,
height: '100%',
width: '600px',
overflow: 'auto',
position: 'relative',
}));

// Başlık kontrolü
const HeaderBox = styled(Box)(({ theme }) => ({
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
position: 'relative',
marginBottom: theme.spacing(4),
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

// Grafik kartı
const ChartCard = styled(Box)(({ theme }) => ({
borderRadius: theme.spacing(2),
padding: theme.spacing(2),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.85)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.65)})`,
backdropFilter: 'blur(10px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
boxShadow: `0 8px 20px ${alpha(ARTEMIS_COLORS.primaryDark, 0.12)}`,
height: '100%',
minHeight: '300px',
overflow: 'hidden',
position: 'relative',
}));

// Bilgi satırı
const InfoRow = styled(Box)(({ theme }) => ({
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: theme.spacing(1.5, 0),
borderBottom: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
'&:last-child': {
  borderBottom: 'none'
}
}));


// Renkli yıldız derecelendirmesi
const StarRating = ({ rating }: { rating: number }) => {
return (
  <Box sx={{ display: 'flex' }}>
    {[...Array(5)].map((_, index) => (
      index < Math.floor(rating) ? (
        <StarIcon key={index} sx={{ color: ARTEMIS_COLORS.warning, fontSize: 18 }} />
      ) : index < rating ? (
        <div key={index} style={{ position: 'relative' }}>
          <StarBorderIcon sx={{ color: ARTEMIS_COLORS.warning, fontSize: 18 }} />
          <StarIcon 
            sx={{ 
              color: ARTEMIS_COLORS.warning, 
              position: 'absolute', 
              left: 0, 
              top: 0,
              fontSize: 18,
              clipPath: `inset(0 ${100 - ((rating - Math.floor(rating)) * 100)}% 0 0)`
            }} 
          />
        </div>
      ) : (
        <StarBorderIcon key={index} sx={{ color: ARTEMIS_COLORS.warning, fontSize: 18 }} />
      )
    ))}
  </Box>
);
};

// Performans göstergesi bileşeni
const PerformanceMeter = ({ value, label }: { value: number, label: string }) => (
<Box sx={{ mb: 1.5 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
      {label}
    </Typography>
    <Typography variant="caption" fontWeight="bold" color={
      value >= 80 ? ARTEMIS_COLORS.success :
      value >= 60 ? ARTEMIS_COLORS.accent :
      value >= 40 ? ARTEMIS_COLORS.warning :
      ARTEMIS_COLORS.error
    }>
      {value}%
    </Typography>
  </Box>
  <PerformanceProgress 
    variant="determinate" 
    value={value} 
  />
</Box>
);

// 3D Görev Kartı
const TaskCard = styled(Box)(({ theme }) => ({
borderRadius: theme.spacing(2),
padding: theme.spacing(2),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.8)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.6)})`,
backdropFilter: 'blur(8px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
boxShadow: `0 6px 15px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`,
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
marginBottom: theme.spacing(1),
transition: 'all 0.3s ease',
transform: 'perspective(800px) rotateX(0)',
'&:hover': {
  transform: 'perspective(800px) rotateX(2deg) translateY(-3px)',
  boxShadow: `0 10px 20px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
}
}));

// 3D Proje Kartı
const ProjectCard = styled(Box)(({ theme }) => ({
borderRadius: theme.spacing(2),
padding: theme.spacing(2),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.85)}, 
  ${alpha(ARTEMIS_COLORS.cardBg, 0.65)})`,
backdropFilter: 'blur(8px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
boxShadow: `0 6px 15px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`,
marginBottom: theme.spacing(1.5),
transition: 'all 0.3s ease',
transform: 'perspective(800px)',
transformStyle: 'preserve-3d',
'&:hover': {
  transform: 'perspective(800px) translateY(-5px) translateZ(10px)',
  boxShadow: `0 12px 20px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
}
}));

// 3D Beceri Etiketi
const SkillChip = styled(Chip)(({ theme }) => ({
margin: theme.spacing(0.5),
background: `linear-gradient(135deg, 
  ${alpha(ARTEMIS_COLORS.secondary, 0.15)}, 
  ${alpha(ARTEMIS_COLORS.primary, 0.15)})`,
backdropFilter: 'blur(5px)',
border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.4)}`,
color: ARTEMIS_COLORS.text,
transition: 'all 0.3s ease',
transform: 'translateZ(0)',
'&:hover': {
  transform: 'translateY(-2px) scale(1.05)',
  boxShadow: `0 5px 10px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`,
  background: `linear-gradient(135deg, 
    ${alpha(ARTEMIS_COLORS.secondary, 0.25)}, 
    ${alpha(ARTEMIS_COLORS.primary, 0.25)})`,
}
}));

// Ana komponent
const EmployeesPage: React.FC = () => {
const navigate = useNavigate();
const [employees, setEmployees] = useState<Employee[]>([]);
const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [tabValue, setTabValue] = useState(0);
const [detailOpen, setDetailOpen] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [sortOrderAnchorEl, setSortOrderAnchorEl] = useState<null | HTMLElement>(null);
const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [sortBy, setSortBy] = useState<'name' | 'performance' | 'hireDate'>('name');
const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
const [departmentStats, setDepartmentStats] = useState<{name: string, value: number}[]>([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [employeeReviews, setEmployeeReviews] = useState<IEmployeeReview[]>([]);


const handleBackToDashboard = () => {
  navigate('/dashboard');
};

const handleAvatarUpload = async (personelId: string) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => { // any yerine Event kullan
    const target = e.target as HTMLInputElement; // Type assertion ekle
    const file = target.files?.[0]; // Safe access
    
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır!');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        console.log('Avatar yükleniyor...', personelId);
        
        // Doğrudan fetch kullan (apiService.post yerine)
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/avatar/upload/${personelId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || 'Avatar başarıyla güncellendi!');
          console.log('Avatar yükleme sonucu:', result);
          // Sayfayı yenile
          window.location.reload();
        } else {
          throw new Error('Avatar yüklenemedi');
        }
        
      } catch (error) {
        console.error('Avatar yükleme hatası:', error);
        alert('Avatar yüklenemedi! Lütfen tekrar deneyiniz.');
      }
    }
  };
  input.click();
};

// Yeni çalışan ekleme - Modal açma (düzeltilmiş)
const handleAddEmployee = () => {
  console.log('Yeni çalışan modal açılıyor...');
  setAddEmployeeModalOpen(true);
};

// Mevcut state'lerin yanına ekleyin
const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
const [newEmployeeData, setNewEmployeeData] = useState({
  first_name: '',
  last_name: '',
  email: '',
  position: 'Teknisyen',
  department: 'Teknik Servis',
  phone_number: '',
  hire_date: new Date().toISOString().split('T')[0]
});

// Yeni Çalışan butonu için fonksiyon - event handler'lardan sonra ekleyin
// Mevcut Employee arayüzünü IEmployee'ye benzer şekilde güncelle
interface Employee {
  id: string; // personel_id string'e dönüştürülmüş hali
  name: string; // first_name + last_name birleşimi
  position: string;
  department: string;
  email: string;
  phone: string; // phone_number'ın karşılığı
  location: string;
  avatar: string;
  hireDate: string; // hire_date'in karşılığı
  birthday: string;
  education: string;
  skills: string[];
  performance: {
    current: number;
    history: number[];
    tasks: {
      completed: number;
      inProgress: number;
      overdue: number;
    };
    attendance: number;
    goals: {
      name: string;
      progress: number;
    }[];
  };
  projects: {
    id: string;
    name: string;
    status: 'completed' | 'active' | 'planned';
    role: string;
  }[];
}



// Modal'ı kapatma
const handleCloseAddEmployeeModal = () => {
  setAddEmployeeModalOpen(false);
  // Formu temizle
  setNewEmployeeData({
    first_name: '',
    last_name: '',
    email: '',
    position: 'Teknisyen',
    department: 'Teknik Servis',
    phone_number: '',
    hire_date: new Date().toISOString().split('T')[0]
  });
};

// Form verilerini güncelleme
const handleNewEmployeeDataChange = (field: string, value: string) => {
  setNewEmployeeData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Yeni çalışanı kaydetme (geliştirilmiş validasyon ile)
const handleSaveNewEmployee = async () => {
  try {
    // Gelişmiş validasyon
    if (!newEmployeeData.first_name.trim()) {
      alert('Ad alanı zorunludur!');
      return;
    }

    if (!newEmployeeData.last_name.trim()) {
      alert('Soyad alanı zorunludur!');
      return;
    }

    if (!newEmployeeData.email.trim()) {
      alert('E-posta alanı zorunludur!');
      return;
    }

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployeeData.email)) {
      alert('Geçerli bir e-posta adresi giriniz!');
      return;
    }

    // Telefon numarası varsa format kontrolü (opsiyonel)
    if (newEmployeeData.phone_number && newEmployeeData.phone_number.length < 10) {
      alert('Geçerli bir telefon numarası giriniz!');
      return;
    }

    console.log('Kaydedilecek çalışan verileri:', newEmployeeData);

    // API'ye gönderilecek veri formatı
    const employeeToSave = {
      ...newEmployeeData,
      role: 1 as const // Backend için gerekli rol bilgisi
    };
    
    console.log('API\'ye gönderilen veri:', employeeToSave);

    // Backend'e kaydet
    const response = await employeeService.createEmployee(employeeToSave);
    console.log('API\'den dönen yanıt:', response);
    
    // UI formatına dönüştür
    const formattedNewEmployee = convertToEmployee(response);
    console.log('UI formatına dönüştürülen çalışan:', formattedNewEmployee);
    
    // State'leri güncelle
    setEmployees(prev => [...prev, formattedNewEmployee]);
    setFilteredEmployees(prev => [...prev, formattedNewEmployee]);
    
    // Modal'ı kapat ve formu temizle
    handleCloseAddEmployeeModal();
    
    // Başarı mesajı
    alert('Çalışan başarıyla eklendi!');
    
  } catch (error) {
    console.error('Çalışan eklenirken hata oluştu:', error);
    
    // Hata tipine göre mesaj göster
    if (error instanceof Error) {
      alert(`Hata: ${error.message}`);
    } else {
      alert('Çalışan eklenirken bilinmeyen bir hata oluştu!');
    }
  }
};

// Geliştirilmiş dönüşüm fonksiyonu (hata kontrolü ile)
const convertToEmployee = (emp: IEmployee): Employee => {
  console.log('Dönüştürülecek çalışan verisi:', emp);
  
  return {
    id: emp.personel_id ? emp.personel_id.toString() : `temp_${Date.now()}_${Math.random()}`,
    name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'İsimsiz Çalışan',
    position: emp.position || 'Teknisyen',
    department: emp.department || 'Teknik Servis',
    email: emp.email || 'bilgi@artemis.com',
    phone: emp.phone_number || 'Belirtilmemiş',
    location: emp.location || 'İstanbul, Türkiye',
    avatar: emp.avatar || `/assets/avatars/default.png`,
    hireDate: emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
    birthday: emp.birthday || '01.01.1990',
    education: emp.education || 'Lisans',
    skills: emp.skills || ['Teknik Servis', 'Onarım'],
    performance: emp.performance || {
      current: 75,
      history: [70, 75, 80, 75],
      tasks: {
        completed: 0,
        inProgress: 1,
        overdue: 0
      },
      attendance: 85,
      goals: [
        { name: 'Müşteri Memnuniyeti', progress: 85 },
        { name: 'İş Kalitesi', progress: 80 },
        { name: 'Zamanında Teslim', progress: 90 }
      ]
    },
    projects: emp.projects || [
      {
        id: `prj_${emp.personel_id || 'temp'}_1`,
        name: 'Bakım ve Onarım Servisleri',
        status: 'active' as const,
        role: emp.position || 'Teknisyen'
      }
    ]
  };
};

const fetchEmployeeReviews = async (personelId: string) => {
  try {
    setReviewsLoading(true);
    const reviews = await apiService.get(`/calisan-degerlendirmeleri/${personelId}`) as IEmployeeReview[];
    setEmployeeReviews(reviews);
  } catch (error) {
    console.error('Değerlendirmeler yüklenirken hata:', error);
    setEmployeeReviews([]);
  } finally {
    setReviewsLoading(false);
  }
};

// API'den veri çekme
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      if (!apiService.isAuthenticated()) {
        console.warn('Oturum açmanız gerekiyor!');
        navigate('/login');
        return;
      }
      
      setLoading(true);
      
      // API'den çalışan verilerini çek
      const data = await employeeService.getAllEmployees();
      console.log('API\'den gelen veriler:', data);
      
      // Backend'den gelen verileri Employee tipine dönüştürme
      const formattedEmployees = data.map(emp => convertToEmployee(emp));
      
      setEmployees(formattedEmployees);
      setFilteredEmployees(formattedEmployees);
      
      // Departman istatistiklerini hesapla
      const deptStats = formattedEmployees.reduce((acc: {[key: string]: number}, emp) => {
        const dept = emp.department || 'Diğer';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});
      
      const deptStatsArray = Object.entries(deptStats).map(([name, value]) => ({
        name,
        value
      }));
      
      setDepartmentStats(deptStatsArray);
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata oluştu:', error);
      // Hata durumunda kullanıcıya bilgilendirme yapalım
      // Burada bir Toast veya Alert gösterilebilir
    } finally {
      setLoading(false);
    }
  };

  fetchEmployees();
}, [navigate]);

// Yeni çalışan ekleme


// Tab değişikliği
const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
  setTabValue(newValue);
};

// Çalışan detaylarını açma
const handleEmployeeClick = async (employee: Employee) => {
  setSelectedEmployee(employee);
  setDetailOpen(true);
  
  // Değerlendirmeleri yükle
  await fetchEmployeeReviews(employee.id);
};

// Çalışan detaylarını açma
const handleDetailOpen = () => {
  setDetailOpen(true);
};

// Çalışan detaylarını kapatma
const handleDetailClose = () => {
  setDetailOpen(false);
};

// Menü açma işlemleri
const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
};

// Menü kapatma
const handleMenuClose = () => {
  setAnchorEl(null);
};

// Sıralama menüsü
const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setSortOrderAnchorEl(event.currentTarget);
};

// Sıralama menüsü kapatma
const handleSortMenuClose = () => {
  setSortOrderAnchorEl(null);
};

// Filtreleme menüsü
const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setFilterAnchorEl(event.currentTarget);
};

// Filtreleme menüsü kapatma
const handleFilterMenuClose = () => {
  setFilterAnchorEl(null);
};

// Sıralama değiştirme
const handleSortChange = (sortByField: 'name' | 'performance' | 'hireDate') => {
  if (sortBy === sortByField) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(sortByField);
    setSortOrder('asc');
  }
  handleSortMenuClose();
};

// Departman filtresi ayarlama
const handleDepartmentFilter = (department: string | null) => {
  setDepartmentFilter(department);
  handleFilterMenuClose();
};

// Görünüm modu değiştirme
const toggleViewMode = () => {
  setViewMode(viewMode === 'cards' ? 'table' : 'cards');
};

// Render: Çalışan Kartları
const renderEmployeeCards = () => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={60} sx={{ color: ARTEMIS_COLORS.primary }} />
      </Box>
    );
  }

  
  if (filteredEmployees.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center', 
        background: alpha(ARTEMIS_COLORS.background, 0.7),
        borderRadius: 2,
        backdropFilter: 'blur(8px)'
      }}>
        <WarningIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.warning, mb: 2 }} />
        <Typography variant="h6" color={ARTEMIS_COLORS.text}>
          Arama kriterlerine uygun çalışan bulunamadı.
        </Typography>
        <Button 
          startIcon={<RefreshIcon />}
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            setSearchTerm('');
            setDepartmentFilter(null);
          }}
        >
          Filtreleri Temizle
        </Button>
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {filteredEmployees.map(employee => (
        <Grid item xs={12} sm={6} md={4} key={employee.id}>
          <EmployeeCard onClick={() => handleEmployeeClick(employee)}>
            <Box 
              sx={{ 
                height: '80px', 
                background: `linear-gradient(135deg, 
                ${alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS] || ARTEMIS_COLORS.primary, 0.7)}, 
                ${alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS] || ARTEMIS_COLORS.primary, 0.5)})`,
                position: 'relative',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                overflow: 'hidden'
              }}
            >
              {/* Dekoratif şekiller */}
              <Box sx={{ 
                position: 'absolute', 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: alpha('#fff', 0.1),
                top: '-50px',
                right: '-30px'
              }} />
              <Box sx={{ 
                position: 'absolute', 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: alpha('#fff', 0.1),
                bottom: '-20px',
                left: '20px'
              }} />
            </Box>
            
            <CardContent sx={{ pt: 0, pb: '16px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '-40px', zIndex: 5 }}>
              <Box sx={{ position: 'relative' }}> {/* Bu Box'ı ekleyin - relative position için */}
                <ArtemisAvatar 
                  person={{ 
                    name: employee.name, 
                    avatar: employee.avatar, 
                    id: employee.id 
                  }} 
                  size={80} 
                  showOnline={false} 
                />
                
                {/* 👇 BU BUTONU EKLEYİN */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Kart tıklamasını engelle
                    handleAvatarUpload(employee.id);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: '#fff',
                    boxShadow: 2,
                    width: 28,
                    height: 28,
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <CameraAltIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
              
              <Box sx={{ textAlign: 'center', mb: 1.5, mt: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, 
                    ${ARTEMIS_COLORS.primary}, 
                    ${ARTEMIS_COLORS.secondary})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 4px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`
                }}>
                  {employee.name}
                </Typography>
                <Typography variant="body2" color={ARTEMIS_COLORS.textLight} gutterBottom>
                  {employee.position}
                </Typography>
              </Box>
              
              <Chip 
                label={employee.department}
                size="small"
                sx={{ 
                  backgroundColor: alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS], 0.15),
                  color: DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS],
                  border: `1px solid ${alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS], 0.3)}`,
                  mb: 2,
                  fontWeight: 500
                }}
              />
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 0.5,
                  color: ARTEMIS_COLORS.textLight
                }}
              >
                <MailIcon sx={{ fontSize: 14, mr: 0.5, color: ARTEMIS_COLORS.primary }} />
                {employee.email}
              </Typography>
              
              <Typography variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1.5,
                  color: ARTEMIS_COLORS.textLight
                }}
              >
                <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: ARTEMIS_COLORS.primary }} />
                {employee.location}
              </Typography>
              
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" fontWeight="medium" mb={0.5}>
                  Genel Performans
                </Typography>
                <PerformanceProgress 
                  variant="determinate" 
                  value={employee.performance.current} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                  <Typography 
                    variant="caption" 
                    fontWeight="bold" 
                    sx={{ 
                      color: employee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                        employee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                        employee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                        ARTEMIS_COLORS.error
                    }}
                  >
                    {employee.performance.current}%
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                  {employee.projects.length} Proje • {employee.skills.length} Beceri
                </Typography>
                <IconButton 
                  size="small" 
                  sx={{ color: ARTEMIS_COLORS.primary }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(employee);
                    handleMenuOpen(e);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </EmployeeCard>
        </Grid>
      ))}
    </Grid>
  );
};


// Render: Çalışan Tablosu
const renderEmployeeTable = () => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={60} sx={{ color: ARTEMIS_COLORS.primary }} />
      </Box>
    );
  }
  
  if (filteredEmployees.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center', 
        background: alpha(ARTEMIS_COLORS.background, 0.7),
        borderRadius: 2,
        backdropFilter: 'blur(8px)'
      }}>
        <WarningIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.warning, mb: 2 }} />
        <Typography variant="h6" color={ARTEMIS_COLORS.text}>
          Arama kriterlerine uygun çalışan bulunamadı.
        </Typography>
        <Button 
          startIcon={<RefreshIcon />}
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            setSearchTerm('');
            setDepartmentFilter(null);
          }}
        >
          Filtreleri Temizle
        </Button>
      </Box>
    );
  }
  
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${alpha(ARTEMIS_COLORS.cardBg, 0.85)}, 
          ${alpha(ARTEMIS_COLORS.cardBg, 0.7)})`,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.12)}`,
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ 
            background: `linear-gradient(90deg, 
              ${alpha(ARTEMIS_COLORS.primary, 0.05)}, 
              ${alpha(ARTEMIS_COLORS.secondary, 0.1)})` 
          }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Çalışan</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Departman</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Pozisyon</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Performans</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>İşe Başlama</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow 
              key={employee.id}
              sx={{ 
                '&:hover': { 
                  background: alpha(ARTEMIS_COLORS.background, 0.5),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 10px ${alpha(ARTEMIS_COLORS.primaryDark, 0.07)}`,
                  transition: 'all 0.3s ease',
                },
                cursor: 'pointer'
              }}
              onClick={() => handleEmployeeClick(employee)}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArtemisAvatar 
                  person={{ 
                    name: employee.name, 
                    avatar: employee.avatar, 
                    id: employee.id 
                  }} 
                  size={40} 
                  showOnline={false} 
                  sx={{ 
                    mr: 2, 
                    border: `2px solid ${alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS], 0.5)}`,
                  }} 
                />
                  <Typography variant="body1" fontWeight="medium">
                    {employee.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={employee.department}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS], 0.15),
                    color: DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS],
                    border: `1px solid ${alpha(DEPARTMENT_COLORS[employee.department as keyof typeof DEPARTMENT_COLORS], 0.3)}`,
                    fontWeight: 500
                  }}
                />
              </TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={employee.performance.current} 
                    sx={{ 
                      width: 100, 
                      height: 8, 
                      borderRadius: 4,
                      mr: 1,
                      backgroundColor: alpha(ARTEMIS_COLORS.background, 0.7),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, 
                          ${employee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                            employee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                            employee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                            ARTEMIS_COLORS.error},
                          ${alpha(employee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                            employee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                            employee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                            ARTEMIS_COLORS.error, 0.7)})`
                      }
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    color={
                      employee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                      employee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                      employee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                      ARTEMIS_COLORS.error
                    }
                  >
                    {employee.performance.current}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{employee.hireDate}</TableCell>
              <TableCell>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(employee);
                    handleMenuOpen(e);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Render: Çalışan Detayları
const renderEmployeeDetail = () => {
  if (!selectedEmployee) return null;
  
  // Performans geçmişi için renkler
  const performanceColors = selectedEmployee.performance.history.map(value => 
    value >= 80 ? ARTEMIS_COLORS.success :
    value >= 60 ? ARTEMIS_COLORS.accent :
    value >= 40 ? ARTEMIS_COLORS.warning :
    ARTEMIS_COLORS.error
  );
  
  return (
    <Drawer
      anchor="right"
      open={detailOpen}
      onClose={handleDetailClose}
      PaperProps={{
        sx: {
          width: '600px',
          background: `linear-gradient(135deg, 
            ${alpha(ARTEMIS_COLORS.background, 0.95)}, 
            ${alpha(ARTEMIS_COLORS.background, 0.85)})`,
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: `-5px 0 30px ${alpha(ARTEMIS_COLORS.primaryDark, 0.2)}`,
          overflowY: 'auto'
        }
      }}
    >
      <EmployeeDetailPanel>
        <Box sx={{ position: 'relative' }}>
          <IconButton 
            onClick={handleDetailClose}
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0,
              color: ARTEMIS_COLORS.text
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              mb: 4,
              pt: 2
            }}
          >
            <ArtemisAvatar 
              person={{ 
                name: selectedEmployee.name, 
                avatar: selectedEmployee.avatar, 
                id: selectedEmployee.id 
              }} 
              size={120} 
              showOnline={false} 
              sx={{ 
                border: `4px solid ${alpha('#fff', 0.9)}`,
                boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.25)}`,
                mb: 2
              }} 
            />
            
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(135deg, 
                ${ARTEMIS_COLORS.primary}, 
                ${ARTEMIS_COLORS.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 4px ${alpha(ARTEMIS_COLORS.primaryDark, 0.1)}`
            }}>
              {selectedEmployee.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={selectedEmployee.department}
                size="small"
                sx={{ 
                  backgroundColor: alpha(DEPARTMENT_COLORS[selectedEmployee.department as keyof typeof DEPARTMENT_COLORS], 0.15),
                  color: DEPARTMENT_COLORS[selectedEmployee.department as keyof typeof DEPARTMENT_COLORS],
                  border: `1px solid ${alpha(DEPARTMENT_COLORS[selectedEmployee.department as keyof typeof DEPARTMENT_COLORS], 0.3)}`,
                  mr: 1,
                  fontWeight: 500
                }}
              />
              <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                {selectedEmployee.position}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: ARTEMIS_COLORS.textLight,
                '& .MuiSvgIcon-root': {
                  fontSize: 16,
                  mr: 0.5,
                  color: ARTEMIS_COLORS.primary
                }
              }}
            >
              <LocationOnIcon /> {selectedEmployee.location}
            </Typography>
          </Box>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: ARTEMIS_COLORS.primary,
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                color: ARTEMIS_COLORS.textLight,
                '&.Mui-selected': {
                  color: ARTEMIS_COLORS.primary,
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <Tab label="Genel Bilgiler" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Performans" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Projeler" icon={<WorkIcon />} iconPosition="start" />
          </Tabs>
          
          {/* Genel Bilgiler Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                İletişim Bilgileri
              </Typography>
              
              
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <MailIcon sx={{ mr: 1, fontSize: 18, color: ARTEMIS_COLORS.secondary }} />
                  E-posta
                </Typography>
                <Typography variant="body2">{selectedEmployee.email}</Typography>
              </InfoRow>
              
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, fontSize: 18, color: ARTEMIS_COLORS.secondary }} />
                  Telefon
                </Typography>
                <Typography variant="body2">{selectedEmployee.phone}</Typography>
              </InfoRow>
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Kişisel Bilgiler
              </Typography>
              
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <CakeIcon sx={{ mr: 1, fontSize: 18, color: ARTEMIS_COLORS.secondary }} />
                  Doğum Tarihi
                </Typography>
                <Typography variant="body2">{selectedEmployee.birthday}</Typography>
              </InfoRow>
              
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 1, fontSize: 18, color: ARTEMIS_COLORS.secondary }} />
                  İşe Başlama
                </Typography>
                <Typography variant="body2">{selectedEmployee.hireDate}</Typography>
              </InfoRow>
              
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1, fontSize: 18, color: ARTEMIS_COLORS.secondary }} />
                  Eğitim
                </Typography>
                <Typography variant="body2">{selectedEmployee.education}</Typography>
              </InfoRow>
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Beceriler
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                {selectedEmployee.skills.map((skill, index) => (
                  <SkillChip 
                    key={index}
                    label={skill}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Performans Tab */}
          {tabValue === 1 && (
            <Box>
              <ChartCard sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                  Genel Performans
                </Typography>
                  
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={selectedEmployee.performance.current} 
                      size={120}
                      thickness={5}
                      sx={{ 
                        color: selectedEmployee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                          selectedEmployee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                          selectedEmployee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                          ARTEMIS_COLORS.error,
                        boxShadow: `0 0 15px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
                        borderRadius: '50%'
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" color={
                        selectedEmployee.performance.current >= 80 ? ARTEMIS_COLORS.success :
                        selectedEmployee.performance.current >= 60 ? ARTEMIS_COLORS.accent :
                        selectedEmployee.performance.current >= 40 ? ARTEMIS_COLORS.warning :
                        ARTEMIS_COLORS.error
                      }>
                        {selectedEmployee.performance.current}
                      </Typography>
                      <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                        Puan
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Performans Geçmişi:
                </Typography>
                
                <Box sx={{ 
                  height: 60, 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  mt: 1
                }}>
                  {selectedEmployee.performance.history.map((value, index) => (
                    <Box 
                      key={index}
                      sx={{
                        width: `calc(100% / ${selectedEmployee.performance.history.length})`,
                        mx: 0.5,
                        position: 'relative'
                      }}
                    >
                      <Box 
                        sx={{
                          height: `${value * 0.6}%`,
                          backgroundColor: performanceColors[index],
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.3s',
                          position: 'relative',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'translateY(-5px)',
                            boxShadow: `0 5px 10px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`
                          },
                          '&:hover::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: ARTEMIS_COLORS.text,
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                          }
                        }}
                        data-value={value}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: -20, 
                          left: 0, 
                          right: 0,
                          textAlign: 'center',
                          color: ARTEMIS_COLORS.textLight
                        }}
                      >
                        Q{index+1}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ChartCard>

              {/* Müşteri Değerlendirmeleri - Ayrı Bölüm */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                  Müşteri Değerlendirmeleri
                </Typography>

                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={40} sx={{ color: ARTEMIS_COLORS.primary }} />
                  </Box>
                ) : employeeReviews.length > 0 ? (
                  <Box>
                    {employeeReviews.map((review, index) => (
                      <ProjectCard key={index} sx={{ mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {review.firma_adi}
                              </Typography>
                              <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                                {review.seri_no ? `Servis No: ${review.seri_no}` : 'Genel Değerlendirme'}
                              </Typography>
                              <Typography variant="caption" color={ARTEMIS_COLORS.textLight} sx={{ display: 'block' }}>
                                {new Date(review.tarih).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarRating rating={review.puan} />
                              <Typography variant="body2" fontWeight="bold" sx={{ ml: 1 }}>
                                {review.puan}/5
                              </Typography>
                            </Box>
                          </Box>
                          
                          {review.yorum && (
                            <Box sx={{ 
                              mt: 1, 
                              p: 1.5, 
                              backgroundColor: alpha(ARTEMIS_COLORS.background, 0.5),
                              borderRadius: 1,
                              borderLeft: `3px solid ${
                                review.puan >= 4 ? ARTEMIS_COLORS.success :
                                review.puan >= 3 ? ARTEMIS_COLORS.accent :
                                review.puan >= 2 ? ARTEMIS_COLORS.warning :
                                ARTEMIS_COLORS.error
                              }`
                            }}>
                              <Typography variant="body2" color={ARTEMIS_COLORS.text}>
                                &ldquo;{review.yorum}&rdquo;
                              </Typography>
                            </Box>
                          )}
                          
                          {review.servis_aciklama && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                                Servis Açıklaması: {review.servis_aciklama}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </ProjectCard>
                    ))}
                    
                    {/* Ortalama puan özeti */}
                    <StatsCard sx={{ mt: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color={ARTEMIS_COLORS.primary}>
                          {employeeReviews.length > 0 ? 
                            (employeeReviews.reduce((sum, review) => sum + review.puan, 0) / employeeReviews.length).toFixed(1) : 
                            '0.0'
                          }
                        </Typography>
                        <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                          Ortalama Puan ({employeeReviews.length} değerlendirme)
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <StarRating rating={employeeReviews.length > 0 ? 
                            employeeReviews.reduce((sum, review) => sum + review.puan, 0) / employeeReviews.length : 
                            0
                          } />
                        </Box>
                      </Box>
                    </StatsCard>
                  </Box>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    background: alpha(ARTEMIS_COLORS.background, 0.5),
                    borderRadius: 2 
                  }}>
                    <WarningIcon sx={{ fontSize: 48, color: ARTEMIS_COLORS.textLight, mb: 1 }} />
                    <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                      Henüz değerlendirme bulunmuyor
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Görev Durumu
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                      Tamamlanan
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: ARTEMIS_COLORS.success, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {selectedEmployee.performance.tasks.completed}
                      </Typography>
                    </Box>
                  </StatsCard>
                </Grid>
                
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                      Devam Eden
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: ARTEMIS_COLORS.primary, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {selectedEmployee.performance.tasks.inProgress}
                      </Typography>
                    </Box>
                  </StatsCard>
                </Grid>
                
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                      Geciken
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ color: ARTEMIS_COLORS.warning, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {selectedEmployee.performance.tasks.overdue}
                      </Typography>
                    </Box>
                  </StatsCard>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Performans Hedefleri
              </Typography>
              
              {selectedEmployee.performance.goals.map((goal, index) => (
                <PerformanceMeter key={index} value={goal.progress} label={goal.name} />
              ))}
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Devam Durumu
              </Typography>
              
              <StatsCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Devam Oranı
                    </Typography>
                    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                      Son 30 gün
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color={
                    selectedEmployee.performance.attendance >= 90 ? ARTEMIS_COLORS.success :
                    selectedEmployee.performance.attendance >= 75 ? ARTEMIS_COLORS.accent :
                    selectedEmployee.performance.attendance >= 60 ? ARTEMIS_COLORS.warning :
                    ARTEMIS_COLORS.error
                  }>
                    {selectedEmployee.performance.attendance}%
                  </Typography>
                </Box>
              </StatsCard>
            </Box>
          )}
          
          {/* Projeler Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Aktif Projeler
              </Typography>
              
              {selectedEmployee.projects
                .filter(project => project.status === 'active')
                .map((project) => (
                  <ProjectCard key={project.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {project.name}
                          </Typography>
                          <Chip 
                            label="Aktif" 
                            size="small"
                            sx={{ 
                              ml: 1, 
                              backgroundColor: alpha(ARTEMIS_COLORS.success, 0.15),
                              color: ARTEMIS_COLORS.success,
                              border: `1px solid ${alpha(ARTEMIS_COLORS.success, 0.3)}`,
                              height: 20,
                              fontSize: 10
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                          {project.role}
                        </Typography>
                      </Box>
                      <StarRating rating={4.5} />
                    </Box>
                  </ProjectCard>
                ))}
                
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Planlanan Projeler
              </Typography>
              
              {selectedEmployee.projects
                .filter(project => project.status === 'planned')
                .map((project) => (
                  <ProjectCard key={project.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {project.name}
                          </Typography>
                          <Chip 
                            label="Planlanan" 
                            size="small"
                            sx={{ 
                              ml: 1, 
                              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
                              color: ARTEMIS_COLORS.primary,
                              border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.3)}`,
                              height: 20,
                              fontSize: 10
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                          {project.role}
                        </Typography>
                      </Box>
                      <StarRating rating={3.5} />
                    </Box>
                  </ProjectCard>
                ))}
                
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Tamamlanan Projeler
              </Typography>
              
              {selectedEmployee.projects
                .filter(project => project.status === 'completed')
                .map((project) => (
                  <ProjectCard key={project.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {project.name}
                          </Typography>
                          <Chip 
                            label="Tamamlandı" 
                            size="small"
                            sx={{ 
                              ml: 1, 
                              backgroundColor: alpha(ARTEMIS_COLORS.secondary, 0.15),
                              color: ARTEMIS_COLORS.secondary,
                              border: `1px solid ${alpha(ARTEMIS_COLORS.secondary, 0.3)}`,
                              height: 20,
                              fontSize: 10
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                          {project.role}
                        </Typography>
                      </Box>
                      <StarRating rating={4} />
                    </Box>
                  </ProjectCard>
                ))}
                
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: ARTEMIS_COLORS.primary }}>
                Görevler
              </Typography>
              
              <TaskCard>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Müşteri toplantısı hazırlığı
                  </Typography>
                  <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                    12 Mayıs 2025
                  </Typography>
                </Box>
                <Chip 
                  label="Öncelikli" 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ARTEMIS_COLORS.error, 0.15),
                    color: ARTEMIS_COLORS.error,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.error, 0.3)}`
                  }} 
                />
              </TaskCard>
              
              <TaskCard>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Sprint planlama toplantısı
                  </Typography>
                  <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                    15 Mayıs 2025
                  </Typography>
                </Box>
                <Chip 
                  label="Normal" 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
                    color: ARTEMIS_COLORS.primary,
                    border: `1px solid ${alpha(ARTEMIS_COLORS.primary, 0.3)}`
                  }} 
                />
              </TaskCard>
            </Box>
          )}
        </Box>
      </EmployeeDetailPanel>
    </Drawer>
      );
    };
    

// Çalışan filtreleme
useEffect(() => {
  setLoading(true);
  
  // Filtrelemeyi simüle etmek için zamanlayıcı kullanıyoruz
  const timer = setTimeout(() => {
    let result = employees;
    
    // Arama filtrelemesi
    if (searchTerm) {
      result = result.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Departman filtrelemesi
    if (departmentFilter) {
      result = result.filter(employee => employee.department === departmentFilter);
    }
    
    // Sıralama
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'performance') {
        return sortOrder === 'asc' 
          ? a.performance.current - b.performance.current 
          : b.performance.current - a.performance.current;
      } else if (sortBy === 'hireDate') {
        const dateA = a.hireDate.split('.').reverse().join('-');
        const dateB = b.hireDate.split('.').reverse().join('-');
        return sortOrder === 'asc' 
          ? new Date(dateA).getTime() - new Date(dateB).getTime() 
          : new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      return 0;
    });
    
    setFilteredEmployees(result);
    setLoading(false);
  }, 500); // 500ms gecikme ile animasyon etkisi oluşturuyoruz
  
  return () => clearTimeout(timer);
}, [employees, searchTerm, departmentFilter, sortBy, sortOrder]);
return (
  <Box sx={{ 
    minHeight: '100vh',
    background: `linear-gradient(135deg, 
      ${alpha(ARTEMIS_COLORS.background, 0.9)}, 
      ${alpha(ARTEMIS_COLORS.background, 0.8)})`,
    padding: 3
  }}>
    <CssBaseline />
    
    <Container maxWidth="xl">
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
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: ARTEMIS_COLORS.primary,
              display: 'flex',
              alignItems: 'center'
            }}>
              <GroupIcon sx={{ mr: 1, fontSize: 36 }} />
              Çalışan Yönetimi
            </Typography>
            <Typography variant="body1" color={ARTEMIS_COLORS.textLight}>
              Tüm çalışanları görüntüle, filtrele ve yönet
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={4} 
            color="error"
            sx={{ mr: 2 }}
          >
            <IconButton 
              color="primary"
              sx={{ 
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                '&:hover': {
                  backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
                }
              }}
            >
              <NotificationsActiveIcon />
            </IconButton>
          </Badge>
          
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
            sx={{ 
              background: `linear-gradient(90deg, 
                ${ARTEMIS_COLORS.primary}, 
                ${ARTEMIS_COLORS.secondary})`,
              borderRadius: 2,
              boxShadow: `0 4px 10px ${alpha(ARTEMIS_COLORS.primaryDark, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 15px ${alpha(ARTEMIS_COLORS.primaryDark, 0.4)}`,
              }
            }}
          >
            Yeni Çalışan
          </Button>
        </Box>
      </HeaderBox>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {employees.length}
                </Typography>
                <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                  Toplam Çalışan
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: alpha(ARTEMIS_COLORS.primary, 0.15), 
                color: ARTEMIS_COLORS.primary 
              }}>
                <GroupIcon />
              </Avatar>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={80} 
              sx={{ 
                mt: 2, 
                height: 6, 
                borderRadius: 3,
                backgroundColor: alpha(ARTEMIS_COLORS.background, 0.5),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, 
                    ${ARTEMIS_COLORS.primary}, 
                    ${ARTEMIS_COLORS.secondary})`
                }
              }} 
            />
            <Typography variant="caption" color={ARTEMIS_COLORS.textLight} sx={{ mt: 0.5, display: 'block' }}>
              %15 Büyüme (Son 3 ay)
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {departmentStats.length}
                </Typography>
                <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                  Departman
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: alpha(ARTEMIS_COLORS.accent, 0.15), 
                color: ARTEMIS_COLORS.accent 
              }}>
                <WorkIcon />
              </Avatar>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {departmentStats.slice(0, 3).map((dept, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%',
                      backgroundColor: DEPARTMENT_COLORS[dept.name as keyof typeof DEPARTMENT_COLORS],
                      mr: 1
                    }} 
                  />
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {dept.name}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {dept.value}
                  </Typography>
                </Box>
              ))}
              {departmentStats.length > 3 && (
                <Typography variant="caption" color={ARTEMIS_COLORS.primary} sx={{ cursor: 'pointer' }}>
                  + {departmentStats.length - 3} daha
                </Typography>
              )}
            </Box>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {employees.length > 0 ? 
                  Math.round(employees.reduce((sum, emp) => sum + emp.performance.current, 0) / employees.length) : 
                  0}%
              </Typography>
              <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                Ort. Performans
              </Typography>
            </Box>
            <Avatar sx={{ 
              bgcolor: alpha(ARTEMIS_COLORS.success, 0.15), 
              color: ARTEMIS_COLORS.success
            }}>
              <TrendingUpIcon />
            </Avatar>
          </Box>
          
          <Box sx={{ 
            mt: 2,
            background: alpha(ARTEMIS_COLORS.background, 0.4),
            borderRadius: 2,
            p: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">0</Typography>
              <Typography variant="caption">100</Typography>
            </Box>
            
            {(() => {
              const avgPerformance = employees.length > 0 ? 
                Math.round(employees.reduce((sum, emp) => sum + emp.performance.current, 0) / employees.length) : 
                0;
              
              return (
                <Box sx={{ 
                  height: 20, 
                  width: '100%', 
                  backgroundColor: alpha(ARTEMIS_COLORS.background, 0.7),
                  borderRadius: 10,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${avgPerformance}%`,
                    borderRadius: 10,
                    background: `linear-gradient(90deg, 
                      ${ARTEMIS_COLORS.success}, 
                      ${alpha(ARTEMIS_COLORS.accent, 0.9)})`
                  }} />
                  
                  <Box sx={{ 
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" fontWeight="bold" color="#fff">
                      {avgPerformance}%
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
          </Box>
        </StatsCard>
      </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  15
                </Typography>
                <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                  Aktif Proje
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: alpha(ARTEMIS_COLORS.warning, 0.15), 
                color: ARTEMIS_COLORS.warning
              }}>
                <InsertChartIcon />
              </Avatar>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  background: alpha(ARTEMIS_COLORS.background, 0.4),
                  borderRadius: 2,
                  p: 1,
                  width: '30%',
                }}
              >
                <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                  Devam Eden
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={ARTEMIS_COLORS.primary}>
                  8
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  background: alpha(ARTEMIS_COLORS.background, 0.4),
                  borderRadius: 2,
                  p: 1,
                  width: '30%'
                }}
              >
                <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                  Planlanan
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={ARTEMIS_COLORS.secondary}>
                  4
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  background: alpha(ARTEMIS_COLORS.background, 0.4),
                  borderRadius: 2,
                  p: 1,
                  width: '30%'
                }}
              >
                <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                  Tamamlanan
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={ARTEMIS_COLORS.success}>
                  3
                </Typography>
              </Box>
            </Box>
          </StatsCard>
        </Grid>
      </Grid>
      
      <FilterPanel>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, flex: 1 }}>
          <TextField
            placeholder="Çalışan Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ 
              width: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(ARTEMIS_COLORS.cardBg, 0.5),
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: ARTEMIS_COLORS.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: ARTEMIS_COLORS.primary,
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: ARTEMIS_COLORS.primary }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            startIcon={<FilterListIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            variant="outlined"
            size="small"
            onClick={handleFilterMenuOpen}
            sx={{ 
              borderRadius: 2,
              borderColor: alpha(ARTEMIS_COLORS.primary, 0.5),
              color: ARTEMIS_COLORS.primary,
              backgroundColor: alpha(ARTEMIS_COLORS.cardBg, 0.5),
              '&:hover': {
                borderColor: ARTEMIS_COLORS.primary,
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
              }
            }}
          >
            Departman
            {departmentFilter ? `: ${departmentFilter}` : ''}
          </Button>
          
          <Button
            startIcon={<SortIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            variant="outlined"
            size="small"
            onClick={handleSortMenuOpen}
            sx={{ 
              borderRadius: 2,
              borderColor: alpha(ARTEMIS_COLORS.primary, 0.5),
              color: ARTEMIS_COLORS.primary,
              backgroundColor: alpha(ARTEMIS_COLORS.cardBg, 0.5),
              '&:hover': {
                borderColor: ARTEMIS_COLORS.primary,
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
              }
            }}
          >
            Sırala: {sortBy === 'name' ? 'İsim' : 
              sortBy === 'performance' ? 'Performans' : 
              'İşe Başlama'} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
          </Button>
          
          {(searchTerm || departmentFilter) && (
            <Button
              startIcon={<RefreshIcon />}
              size="small"
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter(null);
              }}
              sx={{ 
                borderRadius: 2,
                color: ARTEMIS_COLORS.primary,
                '&:hover': {
                  backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                }
              }}
            >
              Temizle
            </Button>
          )}
        </Box>
        
        <Box>
          <Tooltip title={viewMode === 'cards' ? 'Tablo Görünümü' : 'Kart Görünümü'}>
            <IconButton 
              onClick={toggleViewMode}
              sx={{ 
                color: ARTEMIS_COLORS.primary,
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1),
                '&:hover': {
                  backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
                }
              }}
            >
              {viewMode === 'cards' ? <InsertChartIcon /> : <GroupIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </FilterPanel>
      
      {/* Filtreleme menüleri */}
      <Menu
        id="filter-menu"
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            background: `linear-gradient(135deg, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
            borderRadius: 2,
            boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
          }
        }}
      >
        <MenuItem 
          onClick={() => handleDepartmentFilter(null)}
          selected={departmentFilter === null}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            },
            '&.Mui-selected': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
              '&:hover': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
              }
            }
          }}
        >
          <ListItemIcon>
            <RefreshIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>Tümünü Göster</ListItemText>
        </MenuItem>
        
        <Divider />
        
        {Object.keys(DEPARTMENT_COLORS).map((department) => (
          <MenuItem 
            key={department}
            onClick={() => handleDepartmentFilter(department)}
            selected={departmentFilter === department}
            sx={{ 
              color: ARTEMIS_COLORS.text,
              '&:hover': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
              },
              '&.Mui-selected': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
                '&:hover': {
                  backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
                }
              }
            }}
          >
            <ListItemIcon>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                backgroundColor: DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS]
              }} />
            </ListItemIcon>
            <ListItemText>{department}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
      
      <Menu
        id="sort-menu"
        anchorEl={sortOrderAnchorEl}
        open={Boolean(sortOrderAnchorEl)}
        onClose={handleSortMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            background: `linear-gradient(135deg, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
            borderRadius: 2,
            boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
          }
        }}
      >
        <MenuItem 
          onClick={() => handleSortChange('name')}
          selected={sortBy === 'name'}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            },
            '&.Mui-selected': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
              '&:hover': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
              }
            }
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>İsme Göre</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleSortChange('performance')}
          selected={sortBy === 'performance'}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            },
            '&.Mui-selected': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
              '&:hover': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
              }
            }
          }}
        >
          <ListItemIcon>
            <TrendingUpIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>Performansa Göre</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleSortChange('hireDate')}
          selected={sortBy === 'hireDate'}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            },
            '&.Mui-selected': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.15),
              '&:hover': {
                backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.2)
              }
            }
          }}
        >
          <ListItemIcon>
            <WorkIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>İşe Başlama Tarihine Göre</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            }
          }}
        >
          <ListItemIcon>
            {sortOrder === 'asc' ? (
              <KeyboardArrowDownIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
            ) : (
              <KeyboardArrowDownIcon 
                fontSize="small" 
                sx={{ 
                  color: ARTEMIS_COLORS.primary,
                  transform: 'rotate(180deg)' 
                }} 
              />
            )}
          </ListItemIcon>
          <ListItemText>{sortOrder === 'asc' ? 'Artan Sıralama (A-Z)' : 'Azalan Sıralama (Z-A)'}</ListItemText>
        </MenuItem>
      </Menu>
      
      <Menu
        id="employee-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            background: `linear-gradient(135deg, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.9)}, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.8)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
            borderRadius: 2,
            boxShadow: `0 10px 25px ${alpha(ARTEMIS_COLORS.primaryDark, 0.15)}`,
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            handleDetailOpen();
            handleMenuClose();
          }}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>Profili Görüntüle</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleMenuClose}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <MailIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>E-posta Gönder</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleMenuClose}
          sx={{ 
            color: ARTEMIS_COLORS.text,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <EmojiEventsIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText>Performans Değerlendirmesi</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleMenuClose}
          sx={{ 
            color: ARTEMIS_COLORS.error,
            '&:hover': {
              backgroundColor: alpha(ARTEMIS_COLORS.error, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <ErrorIcon fontSize="small" sx={{ color: ARTEMIS_COLORS.error }} />
          </ListItemIcon>
          <ListItemText>İşten Çıkar</ListItemText>
        </MenuItem>
      </Menu>
      
      <Box sx={{ mb: 3 }}>
        {viewMode === 'cards' ? renderEmployeeCards() : renderEmployeeTable()}
      </Box>
      
      {renderEmployeeDetail()}

      {/* Yeni Çalışan Ekleme Modal'ı - İyileştirilmiş */}
      <Dialog 
        open={addEmployeeModalOpen} 
        onClose={handleCloseAddEmployeeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.95)}, 
              ${alpha(ARTEMIS_COLORS.cardBg, 0.85)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.5)}`,
            boxShadow: `0 20px 40px ${alpha(ARTEMIS_COLORS.primaryDark, 0.25)}`,
          }
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              color: ARTEMIS_COLORS.primary,
              display: 'flex',
              alignItems: 'center'
            }}>
              <PersonIcon sx={{ mr: 1 }} />
              Yeni Çalışan Ekle
            </Typography>
            <IconButton onClick={handleCloseAddEmployeeModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color={ARTEMIS_COLORS.textLight} sx={{ mb: 3 }}>
            Yeni çalışan bilgilerini doldurun. (*) işaretli alanlar zorunludur.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ad *"
                value={newEmployeeData.first_name}
                onChange={(e) => handleNewEmployeeDataChange('first_name', e.target.value)}
                required
                error={!newEmployeeData.first_name.trim() && newEmployeeData.first_name !== ''}
                helperText={!newEmployeeData.first_name.trim() && newEmployeeData.first_name !== '' ? 'Ad alanı zorunludur' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Soyad *"
                value={newEmployeeData.last_name}
                onChange={(e) => handleNewEmployeeDataChange('last_name', e.target.value)}
                required
                error={!newEmployeeData.last_name.trim() && newEmployeeData.last_name !== ''}
                helperText={!newEmployeeData.last_name.trim() && newEmployeeData.last_name !== '' ? 'Soyad alanı zorunludur' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta *"
                type="email"
                value={newEmployeeData.email}
                onChange={(e) => handleNewEmployeeDataChange('email', e.target.value)}
                required
                error={newEmployeeData.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployeeData.email)}
                helperText={
                  newEmployeeData.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployeeData.email) 
                    ? 'Geçerli bir e-posta adresi giriniz' 
                    : 'örn: ahmet.yilmaz@artemis.com'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={newEmployeeData.phone_number}
                onChange={(e) => handleNewEmployeeDataChange('phone_number', e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                helperText="Opsiyonel - Mobil telefon numarası"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Pozisyon"
                value={newEmployeeData.position}
                onChange={(e) => handleNewEmployeeDataChange('position', e.target.value)}
                helperText="Çalışanın görev tanımını seçiniz"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              >
                <MenuItem value="Teknisyen">Teknisyen</MenuItem>
                <MenuItem value="Kıdemli Teknisyen">Kıdemli Teknisyen</MenuItem>
                <MenuItem value="Teknik Şef">Teknik Şef</MenuItem>
                <MenuItem value="Müdür">Müdür</MenuItem>
                <MenuItem value="Uzman">Uzman</MenuItem>
                <MenuItem value="Müdür Yardımcısı">Müdür Yardımcısı</MenuItem>
                <MenuItem value="Operasyon Uzmanı">Operasyon Uzmanı</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Departman"
                value={newEmployeeData.department}
                onChange={(e) => handleNewEmployeeDataChange('department', e.target.value)}
                helperText="Çalışacağı departmanı seçiniz"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              >
                {Object.keys(DEPARTMENT_COLORS).map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS],
                        mr: 1
                      }} />
                      {dept}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İşe Başlama Tarihi"
                type="date"
                value={newEmployeeData.hire_date}
                onChange={(e) => handleNewEmployeeDataChange('hire_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Çalışanın işe başlayacağı tarih"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: ARTEMIS_COLORS.primary,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: ARTEMIS_COLORS.primary,
                  }
                }}
              />
            </Grid>

            {/* Önizleme Alanı */}
            <Grid item xs={12}>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                background: alpha(ARTEMIS_COLORS.background, 0.5),
                borderRadius: 2,
                border: `1px solid ${alpha(ARTEMIS_COLORS.border, 0.3)}`
              }}>
                <Typography variant="h6" sx={{ mb: 1, color: ARTEMIS_COLORS.primary }}>
                  Önizleme:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: alpha(ARTEMIS_COLORS.primary, 0.1) }}>
                    <PersonIcon sx={{ color: ARTEMIS_COLORS.primary }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {newEmployeeData.first_name || newEmployeeData.last_name 
                        ? `${newEmployeeData.first_name} ${newEmployeeData.last_name}`.trim()
                        : 'Ad Soyad'
                      }
                    </Typography>
                    <Typography variant="body2" color={ARTEMIS_COLORS.textLight}>
                      {newEmployeeData.position} - {newEmployeeData.department}
                    </Typography>
                    <Typography variant="caption" color={ARTEMIS_COLORS.textLight}>
                      {newEmployeeData.email || 'e-posta@artemis.com'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={handleCloseAddEmployeeModal}
              sx={{ 
                borderRadius: 2,
                borderColor: alpha(ARTEMIS_COLORS.primary, 0.5),
                color: ARTEMIS_COLORS.primary,
                '&:hover': {
                  borderColor: ARTEMIS_COLORS.primary,
                  backgroundColor: alpha(ARTEMIS_COLORS.primary, 0.05),
                }
              }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNewEmployee}
              disabled={
                !newEmployeeData.first_name.trim() || 
                !newEmployeeData.last_name.trim() || 
                !newEmployeeData.email.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployeeData.email)
              }
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(90deg, 
                  ${ARTEMIS_COLORS.primary}, 
                  ${ARTEMIS_COLORS.secondary})`,
                '&:hover': {
                  boxShadow: `0 6px 15px ${alpha(ARTEMIS_COLORS.primaryDark, 0.4)}`,
                },
                '&:disabled': {
                  background: alpha(ARTEMIS_COLORS.textLight, 0.3),
                  color: alpha(ARTEMIS_COLORS.textLight, 0.7)
                }
              }}
            >
              Çalışanı Kaydet
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  </Box>
);
};

export default EmployeesPage;