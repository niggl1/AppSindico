/**
 * Tela de Bloqueio Biométrico
 * Exibida quando o app requer autenticação biométrica
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Fingerprint, 
  ScanFace, 
  Shield, 
  Key,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  getBiometricType,
  getBiometricConfig,
  authenticateWithBiometric,
  verifyPIN,
} from '@/lib/biometric';

interface BiometricLockScreenProps {
  onUnlock: () => void;
  onCancel?: () => void;
}

export function BiometricLockScreen({ onUnlock, onCancel }: BiometricLockScreenProps) {
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'unknown' | 'none'>('unknown');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const config = getBiometricConfig();
  
  useEffect(() => {
    const init = async () => {
      const type = await getBiometricType();
      setBiometricType(type);
      
      // Tentar autenticar automaticamente
      if (type !== 'none') {
        handleBiometricAuth();
      }
    };
    init();
  }, []);
  
  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'face':
        return <ScanFace className="h-16 w-16" />;
      case 'fingerprint':
        return <Fingerprint className="h-16 w-16" />;
      default:
        return <Shield className="h-16 w-16" />;
    }
  };
  
  const getBiometricName = () => {
    switch (biometricType) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID';
      default:
        return 'Biometria';
    }
  };
  
  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const result = await authenticateWithBiometric();
      
      if (result.success) {
        onUnlock();
      } else {
        setError(result.error || 'Falha na autenticação');
        setAttempts(prev => prev + 1);
      }
    } catch (err) {
      setError('Erro ao autenticar');
      setAttempts(prev => prev + 1);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handlePINAuth = async () => {
    if (pin.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos');
      return;
    }
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const isValid = await verifyPIN(pin);
      
      if (isValid) {
        onUnlock();
      } else {
        setError('PIN incorreto');
        setAttempts(prev => prev + 1);
        setPin('');
      }
    } catch (err) {
      setError('Erro ao verificar PIN');
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length >= 4) {
      handlePINAuth();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full text-primary">
            {showPIN ? <Key className="h-16 w-16" /> : getBiometricIcon()}
          </div>
          <CardTitle className="text-2xl">
            {showPIN ? 'Digite seu PIN' : `Use ${getBiometricName()}`}
          </CardTitle>
          <CardDescription>
            {showPIN 
              ? 'Digite seu PIN para desbloquear o aplicativo'
              : 'Autentique-se para acessar o App Síndico'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {showPIN ? (
            <>
              <div className="space-y-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePINAuth}
                disabled={isAuthenticating || pin.length < 4}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Desbloquear'
                )}
              </Button>
              
              {biometricType !== 'none' && (
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setShowPIN(false);
                    setPin('');
                    setError(null);
                  }}
                >
                  Usar {getBiometricName()}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                className="w-full h-14 text-lg" 
                onClick={handleBiometricAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    {getBiometricIcon()}
                    <span className="ml-2">Usar {getBiometricName()}</span>
                  </>
                )}
              </Button>
              
              {config.fallbackToPIN && config.pinHash && (
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setShowPIN(true);
                    setError(null);
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Usar PIN
                </Button>
              )}
            </>
          )}
          
          {onCancel && (
            <Button 
              variant="link" 
              className="w-full text-muted-foreground"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          
          {attempts >= 3 && (
            <p className="text-center text-sm text-muted-foreground">
              Muitas tentativas. Tente novamente mais tarde ou faça login novamente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BiometricLockScreen;
