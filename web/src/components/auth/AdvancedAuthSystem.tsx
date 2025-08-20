'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Tabs, Loading } from '../ui';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Globe, 
  Lock, 
  Unlock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  QrCode,
  Copy,
  Download
} from 'lucide-react';

interface MFASettings {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backupCodes: string[];
  lastUsed: Date | null;
}

interface OAuthProvider {
  name: string;
  id: string;
  icon: string;
  connected: boolean;
  email?: string;
  lastUsed?: Date;
}

interface AuthMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'pending';
}

const AdvancedAuthSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mfa');
  const [mfaSettings, setMfaSettings] = useState<MFASettings>({
    enabled: false,
    method: 'totp',
    backupCodes: ['12345678', '87654321', '11223344', '44332211', '55667788'],
    lastUsed: null
  });
  
  const [oauthProviders] = useState<OAuthProvider[]>([
    { name: 'Google', id: 'google', icon: '🔍', connected: true, email: 'user@gmail.com', lastUsed: new Date() },
    { name: 'Facebook', id: 'facebook', icon: '📘', connected: false },
    { name: 'GitHub', id: 'github', icon: '🐙', connected: true, email: 'user@github.com', lastUsed: new Date(Date.now() - 86400000) }
  ]);

  const [authMethods] = useState<AuthMethod[]>([
    { id: 'password', name: 'Contraseña', description: 'Autenticación con contraseña', icon: <Key className="w-5 h-5" />, status: 'active' },
    { id: 'mfa', name: 'Autenticación de dos factores', description: 'TOTP, SMS o Email', icon: <Smartphone className="w-5 h-5" />, status: 'inactive' },
    { id: 'oauth', name: 'OAuth Social', description: 'Google, Facebook, GitHub', icon: <Globe className="w-5 h-5" />, status: 'active' },
    { id: 'biometric', name: 'Biometría', description: 'Huella dactilar o Face ID', icon: <Lock className="w-5 h-5" />, status: 'pending' }
  ]);

  const [showQR, setShowQR] = useState(false);
  const [qrCode] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=');

  const handleEnableMFA = () => {
    setMfaSettings(prev => ({ ...prev, enabled: true }));
    setShowQR(true);
  };

  const handleDisableMFA = () => {
    setMfaSettings(prev => ({ ...prev, enabled: false }));
    setShowQR(false);
  };

  const handleLinkOAuth = (providerId: string) => {
    // Simular vinculación de OAuth
    console.log(`Vinculando ${providerId}...`);
  };

  const handleUnlinkOAuth = (providerId: string) => {
    // Simular desvinculación de OAuth
    console.log(`Desvinculando ${providerId}...`);
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Mostrar toast de confirmación
  };

  const downloadBackupCodes = () => {
    const content = mfaSettings.backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          🔐 Sistema de Autenticación Avanzado
        </h2>
        <p className="text-gray-600 mt-2">
          MFA, OAuth 2.0 y gestión avanzada de seguridad
        </p>
      </div>

      {/* Métodos de Autenticación */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Métodos de Autenticación</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authMethods.map(method => (
            <div key={method.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="text-blue-500">{method.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                method.status === 'active' ? 'bg-green-100 text-green-800' :
                method.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {method.status === 'active' ? 'Activo' :
                 method.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs de Configuración */}
      <Card variant="glass" className="p-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          variant="pills"
          className="w-full"
        >
          <Tabs.Tab value="mfa" label="MFA" icon={<Smartphone className="w-4 h-4" />} />
          <Tabs.Tab value="oauth" label="OAuth" icon={<Globe className="w-4 h-4" />} />
          <Tabs.Tab value="sessions" label="Sesiones" icon={<RefreshCw className="w-4 h-4" />} />
        </Tabs>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'mfa' && (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Estado MFA */}
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${mfaSettings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h4 className="font-medium">Autenticación de dos factores</h4>
                      <p className="text-sm text-gray-600">
                        {mfaSettings.enabled ? 'Habilitada' : 'Deshabilitada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!mfaSettings.enabled ? (
                      <Button onClick={handleEnableMFA} variant="primary" size="sm">
                        <Lock className="w-4 h-4 mr-2" />
                        Habilitar MFA
                      </Button>
                    ) : (
                      <Button onClick={handleDisableMFA} variant="outline" size="sm" className="text-red-600 border-red-600">
                        <Unlock className="w-4 h-4 mr-2" />
                        Deshabilitar
                      </Button>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-6 bg-white/50 rounded-lg"
                  >
                    <h4 className="font-medium mb-4">Configurar TOTP</h4>
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Escanea este código QR con tu app de autenticación
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        Clave secreta: JBSWY3DPEHPK3PXP
                      </p>
                      <Button variant="outline" size="sm" onClick={() => copyBackupCode('JBSWY3DPEHPK3PXP')}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Clave
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Códigos de Respaldo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Códigos de respaldo</h4>
                    <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {mfaSettings.backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-100 p-2 rounded text-center font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Guarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'oauth' && (
              <motion.div
                key="oauth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium mb-4">Proveedores OAuth Conectados</h4>
                
                <div className="space-y-3">
                  {oauthProviders.map(provider => (
                    <div key={provider.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <h5 className="font-medium">{provider.name}</h5>
                          {provider.connected && provider.email && (
                            <p className="text-sm text-gray-600">{provider.email}</p>
                          )}
                          {provider.lastUsed && (
                            <p className="text-xs text-gray-500">
                              Último uso: {provider.lastUsed.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {provider.connected ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUnlinkOAuth(provider.id)}
                              className="text-red-600 border-red-600"
                            >
                              Desvincular
                            </Button>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => handleLinkOAuth(provider.id)}
                            >
                              Vincular
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">¿Por qué vincular cuentas?</p>
                      <p>Vincula tus cuentas sociales para un acceso más rápido y seguro. Puedes usar cualquiera de ellas para iniciar sesión.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium mb-4">Sesiones Activas</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h5 className="font-medium">Sesión Actual</h5>
                        <p className="text-sm text-gray-600">Chrome en Windows 11</p>
                        <p className="text-xs text-gray-500">IP: 192.168.1.100 • Última actividad: Ahora</p>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">Activa</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h5 className="font-medium">Móvil Android</h5>
                        <p className="text-sm text-gray-600">Samsung Galaxy S21</p>
                        <p className="text-xs text-gray-500">IP: 192.168.1.101 • Última actividad: Hace 2 horas</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                      Cerrar Sesión
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div>
                        <h5 className="font-medium">Safari en macOS</h5>
                        <p className="text-sm text-gray-600">MacBook Pro</p>
                        <p className="text-xs text-gray-500">IP: 192.168.1.102 • Última actividad: Hace 1 día</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Seguridad de sesiones</p>
                      <p>Revisa regularmente tus sesiones activas y cierra las que no reconozcas. Las sesiones inactivas se cierran automáticamente después de 30 días.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Estadísticas de Seguridad */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-semibold">Estadísticas de Seguridad</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Métodos Activos</p>
            <p className="font-semibold text-lg text-green-600">3/4</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Último Login</p>
            <p className="font-semibold text-lg">Hace 2h</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sesiones Activas</p>
            <p className="font-semibold text-lg text-blue-600">3</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Score Seguridad</p>
            <p className="font-semibold text-lg text-green-600">95/100</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedAuthSystem;