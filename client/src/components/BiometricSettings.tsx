/**
 * Componente de Configuração de Autenticação Biométrica
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Fingerprint, 
  ScanFace, 
  Shield, 
  Smartphone, 
  Trash2, 
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  getBiometricType,
  getBiometricConfig,
  saveBiometricConfig,
  registerBiometric,
  removeCredential,
  disableBiometric,
  setPIN,
  BiometricConfig,
} from '@/lib/biometric';
import { useAuth } from '@/contexts/AuthContext';

export function BiometricSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSupported, setIsSupported] = useState(false);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'unknown' | 'none'>('none');
  const [config, setConfig] = useState<BiometricConfig>(getBiometricConfig());
  const [isLoading, setIsLoading] = useState(false);
  
  // Modais
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [credentialToRemove, setCredentialToRemove] = useState<string | null>(null);
  
  // Estados de formulário
  const [deviceName, setDeviceName] = useState('');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Verificar suporte na montagem
  useEffect(() => {
    const checkSupport = async () => {
      setIsSupported(isBiometricSupported());
      setIsPlatformAvailable(await isPlatformAuthenticatorAvailable());
      setBiometricType(await getBiometricType());
    };
    checkSupport();
  }, []);
  
  // Obter ícone baseado no tipo de biometria
  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'face':
        return <ScanFace className="h-6 w-6" />;
      case 'fingerprint':
        return <Fingerprint className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };
  
  // Obter nome do tipo de biometria
  const getBiometricName = () => {
    switch (biometricType) {
      case 'face':
        return 'Face ID / Reconhecimento Facial';
      case 'fingerprint':
        return 'Touch ID / Impressão Digital';
      default:
        return 'Autenticação Biométrica';
    }
  };
  
  // Registrar nova biometria
  const handleRegister = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await registerBiometric(
        user.id.toString(),
        user.name || 'Usuário',
        deviceName || 'Este dispositivo'
      );
      
      if (result.success) {
        toast({
          title: 'Biometria registrada!',
          description: 'Seu dispositivo foi configurado para autenticação biométrica.',
        });
        setConfig(getBiometricConfig());
        setShowRegisterModal(false);
        setDeviceName('');
      } else {
        toast({
          title: 'Erro ao registrar',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao registrar a biometria.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remover credencial
  const handleRemoveCredential = () => {
    if (!credentialToRemove) return;
    
    removeCredential(credentialToRemove);
    setConfig(getBiometricConfig());
    setShowRemoveModal(false);
    setCredentialToRemove(null);
    
    toast({
      title: 'Dispositivo removido',
      description: 'O dispositivo foi removido da autenticação biométrica.',
    });
  };
  
  // Desabilitar biometria
  const handleDisable = () => {
    disableBiometric();
    setConfig(getBiometricConfig());
    
    toast({
      title: 'Biometria desabilitada',
      description: 'A autenticação biométrica foi desabilitada.',
    });
  };
  
  // Configurar PIN
  const handleSetPIN = async () => {
    if (pin.length < 4) {
      toast({
        title: 'PIN muito curto',
        description: 'O PIN deve ter pelo menos 4 dígitos.',
        variant: 'destructive',
      });
      return;
    }
    
    if (pin !== confirmPin) {
      toast({
        title: 'PINs não conferem',
        description: 'Os PINs digitados não são iguais.',
        variant: 'destructive',
      });
      return;
    }
    
    await setPIN(pin);
    setConfig(getBiometricConfig());
    setShowPINModal(false);
    setPinValue('');
    setConfirmPin('');
    
    toast({
      title: 'PIN configurado!',
      description: 'Seu PIN foi configurado como alternativa à biometria.',
    });
  };
  
  // Alternar configurações
  const toggleRequireOnStart = () => {
    const newConfig = { ...config, requireBiometricOnStart: !config.requireBiometricOnStart };
    saveBiometricConfig(newConfig);
    setConfig(newConfig);
  };
  
  const toggleFallbackToPIN = () => {
    const newConfig = { ...config, fallbackToPIN: !config.fallbackToPIN };
    saveBiometricConfig(newConfig);
    setConfig(newConfig);
  };
  
  // Se não suportado
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação Biométrica
          </CardTitle>
          <CardDescription>
            Configure Face ID ou Touch ID para acesso rápido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta autenticação biométrica. 
              Tente usar um navegador mais recente ou o aplicativo instalado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getBiometricIcon()}
            Autenticação Biométrica
          </CardTitle>
          <CardDescription>
            Configure {getBiometricName()} para acesso rápido e seguro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {config.enabled ? (
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {config.enabled ? 'Biometria Ativada' : 'Biometria Desativada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {config.enabled 
                    ? `${config.credentials.length} dispositivo(s) registrado(s)`
                    : 'Configure para acesso mais rápido'}
                </p>
              </div>
            </div>
            
            {!config.enabled && isPlatformAvailable && (
              <Button onClick={() => setShowRegisterModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ativar
              </Button>
            )}
          </div>
          
          {/* Dispositivos registrados */}
          {config.enabled && config.credentials.length > 0 && (
            <div className="space-y-3">
              <Label>Dispositivos Registrados</Label>
              {config.credentials.map((cred) => (
                <div 
                  key={cred.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{cred.deviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrado em {new Date(cred.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCredentialToRemove(cred.id);
                      setShowRemoveModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              {isPlatformAvailable && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowRegisterModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Dispositivo
                </Button>
              )}
            </div>
          )}
          
          {/* Configurações */}
          {config.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <Label>Configurações</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-on-start">Exigir ao abrir o app</Label>
                  <p className="text-sm text-muted-foreground">
                    Solicitar autenticação ao iniciar o aplicativo
                  </p>
                </div>
                <Switch
                  id="require-on-start"
                  checked={config.requireBiometricOnStart}
                  onCheckedChange={toggleRequireOnStart}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fallback-pin">Permitir PIN como alternativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar PIN quando biometria não estiver disponível
                  </p>
                </div>
                <Switch
                  id="fallback-pin"
                  checked={config.fallbackToPIN}
                  onCheckedChange={toggleFallbackToPIN}
                />
              </div>
              
              {config.fallbackToPIN && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPINModal(true)}
                  className="w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {config.pinHash ? 'Alterar PIN' : 'Configurar PIN'}
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                onClick={handleDisable}
                className="w-full"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Desabilitar Biometria
              </Button>
            </div>
          )}
          
          {/* Aviso se plataforma não disponível */}
          {!isPlatformAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Autenticação biométrica não está disponível neste dispositivo. 
                Instale o aplicativo ou use um dispositivo com suporte a biometria.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de Registro */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getBiometricIcon()}
              Registrar {getBiometricName()}
            </DialogTitle>
            <DialogDescription>
              Configure a autenticação biométrica para acesso rápido e seguro ao aplicativo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Nome do Dispositivo (opcional)</Label>
              <Input
                id="device-name"
                placeholder="Ex: Meu iPhone, Notebook do Trabalho"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ajuda a identificar este dispositivo na lista
              </p>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Você será solicitado a usar {biometricType === 'face' ? 'reconhecimento facial' : 'sua impressão digital'} para confirmar o registro.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Biometria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de PIN */}
      <Dialog open={showPINModal} onOpenChange={setShowPINModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurar PIN
            </DialogTitle>
            <DialogDescription>
              Configure um PIN de 4-6 dígitos como alternativa à biometria.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Digite o PIN"
                value={pin}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirmar PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Confirme o PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPINModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSetPIN}>
              Salvar PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Remoção */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Dispositivo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este dispositivo da autenticação biométrica?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveCredential}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BiometricSettings;
