import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Alert, 
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Hata tipi tanımlama
interface ErrorWithMessage {
  message?: string;
}

// 3D Logo Komponenti - CSS kullanarak
const Logo3D: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        perspective: '800px',
        width: 100,
        height: 100,
        margin: '0 auto',
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          animation: 'rotate3d 15s linear infinite',
          '@keyframes rotate3d': {
            '0%': {
              transform: 'rotateY(0deg) translateY(0px)'
            },
            '25%': {
              transform: 'rotateY(90deg) translateY(-10px)'
            },
            '50%': {
              transform: 'rotateY(180deg) translateY(0px)'
            },
            '75%': {
              transform: 'rotateY(270deg) translateY(-10px)'
            },
            '100%': {
              transform: 'rotateY(360deg) translateY(0px)'
            }
          }
        }}
      >
        {/* Ön Yüz */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '20%',
            transform: 'translateZ(20px)',
            boxShadow: `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '20%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
              zIndex: 2,
            }
          }}
        >
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
            A
          </Typography>
        </Box>
        
        {/* Arka Yüz */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.dark,
            borderRadius: '20%',
            transform: 'rotateY(180deg) translateZ(20px)',
            boxShadow: `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '20%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
              zIndex: 2,
            }
          }}
        >
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
            A
          </Typography>
        </Box>
        
        {/* Sağ Yüz */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.light,
            borderRadius: '20%',
            transform: 'rotateY(90deg) translateZ(20px)',
            boxShadow: `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
            opacity: 0.9
          }}
        />
        
        {/* Sol Yüz */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.light,
            borderRadius: '20%',
            transform: 'rotateY(-90deg) translateZ(20px)',
            boxShadow: `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
            opacity: 0.9
          }}
        />
      </Box>
    </Box>
  );
};

// Arka Plan Animasyonu - Sadece CSS ile
const BackgroundAnimation: React.FC = () => {
  const theme = useTheme();
  return (
    <Box 
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {/* Parlayan daireler */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 200 + (i * 50),
            height: 200 + (i * 50),
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4 - (i * 0.05))} 0%, rgba(255,255,255,0) 70%)`,
            borderRadius: '50%',
            filter: 'blur(30px)',
            animation: `float${i} ${15 + (i * 2)}s infinite ease-in-out`,
            top: `${(i * 10) % 80}%`,
            left: `${(i * 15) % 70}%`,
            '@keyframes float1': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(100px, -30px)' }
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-120px, 50px)' }
            },
            '@keyframes float3': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(70px, 120px)' }
            },
            '@keyframes float4': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-100px, -80px)' }
            },
            '@keyframes float5': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(150px, 30px)' }
            }
          }}
        />
      ))}
      
      {/* Dönen geometrik şekiller */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: '30%',
          opacity: 0.4,
          animation: 'rotate1 40s linear infinite',
          '@keyframes rotate1': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: 250,
          height: 250,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: '40%',
          opacity: 0.3,
          animation: 'rotate2 50s linear infinite',
          '@keyframes rotate2': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(-360deg)' }
          }
        }}
      />
    </Box>
  );
};

// Modern Input Component
const ModernInput: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, type, value, onChange, disabled }) => {
  const theme = useTheme();
  
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      variant="outlined"
      margin="normal"
      sx={{
        mb: 2,
        '& .MuiOutlinedInput-root': {
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s',
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }
          }
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: theme.palette.primary.main
          }
        },
        '& .MuiInputBase-input': {
          p: 1.5,
        }
      }}
    />
  );
};

// Modern Button Component
const ModernButton: React.FC<{
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  children: React.ReactNode;
}> = ({ type = "button", disabled = false, loading = false, success = false, children }) => {
  const theme = useTheme();
  
  return (
    <Button
      type={type}
      disabled={disabled}
      variant="contained"
      fullWidth
      sx={{
        p: 1.5,
        borderRadius: 2,
        background: success 
          ? 'linear-gradient(135deg, #10B981, #059669)' 
          : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 25px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
        '&:hover': {
          background: success 
            ? 'linear-gradient(135deg, #059669, #047857)' 
            : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        },
        '&.Mui-disabled': {
          background: success 
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : 'rgba(255, 255, 255, 0.12)',
          color: 'white',
          opacity: success ? 1 : 0.7,
        },
        '&::after': loading ? {} : {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '30%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'shimmer 1.5s infinite',
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' }
          }
        }
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              animation: 'spin 1s linear infinite',
              marginRight: 1,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
          Giriş Yapılıyor...
        </Box>
      ) : success ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: 'white',
              color: '#10B981',
              fontWeight: 'bold',
              marginRight: 1,
              animation: 'scale-in 0.3s forwards',
              '@keyframes scale-in': {
                '0%': { transform: 'scale(0)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            ✓
          </Box>
          Giriş Başarılı
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

// Ana Login Sayfası
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Başarılı giriş sonrası yönlendirme
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (email && password) {
        setLoading(true);
        setError(null);
        
        // Backend'e login isteği gönder
        const response = await apiService.login(email, password);
        
        console.log('Giriş başarılı:', response);
        
        // Başarılı animasyon göster
        setSuccess(true);
      } else {
        setError('Lütfen e-posta ve şifre girin');
      }
    } catch (error: unknown) {
      console.error('Giriş hatası:', error);
      
      // Hata mesajını güvenli bir şekilde çıkarma
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorWithMessage = error as ErrorWithMessage;
        errorMessage = errorWithMessage.message || 'Bilinmeyen hata';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'Bilinmeyen hata';
      }
      
      setError(errorMessage || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 4 }
      }}
    >
      {/* Arka plan animasyonları */}
      <BackgroundAnimation />
      
      {/* Login kartı */}
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            opacity: 0,
            transform: 'translateY(20px)',
            animation: 'fade-in 0.7s forwards',
            '@keyframes fade-in': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Kenar ışıkları */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              }}
            />
            
            <Logo3D />
            
            <Box
              sx={{
                opacity: 0,
                animation: 'fade-in 0.5s forwards 0.3s',
                '@keyframes fade-in': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}
            >
              <Typography 
                variant="h4" 
                align="center" 
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  mb: 1,
                  textShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
              >
                Admin Paneli
              </Typography>
              
              <Typography 
                variant="body1" 
                align="center" 
                sx={{ 
                  mb: 4, 
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Yönetim paneline erişmek için giriş yapın
              </Typography>
            </Box>
            
            <form onSubmit={handleLogin}>
              <ModernInput
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
              />
              
              <ModernInput
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
              />
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#FCA5A5',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#FCA5A5'
                    },
                    animation: 'slide-in 0.3s forwards',
                    '@keyframes slide-in': {
                      '0%': { opacity: 0, transform: 'translateY(-10px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mt: 1 }}>
                <ModernButton 
                  type="submit" 
                  disabled={loading || success}
                  loading={loading}
                  success={success}
                >
                  Giriş Yap
                </ModernButton>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;