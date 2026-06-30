import { useRef, useState } from 'react'
import {
  Upload,
  Download,
  ShieldCheck,
  AlertTriangle,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'

type Settings = {
  stripMetadata: boolean
  applyNoise: boolean
  noiseLevel: number
  contrast: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function App() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  const [settings, setSettings] = useState<Settings>({
    stripMetadata: true,
    applyNoise: true,
    noiseLevel: 15,
    contrast: 105,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File | undefined): string | null => {
    if (!file) return 'No se detectó ningún archivo.'
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo JPG, PNG y WEBP.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo excede el límite de seguridad de 10MB.'
    }
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    setFileName(sanitizedName)
    return null
  }

  const loadFile = (file: File | undefined) => {
    setError(null)
    setProcessedImage(null)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => setOriginalImage(img)
      img.onerror = () => {
        setError('El archivo parece estar corrupto o no es una imagen válida.')
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    loadFile(e.dataTransfer.files?.[0])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const processImage = () => {
    if (!originalImage || !canvasRef.current) return

    setIsProcessing(true)
    setError(null)

    setTimeout(() => {
      try {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('Canvas no disponible')

        canvas.width = originalImage.width
        canvas.height = originalImage.height

        ctx.filter = `contrast(${settings.contrast}%)`
        ctx.drawImage(originalImage, 0, 0)

        if (settings.applyNoise) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * settings.noiseLevel
            data[i] = Math.min(255, Math.max(0, data[i] + noise))
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
          }
          ctx.putImageData(imageData, 0, 0)
        }

        const processedDataUrl = canvas.toDataURL('image/png')
        setProcessedImage(processedDataUrl)
      } catch (err) {
        console.error('Error procesando imagen:', err)
        setError('Ocurrió un error al procesar la imagen de forma segura.')
      } finally {
        setIsProcessing(false)
      }
    }, 100)
  }

  const downloadImage = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.href = processedImage
    link.download = `sanitized_${fileName || 'image.png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setError(null)
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 w-8 h-8" />
              Procesador Aislado de Imágenes
            </h1>
            <p className="text-gray-400 mt-1">
              Limpieza de metadatos y ofuscación de marcas de agua mediante Client-Side Processing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            HTTPS / END-TO-END SECURE
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-gray-900/50 transition-all bg-gray-900"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Subir Imagen</h3>
              <p className="text-sm text-gray-400 mb-4">Arrastra o haz clic. (JPG, PNG, WEBP - Max 10MB)</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
              />
              <button
                type="button"
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700"
              >
                Seleccionar Archivo
              </button>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
                <Settings className="w-5 h-5 text-gray-400" />
                Parámetros de Ofuscación
              </h3>

              <div className="space-y-5">
                <label className="flex items-center justify-between cursor-not-allowed opacity-80">
                  <span className="text-sm">Limpieza EXIF/Metadatos</span>
                  <input
                    type="checkbox"
                    checked={settings.stripMetadata}
                    readOnly
                    className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
                <p className="text-xs text-gray-500 -mt-3">Forzado por seguridad al procesar en Canvas.</p>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm">Inyección de Ruido Fino</span>
                  <input
                    type="checkbox"
                    name="applyNoise"
                    checked={settings.applyNoise}
                    onChange={handleSettingChange}
                    className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>

                {settings.applyNoise && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Nivel de Ruido</span>
                      <span>{settings.noiseLevel}%</span>
                    </div>
                    <input
                      type="range"
                      name="noiseLevel"
                      min="1"
                      max="50"
                      value={settings.noiseLevel}
                      onChange={handleSettingChange}
                      className="w-full accent-emerald-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Ajuste de Contraste</span>
                    <span>{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    name="contrast"
                    min="50"
                    max="150"
                    value={settings.contrast}
                    onChange={handleSettingChange}
                    className="w-full accent-emerald-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={processImage}
                disabled={!originalImage || isProcessing}
                className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  !originalImage || isProcessing
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Aplicar Sanitización
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                Vista Previa del Análisis
              </h3>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Entrada (Original)
                  </span>
                  <div className="bg-gray-950 border border-gray-800 rounded-lg flex-grow flex items-center justify-center overflow-hidden min-h-[300px]">
                    {originalImage ? (
                      <img
                        src={originalImage.src}
                        alt="Original"
                        className="max-w-full max-h-[400px] object-contain opacity-70"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm">Esperando carga...</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                    Salida (Sanitizada)
                  </span>
                  <div className="bg-gray-950 border border-gray-800 rounded-lg flex-grow flex items-center justify-center overflow-hidden min-h-[300px] relative">
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Procesada"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm">Esperando procesamiento...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                {originalImage ? (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Empezar de nuevo
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={downloadImage}
                  disabled={!processedImage}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    !processedImage
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  Descargar Resultado Seguro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}