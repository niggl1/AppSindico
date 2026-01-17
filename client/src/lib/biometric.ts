/**
 * Módulo de Autenticação Biométrica usando Web Authentication API (WebAuthn)
 * Suporta Face ID, Touch ID, Windows Hello e outros autenticadores de plataforma
 */

// Tipos
export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  type: 'public-key';
  createdAt: number;
  deviceName: string;
}

export interface BiometricConfig {
  enabled: boolean;
  credentials: BiometricCredential[];
  requireBiometricOnStart: boolean;
  fallbackToPIN: boolean;
  pinHash?: string;
}

// Constantes
const STORAGE_KEY = 'app-sindico-biometric-config';
const CREDENTIAL_STORAGE_KEY = 'app-sindico-biometric-credentials';

// Verificar suporte a WebAuthn
export function isBiometricSupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}

// Verificar se autenticador de plataforma está disponível
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// Obter tipo de biometria disponível
export async function getBiometricType(): Promise<'face' | 'fingerprint' | 'unknown' | 'none'> {
  if (!await isPlatformAuthenticatorAvailable()) return 'none';
  
  // Detectar tipo baseado no dispositivo
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad/.test(userAgent)) {
    // iOS - Face ID em iPhones X+ ou Touch ID em outros
    if (/iphone (x|1[0-9]|[2-9][0-9])/.test(userAgent)) {
      return 'face';
    }
    return 'fingerprint';
  }
  
  if (/mac/.test(userAgent)) {
    return 'fingerprint'; // Touch ID em Macs
  }
  
  if (/android/.test(userAgent)) {
    return 'fingerprint'; // Maioria dos Android usa impressão digital
  }
  
  if (/windows/.test(userAgent)) {
    return 'face'; // Windows Hello geralmente usa reconhecimento facial
  }
  
  return 'unknown';
}

// Gerar challenge aleatório
function generateChallenge(): Uint8Array {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

// Converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Converter Base64 para ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Obter configuração de biometria
export function getBiometricConfig(): BiometricConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao ler configuração de biometria:', e);
  }
  
  return {
    enabled: false,
    credentials: [],
    requireBiometricOnStart: false,
    fallbackToPIN: true,
  };
}

// Salvar configuração de biometria
export function saveBiometricConfig(config: BiometricConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar configuração de biometria:', e);
  }
}

// Registrar nova credencial biométrica
export async function registerBiometric(
  userId: string,
  userName: string,
  deviceName: string = 'Este dispositivo'
): Promise<{ success: boolean; error?: string; credential?: BiometricCredential }> {
  if (!await isPlatformAuthenticatorAvailable()) {
    return { success: false, error: 'Autenticação biométrica não disponível neste dispositivo' };
  }
  
  try {
    const challenge = generateChallenge();
    
    // Opções de criação de credencial
    const createOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'App Síndico',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };
    
    // Criar credencial
    const credential = await navigator.credentials.create({
      publicKey: createOptions,
    }) as PublicKeyCredential;
    
    if (!credential) {
      return { success: false, error: 'Falha ao criar credencial' };
    }
    
    // Salvar credencial
    const biometricCredential: BiometricCredential = {
      id: credential.id,
      rawId: credential.rawId,
      type: 'public-key',
      createdAt: Date.now(),
      deviceName,
    };
    
    // Atualizar configuração
    const config = getBiometricConfig();
    config.enabled = true;
    config.credentials.push(biometricCredential);
    saveBiometricConfig(config);
    
    // Salvar credencial separadamente (para recuperação)
    saveCredential(biometricCredential);
    
    return { success: true, credential: biometricCredential };
  } catch (error: any) {
    console.error('Erro ao registrar biometria:', error);
    
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Permissão negada. Por favor, permita o uso da biometria.' };
    }
    if (error.name === 'InvalidStateError') {
      return { success: false, error: 'Este dispositivo já está registrado.' };
    }
    
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
}

