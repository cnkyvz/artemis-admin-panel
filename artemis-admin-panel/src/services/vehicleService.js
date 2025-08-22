// artemis-admin(admin panel)src/services/vehicleService.js 

import apiService from './apiService';

// Vehicle tipi tanımı
export const Vehicle = {};

// Varsayılan araç görselleri
const carImages = {
  "default": "https://www.pngall.com/wp-content/uploads/2016/04/Toyota-Car-PNG-Picture.png",
  "Renault": "https://pngimg.com/d/renault_PNG57.png",
  "Toyota": "https://www.pngall.com/wp-content/uploads/2016/04/Toyota-Car-PNG-Picture.png",
  "Opel": "https://www.pngall.com/wp-content/uploads/13/Opel-Car-Transparent.png",
  "Ford": "https://www.pngall.com/wp-content/uploads/13/Ford-PNG-Photos.png",
  "Hyundai": "https://freepngimg.com/thumb/hyundai/156335-hyundai-santa-car-free-download-image.png",
  "Mercedes": "https://www.pngall.com/wp-content/uploads/13/Mercedes-Benz-PNG-Pic.png",
  "BMW": "https://www.pngall.com/wp-content/uploads/12/BMW-Car-PNG-Image-HD.png"
};

// API Kimlik Bilgileri
const TNB_CREDENTIALS = {
  username: 'suat@artemisaritim.com',
  password: 'artemis1234',
  companyCode: '1704'
};

// Yardımcı fonksiyonlar
const getCarImageByBrand = (brand) => {
  const brandKey = Object.keys(carImages).find(key => 
    brand.toLowerCase().includes(key.toLowerCase())
  );
  return brandKey ? carImages[brandKey] : carImages.default;
};

const determineStatus = (vehicle, position) => {
  if (!position) return 'idle';
  if (position.ignition && position.speed > 0) return 'active';
  if (position.ignition && position.speed === 0) return 'maintenance';
  return 'idle';
};

// SOAP istek gövdelerini oluşturma
const createGetAllVehiclesBody = () => {
  return `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <wsGetAllVehicles xmlns="http://tempuri.org/">
          <User>
            <UserName>${TNB_CREDENTIALS.username}</UserName>
            <Password>${TNB_CREDENTIALS.password}</Password>
            <CompanyCode>${TNB_CREDENTIALS.companyCode}</CompanyCode>
          </User>
        </wsGetAllVehicles>
      </soap:Body>
    </soap:Envelope>
  `;
};

const createGetLastLocationsBody = (deviceId) => {
  return `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <wsGetLastLocations xmlns="http://tempuri.org/">
          <User>
            <UserName>${TNB_CREDENTIALS.username}</UserName>
            <Password>${TNB_CREDENTIALS.password}</Password>
            <CompanyCode>${TNB_CREDENTIALS.companyCode}</CompanyCode>
          </User>
          <DeviceId>${deviceId}</DeviceId>
        </wsGetLastLocations>
      </soap:Body>
    </soap:Envelope>
  `;
};

// Geliştirilmiş XML parsing fonksiyonları
const extractXmlValue = (xmlText, tagName) => {
  const patterns = [
    new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 's'),
    new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's'),
    new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 's')
  ];
  
  for (const pattern of patterns) {
    const match = xmlText.match(pattern);
    if (match && match[1] !== undefined) {
      return match[1].trim();
    }
  }
  return null;
};

const extractAllNodes = (xmlText, tagName) => {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'gs');
  const matches = [...xmlText.matchAll(regex)];
  return matches.map(match => match[0]);
};

