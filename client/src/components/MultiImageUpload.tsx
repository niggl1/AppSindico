import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, X, GripVertical, Image as ImageIcon, Zap, Pencil } from "lucide-react";
import { toast } from "sonner";
import { compressImage, formatFileSize, COMPRESSION_PRESETS, getFileExtension, initWebPSupport } from "@/lib/imageCompressor";
import { useEffect } from "react";
import FabricImageEditor from "./FabricImageEditor";

interface ImageItem {
  id?: number;
  url: string;
  legenda?: string;
  isNew?: boolean;
}

interface MultiImageUploadProps {
  value?: string[];
  images?: ImageItem[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  enableCompression?: boolean;
  compressionPreset?: keyof typeof COMPRESSION_PRESETS;
  enableEditor?: boolean;
}

interface CompressionStats {
  totalOriginal: number;
  totalCompressed: number;
  filesProcessed: number;
  totalFiles: number;
}

export default function MultiImageUpload({
  value,
  images: imagesProp,
  onChange,
  maxImages = 10,
  label = "Imagens",
  enableCompression = true,
  compressionPreset = "gallery",
  enableEditor = true,
}: MultiImageUploadProps) {
  // Suportar tanto value (array de strings) quanto images (array de ImageItem)
  const normalizedImages: ImageItem[] = (value || imagesProp || []).map((item) =>
    typeof item === "string" ? { url: item } : item
  );
  const images = normalizedImages;
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("webp");
  
  // Estado do editor de imagem
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");

  // Inicializar verificação de suporte WebP
  useEffect(() => {
    initWebPSupport();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast.error(`Máximo de ${maxImages} imagens permitidas`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploading(true);
      setCompressionStats(null);

      try {
        const newImages: ImageItem[] = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        // Inicializar estatísticas
        if (enableCompression) {
          setCompressing(true);
          setCompressionStats({
            totalOriginal: 0,
            totalCompressed: 0,
            filesProcessed: 0,
            totalFiles: filesToUpload.length,
          });
        }

        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} não é uma imagem válida`);
            continue;
          }

          // Limite aumentado para 10MB (antes da compressão)
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} excede o limite de 10MB`);
            continue;
          }

          let fileToUpload: Blob = file;
          let fileType = file.type;

          // Comprimir imagem se habilitado (exceto GIFs)
          if (enableCompression && file.type !== "image/gif") {
            try {
              const compressionOptions = COMPRESSION_PRESETS[compressionPreset];
              const result = await compressImage(file, compressionOptions);
              
              fileToUpload = result.blob;
              fileType = `image/${result.format}`;
              setOutputFormat(result.format);
              totalOriginal += result.originalSize;
              totalCompressed += result.compressedSize;

              // Atualizar estatísticas
              setCompressionStats({
                totalOriginal,
                totalCompressed,
                filesProcessed: i + 1,
                totalFiles: filesToUpload.length,
              });
            } catch (compressionError) {
              console.warn("Erro na compressão, usando original:", compressionError);
              totalOriginal += file.size;
              totalCompressed += file.size;
            }
          } else {
            totalOriginal += file.size;
            totalCompressed += file.size;
          }

          // Converter para base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileToUpload);
          });

          newImages.push({ url: base64, isNew: true });
        }

        setCompressing(false);

        if (newImages.length > 0) {
          // Retornar sempre array de strings
          const currentUrls = value || images.map(img => img.url);
          onChange([...currentUrls, ...newImages.map(img => img.url)]);
          
          // Mostrar estatísticas de compressão
          if (enableCompression && totalOriginal > 0) {
            const savedBytes = totalOriginal - totalCompressed;
            const savedPercent = ((savedBytes / totalOriginal) * 100).toFixed(0);
            
            if (savedBytes > 1024) {
              const formatLabel = outputFormat === "webp" ? " (WebP)" : "";
              toast.success(
                `${newImages.length} imagem(ns) otimizada(s)${formatLabel}: ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)} (-${savedPercent}%)`,
                { duration: 4000 }
              );
            } else {
              toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
            }
          } else {
            toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
          }
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        toast.error("Erro ao fazer upload das imagens");
      } finally {
        setUploading(false);
        setCompressing(false);
        setCompressionStats(null);
        e.target.value = "";
      }
    },
    [images, maxImages, onChange, value, enableCompression, compressionPreset]
  );

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages.map(img => img.url));
  };

  const handleLegendaChange = (index: number, legenda: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], legenda };
    onChange(newImages.map(img => img.url));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onChange(newImages.map(img => img.url));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Funções do editor de imagem
  const handleOpenEditor = (index: number) => {
    setEditingImageIndex(index);
    setEditingImageUrl(images[index].url);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingImageIndex(null);
    setEditingImageUrl("");
  };

  const handleSaveEditedImage = (editedImageBase64: string) => {
    if (editingImageIndex === null) return;
    
    const newImages = [...images];
    newImages[editingImageIndex] = { 
      ...newImages[editingImageIndex], 
      url: editedImageBase64 
    };
    onChange(newImages.map(img => img.url));
    toast.success("Imagem editada com sucesso!");
    handleCloseEditor();
  };

  const progressPercent = compressionStats
    ? (compressionStats.filesProcessed / compressionStats.totalFiles) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>{label}</Label>
          {enableCompression && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Compressão automática
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Barra de progresso de compressão */}
      {compressing && compressionStats && (
        <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              A otimizar imagens...
            </span>
            <span className="text-muted-foreground">
              {compressionStats.filesProcessed}/{compressionStats.totalFiles}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {compressionStats.totalOriginal > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Original: {formatFileSize(compressionStats.totalOriginal)}</span>
              <span className="text-primary font-medium">
                → {formatFileSize(compressionStats.totalCompressed)}
              </span>
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group border rounded-lg overflow-hidden bg-muted ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
            >
              <div className="aspect-square">
                <img
                  src={img.url}
                  alt={img.legenda || `Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
              
              {/* Botões de ação */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-gray-800/80 text-white rounded-full hover:bg-gray-900 transition-colors"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-2">
                <Input
                  placeholder="Legenda (opcional)"
                  value={img.legenda || ""}
                  onChange={(e) => handleLegendaChange(index, e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || compressing}
            className="hidden"
            id="multi-image-upload"
          />
          <label htmlFor="multi-image-upload" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading || compressing}
              asChild
            >
              <span>
                {uploading || compressing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {compressing ? "A otimizar..." : "A carregar..."}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Imagens
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}

      {images.length === 0 && !compressing && (
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-gradient-to-b from-blue-50/50 to-white">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-blue-800 mb-1">
            📷 Carregar Imagens
          </h4>
          <p className="text-sm text-blue-700">
            Carregue uma ou várias imagens de uma só vez
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Arraste imagens ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo {maxImages} imagens, 10MB cada
          </p>
          {enableCompression && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Imagens serão otimizadas automaticamente
            </p>
          )}
        </div>
      )}

      {/* Modal do Editor de Imagem com Fabric.js */}
      {enableEditor && (
        <FabricImageEditor
          isOpen={editorOpen}
          onClose={handleCloseEditor}
          imageUrl={editingImageUrl}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
}