// Autenticar com biometria
export async function authenticateWithBiometric(): Promise<{ success: boolean; error?: string }> {
  const config = getBiometricConfig();
  
  if (!config.enabled || config.credentials.length === 0) {
    return { success: false, error: 'Biometria não configurada' };
  }
  
  if (!await isPlatformAuthenticatorAvailable()) {
    return { success: false, error: 'Autenticação biométrica não disponível' };
  }
  
  try {
    const challenge = generateChallenge();
    
    // Preparar credenciais permitidas
    const allowCredentials = config.credentials.map(cred => ({
      type: 'public-key' as const,
      id: typeof cred.rawId === 'string' 
        ? base64ToArrayBuffer(cred.rawId as unknown as string)
        : cred.rawId,
      transports: ['internal' as const],
    }));
    
    // Opções de autenticação
    const getOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      allowCredentials,
      userVerification: 'required',
      timeout: 60000,
    };
    
    // Autenticar
    const assertion = await navigator.credentials.get({
      publicKey: getOptions,
    }) as PublicKeyCredential;
    
    if (!assertion) {
      return { success: false, error: 'Falha na autenticação' };
    }
    
    // Verificar se a credencial corresponde
    const matchedCredential = config.credentials.find(c => c.id === assertion.id);
    if (!matchedCredential) {
      return { success: false, error: 'Credencial não reconhecida' };
    }
    
    // Marcar última autenticação
    localStorage.setItem('app-sindico-last-biometric-auth', Date.now().toString());
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro na autenticação biométrica:', error);
    
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Autenticação cancelada ou negada' };
    }
    
    return { success: false, error: error.message || 'Erro na autenticação' };
  }
}

// Salvar credencial
function saveCredential(credential: BiometricCredential): void {
  try {
    const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    const credentials = stored ? JSON.parse(stored) : [];
    
    // Converter rawId para base64 para armazenamento
    const credentialToStore = {
      ...credential,
      rawId: arrayBufferToBase64(credential.rawId),
    };
    
    credentials.push(credentialToStore);
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credentials));
  } catch (e) {
    console.error('Erro ao salvar credencial:', e);
  }
}

// Remover credencial
export function removeCredential(credentialId: string): void {
  const config = getBiometricConfig();
  config.credentials = config.credentials.filter(c => c.id !== credentialId);
  
  if (config.credentials.length === 0) {
    config.enabled = false;
  }
  
  saveBiometricConfig(config);
  
  // Remover do armazenamento separado
  try {
    const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (stored) {
      const credentials = JSON.parse(stored);
      const filtered = credentials.filter((c: any) => c.id !== credentialId);
      localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Erro ao remover credencial:', e);
  }
}

// Desabilitar biometria
export function disableBiometric(): void {
  const config = getBiometricConfig();
  config.enabled = false;
  config.credentials = [];
  saveBiometricConfig(config);
  
  localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
  localStorage.removeItem('app-sindico-last-biometric-auth');
}

// Verificar se precisa autenticar
export function needsBiometricAuth(): boolean {
  const config = getBiometricConfig();
  
  if (!config.enabled || !config.requireBiometricOnStart) {
    return false;
  }
  
  // Verificar última autenticação (válida por 5 minutos)
  const lastAuth = localStorage.getItem('app-sindico-last-biometric-auth');
  if (lastAuth) {
    const lastAuthTime = parseInt(lastAuth, 10);
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - lastAuthTime < fiveMinutes) {
      return false;
    }
  }
  
  return true;
}

// Configurar PIN como fallback
export async function setPIN(pin: string): Promise<void> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const config = getBiometricConfig();
  config.pinHash = hashHex;
  config.fallbackToPIN = true;
  saveBiometricConfig(config);
}

// Verificar PIN
export async function verifyPIN(pin: string): Promise<boolean> {
  const config = getBiometricConfig();
  if (!config.pinHash) return false;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (hashHex === config.pinHash) {
    localStorage.setItem('app-sindico-last-biometric-auth', Date.now().toString());
    return true;
  }
  
  return false;
}

// Hook para React
export function useBiometric() {
  return {
    isSupported: isBiometricSupported,
    isPlatformAvailable: isPlatformAuthenticatorAvailable,
    getBiometricType,
    getConfig: getBiometricConfig,
    saveConfig: saveBiometricConfig,
    register: registerBiometric,
    authenticate: authenticateWithBiometric,
    removeCredential,
    disable: disableBiometric,
    needsAuth: needsBiometricAuth,
    setPIN,
    verifyPIN,
  };
}