// Konum parsing fonksiyonu - sadece hata durumunda log
const parseLocationXML = (xmlResponse, targetDeviceId) => {
  try {
    let locationSection = extractXmlValue(xmlResponse, 'wsGetLastLocationsResult');
    if (!locationSection) {
      return null;
    }
    
    const locationNodes = extractAllNodes(locationSection, 'Location');
    
    for (let i = 0; i < locationNodes.length; i++) {
      const node = locationNodes[i];
      const nodeDeviceId = extractXmlValue(node, 'DeviceId');
      
      if (nodeDeviceId === targetDeviceId) {
        const latitude = parseFloat(extractXmlValue(node, 'Lat') || '0');
        const longitude = parseFloat(extractXmlValue(node, 'Lng') || '0');
        const speed = parseFloat(extractXmlValue(node, 'Speed') || '0');
        const direction = extractXmlValue(node, 'Angle') || extractXmlValue(node, 'Agnle') || '0';
        const mileage = parseFloat(extractXmlValue(node, 'Mileage') || '0');
        const driver = extractXmlValue(node, 'Driver') || '';
        const ignition = extractXmlValue(node, 'Ignition') === '1' || extractXmlValue(node, 'Ignition') === 'true';
        const address = extractXmlValue(node, 'Address') || '';
        const dateStr = extractXmlValue(node, 'Date') || '';
        
        return {
          latitude,
          longitude,
          speed,
          direction,
          date: dateStr || new Date().toLocaleString(),
          ignition,
          address,
          driver,
          mileage
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ XML parsing hatası (${targetDeviceId}):`, error.message);
    return null;
  }
};

// Fallback mekanizması için örnek araç verileri
const SAMPLE_VEHICLES = [
  {
    id: 'v001',
    plate: '34 ART 001',
    model: 'Renault Clio',
    driver: 'Ahmet Yılmaz',
    status: 'active',
    location: 'Levent, İstanbul',
    fuelLevel: 75,
    mileage: 15350,
    lastMaintenance: '15.03.2025',
    nextMaintenance: '15.09.2025',
    imageUrl: 'https://pngimg.com/d/renault_PNG57.png',
    lat: 41.078,
    lng: 29.013,
    speed: 45,
    registrationDate: '10.01.2023',
    ignition: true,
    deviceType: 'Renault'
  },
  {
    id: 'v002',
    plate: '34 ART 002',
    model: 'Toyota Corolla',
    driver: 'Mehmet Kaya',
    status: 'maintenance',
    location: 'Mecidiyeköy, İstanbul',
    fuelLevel: 60,
    mileage: 23450,
    lastMaintenance: '10.03.2025',
    nextMaintenance: '10.09.2025',
    imageUrl: 'https://www.pngall.com/wp-content/uploads/2016/04/Toyota-Car-PNG-Picture.png',
    lat: 41.068,
    lng: 29.023,
    speed: 0,
    registrationDate: '15.02.2023',
    ignition: false,
    deviceType: 'Toyota'
  },
  {
    id: 'v003',
    plate: '34 ART 003',
    model: 'Opel Astra',
    driver: 'Fatma Demir',
    status: 'idle',
    location: 'Şişli, İstanbul',
    fuelLevel: 85,
    mileage: 18750,
    lastMaintenance: '20.02.2025',
    nextMaintenance: '20.08.2025',
    imageUrl: 'https://www.pngall.com/wp-content/uploads/13/Opel-Car-Transparent.png',
    lat: 41.058,
    lng: 29.033,
    speed: 0,
    registrationDate: '05.03.2023',
    ignition: false,
    deviceType: 'Opel'
  }
];

const moveVehicle = (vehicle) => {
  const latChange = (Math.random() - 0.5) * 0.001;
  const lngChange = (Math.random() - 0.5) * 0.001;
  const newLat = vehicle.lat + latChange;
  const newLng = vehicle.lng + lngChange;
  
  let newSpeed = vehicle.speed;
  if (vehicle.ignition) {
    if (vehicle.status === 'active') {
      newSpeed = Math.max(0, vehicle.speed + (Math.random() - 0.5) * 5);
    } else if (vehicle.status === 'maintenance') {
      newSpeed = Math.random() * 5;
    }
  } else {
    newSpeed = 0;
  }
  
  return {
    ...vehicle,
    lat: newLat,
    lng: newLng,
    speed: newSpeed
  };
};

const vehicleService = {
  // TNB Mobile API'sine SOAP isteği gönderme - sadece önemli loglar
  callTNBApi: async (request) => {
    try {
      const response = await apiService.post('/ats-proxy', {
        soapAction: request.soapAction,
        soapBody: request.soapBody
      });
      
      return response;
    } catch (error) {
      console.error('❌ TNB API hatası:', error.message);
      throw new Error('TNB Mobile API isteği başarısız oldu');
    }
  },
  
  // Tüm araçları getirme - özet loglar
  getAllVehicles: async () => {
    try {
      console.log('🚗 TNB Mobile API\'den araçlar alınıyor...');
      
      try {
        // Araç listesini al
        const soapBody = createGetAllVehiclesBody();
        const xmlResponse = await vehicleService.callTNBApi({
          soapAction: 'http://tempuri.org/wsGetAllVehicles',
          soapBody
        });
        
        // XML'i parse et
        const vehicleNodes = extractAllNodes(xmlResponse, 'Vehicles');
        const tnbVehicles = [];
        
        // Araçları işle
        for (const node of vehicleNodes) {
          const deviceId = extractXmlValue(node, 'DeviceId');
          const licensePlate = extractXmlValue(node, 'License_Plate');
          const deviceType = extractXmlValue(node, 'Device_Type');
          
          if (deviceId && licensePlate) {
            tnbVehicles.push({
              deviceId,
              licensePlate,
              deviceType: deviceType || 'Standart'
            });
          }
        }
        
        console.log(`✅ ${tnbVehicles.length} araç bulundu: ${tnbVehicles.map(v => v.licensePlate).join(', ')}`);
        
        if (tnbVehicles.length === 0) {
          throw new Error('TNB API\'den araç verisi alınamadı');
        }
        
        // Konum bilgilerini al
        console.log('📍 Araçların konum bilgileri alınıyor...');
        const allLocationsXml = await vehicleService.getAllVehiclePositions();
        
        // Araçları birleştir
        const vehicles = tnbVehicles.map(tnbVehicle => {
          const position = parseLocationXML(allLocationsXml, tnbVehicle.deviceId);
          
          return {
            id: tnbVehicle.deviceId,
            plate: tnbVehicle.licensePlate,
            model: tnbVehicle.deviceType || 'Standart Araç',
            driver: position?.driver || 'Atanmamış',
            status: determineStatus(tnbVehicle, position),
            location: position?.address || 'Bilinmiyor',
            fuelLevel: Math.floor(Math.random() * 100),
            mileage: position?.mileage || 0,
            lastMaintenance: '15.03.2025',
            nextMaintenance: '15.09.2025',
            imageUrl: getCarImageByBrand(tnbVehicle.deviceType || ''),
            lat: position?.latitude || 41.0082,
            lng: position?.longitude || 29.0335,
            speed: position?.speed || 0,
            registrationDate: '10.01.2023',
            ignition: position?.ignition || false,
            deviceType: tnbVehicle.deviceType || 'Standart'
          };
        });
        
        // Başarı özeti
        const statusCounts = {
          active: vehicles.filter(v => v.status === 'active').length,
          maintenance: vehicles.filter(v => v.status === 'maintenance').length,
          idle: vehicles.filter(v => v.status === 'idle').length,
          withLocation: vehicles.filter(v => v.lat !== 41.0082 || v.lng !== 29.0335).length
        };
        
        console.log(`✅ ${vehicles.length} araç hazırlandı:`, statusCounts);
        return vehicles;
        
      } catch (apiError) {
        console.warn('⚠️ API hatası, örnek verilere geçiliyor:', apiError.message);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedVehicles = SAMPLE_VEHICLES.map(vehicle => moveVehicle(vehicle));
        
        console.log(`✅ ${updatedVehicles.length} örnek araç yüklendi (Fallback)`);
        return updatedVehicles;
      }
    } catch (error) {
      console.error('❌ Araçlar getirilemedi:', error.message);
      throw new Error('Araçlar getirilemedi');
    }
  },
  
  // Tüm araçların konum bilgilerini al - tek log
  getAllVehiclePositions: async () => {
    try {
      // İlk araç için konum bilgisi alarak tüm konum verilerini getir
      const soapBody = createGetLastLocationsBody(''); // Boş deviceId ile tüm konumları al
      const xmlResponse = await vehicleService.callTNBApi({
        soapAction: 'http://tempuri.org/wsGetLastLocations',
        soapBody
      });
      
      return xmlResponse;
      
    } catch (error) {
      console.error('❌ Konum bilgileri alınamadı:', error.message);
      return null;
    }
  },
  
  // Tekil araç konum bilgisi - sadece hata durumunda log
  getVehiclePosition: async (deviceId) => {
    try {
      const soapBody = createGetLastLocationsBody(deviceId);
      const xmlResponse = await vehicleService.callTNBApi({
        soapAction: 'http://tempuri.org/wsGetLastLocations',
        soapBody
      });
      
      const position = parseLocationXML(xmlResponse, deviceId);
      
      if (position) {
        return position;
      } else {
        return null;
      }
      
    } catch (apiError) {
      // Sadece kritik hatalar için log
      const vehicle = SAMPLE_VEHICLES.find(v => v.id === deviceId);
      
      if (!vehicle) {
        return null;
      }
      
      const updatedVehicle = moveVehicle(vehicle);
      
      return {
        latitude: updatedVehicle.lat,
        longitude: updatedVehicle.lng,
        speed: updatedVehicle.speed,
        direction: "0",
        date: new Date().toLocaleString(),
        ignition: updatedVehicle.ignition,
        address: updatedVehicle.location,
        driver: updatedVehicle.driver,
        mileage: updatedVehicle.mileage
      };
    }
  }
};

export default vehicleService;