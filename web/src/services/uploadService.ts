import { api } from './api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  compressImages?: boolean;
  imageQuality?: number;
  maxFileSize?: number; // en bytes
  allowedTypes?: string[];
}

export interface ValidationRules {
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles?: number;
}

export class MediaUploadService {
  private static instance: MediaUploadService;
  private defaultOptions: UploadOptions = {
    compressImages: true,
    imageQuality: 0.8,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  };

  public static getInstance(): MediaUploadService {
    if (!MediaUploadService.instance) {
      MediaUploadService.instance = new MediaUploadService();
    }
    return MediaUploadService.instance;
  }

  /**
   * Valida un archivo según las reglas especificadas
   */
  validateFile(file: File, rules: ValidationRules): { isValid: boolean; error?: string } {
    // Verificar tamaño
    if (file.size > rules.maxFileSize) {
      return {
        isValid: false,
        error: `El archivo es muy grande. Máximo ${this.formatFileSize(rules.maxFileSize)}`,
      };
    }

    // Verificar tipo
    if (!rules.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${rules.allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Comprime una imagen antes del upload
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob con calidad especificada
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload de imagen con progress tracking
   */
  async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ url: string; filename: string }> {
    const opts = { ...this.defaultOptions, ...options };

    // Validar archivo
    const validation = this.validateFile(file, {
      maxFileSize: opts.maxFileSize!,
      allowedTypes: opts.allowedTypes!,
    });

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Comprimir si es imagen y está habilitado
    let fileToUpload = file;
    if (opts.compressImages && file.type.startsWith('image/')) {
      try {
        fileToUpload = await this.compressImage(file, opts.imageQuality);
      } catch (error) {
        console.warn('Error al comprimir imagen, subiendo original:', error);
      }
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('image', fileToUpload);

    try {
      const response = await api.upload.uploadImage(formData, {
        onUploadProgress: (progressEvent) => {
          if (opts.onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            opts.onProgress(progress);
          }
        },
      });

      return {
        url: response.url,
        filename: fileToUpload.name,
      };
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error}`);
    }
  }

  /**
   * Upload de video con progress tracking
   */
  async uploadVideo(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ url: string; filename: string }> {
    const opts = { ...this.defaultOptions, ...options };

    // Configurar reglas específicas para videos
    const videoRules: ValidationRules = {
      maxFileSize: 100 * 1024 * 1024, // 100MB para videos
      allowedTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
    };

    // Validar archivo
    const validation = this.validateFile(file, videoRules);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await api.upload.uploadVideo(formData, {
        onUploadProgress: (progressEvent) => {
          if (opts.onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            opts.onProgress(progress);
          }
        },
      });

      return {
        url: response.url,
        filename: file.name,
      };
    } catch (error) {
      throw new Error(`Error al subir video: ${error}`);
    }
  }

  /**
   * Upload de documento
   */
  async uploadDocument(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ url: string; filename: string }> {
    const opts = { ...this.defaultOptions, ...options };

    // Configurar reglas específicas para documentos
    const documentRules: ValidationRules = {
      maxFileSize: 10 * 1024 * 1024, // 10MB para documentos
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    };

    // Validar archivo
    const validation = this.validateFile(file, documentRules);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await api.upload.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          if (opts.onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            opts.onProgress(progress);
          }
        },
      });

      return {
        url: response.url,
        filename: file.name,
      };
    } catch (error) {
      throw new Error(`Error al subir documento: ${error}`);
    }
  }

  /**
   * Upload múltiple optimizado
   */
  async uploadMultiple(
    files: File[],
    options: UploadOptions = {}
  ): Promise<{ url: string; filename: string }[]> {
    const opts = { ...this.defaultOptions, ...options };
    const results: { url: string; filename: string }[] = [];

    // Procesar archivos en paralelo (máximo 3 a la vez)
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file) => {
        try {
          if (file.type.startsWith('image/')) {
            return await this.uploadImage(file, opts);
          } else if (file.type.startsWith('video/')) {
            return await this.uploadVideo(file, opts);
          } else {
            return await this.uploadDocument(file, opts);
          }
        } catch (error) {
          console.error(`Error al subir ${file.name}:`, error);
          throw error;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Upload con progress tracking detallado
   */
  async uploadWithProgress(
    file: File,
    onProgress: (progress: UploadProgress) => void,
    options: UploadOptions = {}
  ): Promise<{ url: string; filename: string }> {
    const opts = { ...this.defaultOptions, ...options, onProgress };

    if (file.type.startsWith('image/')) {
      return this.uploadImage(file, opts);
    } else if (file.type.startsWith('video/')) {
      return this.uploadVideo(file, opts);
    } else {
      return this.uploadDocument(file, opts);
    }
  }

  /**
   * Previsualizar archivo antes del upload
   */
  async previewFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
      } else {
        // Para documentos, mostrar icono genérico
        resolve('/icons/document.svg');
      }
    });
  }

  /**
   * Obtener información del archivo
   */
  getFileInfo(file: File): {
    name: string;
    size: string;
    type: string;
    extension: string;
  } {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type || 'application/octet-stream',
      extension: file.name.split('.').pop()?.toLowerCase() || '',
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpiar archivos temporales
   */
  cleanup(): void {
    // Limpiar URLs de objetos creados para preview
    // Esta función se puede expandir según necesidades específicas
  }
}

// Exportar instancia singleton
export const uploadService = MediaUploadService.getInstance();

// Hooks personalizados para React
import { useState } from 'react';

export const useUploadProgress = () => {
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });

  const resetProgress = () => {
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  };

  return { progress, setProgress, resetProgress };
};

// Tipos para uso con React
export interface UseUploadOptions {
  onSuccess?: (result: { url: string; filename: string }) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { progress, setProgress, resetProgress } = useUploadProgress();

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError(null);
    resetProgress();

    try {
      const result = await uploadService.uploadImage(file, {
        onProgress: (progress) => {
          setProgress(progress);
          options.onProgress?.(progress);
        },
      });

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setError(null);
    resetProgress();

    try {
      const result = await uploadService.uploadVideo(file, {
        onProgress: (progress) => {
          setProgress(progress);
          options.onProgress?.(progress);
        },
      });

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    resetProgress();

    try {
      const results = await uploadService.uploadMultiple(files, {
        onProgress: (progress) => {
          setProgress(progress);
          options.onProgress?.(progress);
        },
      });

      results.forEach((result) => options.onSuccess?.(result));
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    uploadVideo,
    uploadMultiple,
    isUploading,
    error,
    progress,
    resetProgress,
  };
};
