import { useEffect, useRef, useState } from "react";
import { User, MessageCircle, BarChart2, ChevronDown, Search, Users, ArrowRight, Check, X } from "lucide-react";

declare global {
  interface Window {
    fbq?: (action: "track", eventName: "Lead") => void;
  }
}

function trackMetaLead(): void {
  try {
    window.fbq?.("track", "Lead");
  } catch {
    // Analytics must never interrupt the form action.
  }
}

const PAISES = [
  { nombre: "Andorra", codigo: "+376", bandera: "🇦🇩" },
  { nombre: "Argentina", codigo: "+54", bandera: "🇦🇷" },
  { nombre: "Bolivia", codigo: "+591", bandera: "🇧🇴" },
  { nombre: "Brasil", codigo: "+55", bandera: "🇧🇷" },
  { nombre: "Canadá", codigo: "+1", bandera: "🇨🇦" },
  { nombre: "Chile", codigo: "+56", bandera: "🇨🇱" },
  { nombre: "Colombia", codigo: "+57", bandera: "🇨🇴" },
  { nombre: "Costa Rica", codigo: "+506", bandera: "🇨🇷" },
  { nombre: "Cuba", codigo: "+53", bandera: "🇨🇺" },
  { nombre: "Ecuador", codigo: "+593", bandera: "🇪🇨" },
  { nombre: "El Salvador", codigo: "+503", bandera: "🇸🇻" },
  { nombre: "España", codigo: "+34", bandera: "🇪🇸" },
  { nombre: "Estados Unidos", codigo: "+1", bandera: "🇺🇸" },
  { nombre: "Guatemala", codigo: "+502", bandera: "🇬🇹" },
  { nombre: "Honduras", codigo: "+504", bandera: "🇭🇳" },
  { nombre: "México", codigo: "+52", bandera: "🇲🇽" },
  { nombre: "Nicaragua", codigo: "+505", bandera: "🇳🇮" },
  { nombre: "Panamá", codigo: "+507", bandera: "🇵🇦" },
  { nombre: "Paraguay", codigo: "+595", bandera: "🇵🇾" },
  { nombre: "Perú", codigo: "+51", bandera: "🇵🇪" },
  { nombre: "República Dominicana", codigo: "+1-809", bandera: "🇩🇴" },
  { nombre: "Uruguay", codigo: "+598", bandera: "🇺🇾" },
  { nombre: "Venezuela", codigo: "+58", bandera: "🇻🇪" },
];

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState(PAISES[4]); // Colombia default
  const [whatsapp, setWhatsapp] = useState("");
  const [operadoCriptos, setOperadoCriptos] = useState<boolean | null>(null);
  const [nivel, setNivel] = useState<string | null>(null);
  const [fuente, setFuente] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paisOpen, setPaisOpen] = useState(false);
  const [buscarPais, setBuscarPais] = useState("");

  const [touched, setTouched] = useState({
    nombre: false,
    whatsapp: false,
    operadoCriptos: false,
    nivel: false,
  });

  const paisesFiltrados = PAISES.filter((p) =>
    p.nombre.toLowerCase().includes(buscarPais.toLowerCase())
  );

  const toggleVideoSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const shouldMute = !video.muted;
    video.muted = shouldMute;
    video.volume = 1;
    setVideoMuted(shouldMute);
    void video.play();
  };

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.muted = false;
      video.volume = 1;
      setVideoMuted(false);
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleVideoFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (video.requestFullscreen) {
      await video.requestFullscreen();
      return;
    }

    const safariVideo = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    safariVideo.webkitEnterFullscreen?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched to trigger visual validation
    setTouched({
      nombre: true,
      whatsapp: true,
      operadoCriptos: true,
      nivel: true,
    });

    const isNombreValid = nombre.trim().length > 0;
    const isWhatsappValid = whatsapp.trim().length >= 6;
    const isCriptosValid = operadoCriptos !== null;
    const isNivelValid = nivel !== null;

    if (!isNombreValid || !isWhatsappValid || !isCriptosValid || !isNivelValid) {
      // Visual cues will show the errors; no need for aggressive global alert.
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          pais: pais.nombre,
          codigoPais: pais.codigo,
          whatsapp: whatsapp.trim(),
          operadoCriptos,
          nivel,
          fuente: fuente ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Error del servidor");
      trackMetaLead();
      setEnviado(true);
      // Redirigir al grupo de WhatsApp después de 3 segundos
      setTimeout(() => {
        window.location.href = "https://chat.whatsapp.com/CZHF8IfmVjHEU63r3RPLu4?s=sw&p=i&mlu=4";
      }, 3000);
    } catch {
      setError("Hubo un error al enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#000", minHeight: "100vh", color: "#fff" }}>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* ── HEADLINE ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(1.8rem,7vw,2.6rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 12px", letterSpacing: -0.5 }}>
            EL <span style={{ color: "#00e87a" }}>MERCADO</span> CAMBIÓ.
            <br />TU FORMA DE <span style={{ color: "#00e87a" }}>OPERAR</span> NO.
          </h1>
          <p style={{ color: "#8899aa", fontSize: "0.95rem", margin: 0 }}>Mira el video y entiende por qué.</p>
        </div>

        {/* ── MANUAL 1080P VIDEO ── */}
        <div style={{ borderRadius: 14, overflow: "hidden", background: "#0d1117", border: "1px solid rgba(0,150,255,0.15)", boxShadow: "0 0 40px rgba(0,100,200,0.12)", marginBottom: 24 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: "#000" }}>
            <video
              ref={videoRef}
              src={`${import.meta.env.BASE_URL}globalflow-presentation.mp4`}
              poster={`${import.meta.env.BASE_URL}globalflow-poster.jpg`}
              aria-label="Video de presentación"
              muted={videoMuted}
              playsInline
              loop
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onClick={toggleVideoPlayback}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, objectFit: "cover", cursor: "pointer" }}
            />
            {!videoPlaying && (
              <button
                type="button"
                onClick={toggleVideoPlayback}
                aria-label="Reproducir video con sonido"
                title="Reproducir con sonido"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  zIndex: 2,
                  width: 72,
                  height: 72,
                  display: "grid",
                  placeItems: "center",
                  transform: "translate(-50%, -50%)",
                  border: "2px solid rgba(255,255,255,0.5)",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.72)",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7Z" />
                </svg>
              </button>
            )}
            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                zIndex: 2,
                display: "flex",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={toggleVideoSound}
                aria-label={videoMuted ? "Activar sonido" : "Silenciar video"}
                title={videoMuted ? "Activar sonido" : "Silenciar video"}
                style={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.72)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {videoMuted ? (
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.9 6.9 0 0 1 14 18.17v2.08a8.9 8.9 0 0 0 3.75-1.25L19.73 21 21 19.73 4.27 3ZM12 4 9.91 6.09 12 8.18V4Zm6.59 4.59-1.42 1.42c.52.58.83 1.34.83 1.99 0 .35-.06.69-.17 1l1.54 1.54c.4-.77.63-1.64.63-2.54 0-1.33-.53-2.53-1.41-3.41Z" />
                  </svg>
                ) : (
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.06A4.5 4.5 0 0 0 16.5 12ZM14 3.23v2.06A7 7 0 0 1 14 18.71v2.06A9 9 0 0 0 14 3.23Z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => void toggleVideoFullscreen()}
                aria-label="Ver video en pantalla completa"
                title="Pantalla completa"
                style={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.72)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 14H5v5h5v-2H7v-3Zm-2-4h2V7h3V5H5v5Zm12 7h-3v2h5v-5h-2v3ZM14 5v2h3v3h2V5h-5Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="bg-[#0f1923] rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#00e87a]/5 blur-[80px] pointer-events-none"></div>

          {enviado ? (
            <SuccessRedirect />
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10" noValidate>
              {/* Form title */}
              <div className="text-center mb-7">
                <div className="text-[1.35rem] font-black tracking-widest flex items-center justify-center gap-2.5 text-white mb-2">
                  <Users className="w-6 h-6 text-[#00e87a]" />
                  ACCESO AL GRUPO
                </div>
                <div className="text-[#8899aa] text-sm font-medium">
                  Completa tus datos para entrar al grupo privado.
                </div>
              </div>

              <FormFields
                nombre={nombre} setNombre={setNombre}
                pais={pais} setPais={setPais}
                paisOpen={paisOpen} setPaisOpen={setPaisOpen}
                buscarPais={buscarPais} setBuscarPais={setBuscarPais}
                paisesFiltrados={paisesFiltrados}
                whatsapp={whatsapp} setWhatsapp={setWhatsapp}
                operadoCriptos={operadoCriptos} setOperadoCriptos={setOperadoCriptos}
                nivel={nivel} setNivel={setNivel}
                fuente={fuente} setFuente={setFuente}
                disabled={enviando}
                touched={touched}
                setTouched={setTouched}
              />

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mt-5 text-center font-medium" data-testid="msg-server-error">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={enviando}
                className={`relative inline-flex w-full items-center justify-center p-0.5 mt-8 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-purple-500 to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300 ${
                  enviando 
                    ? "opacity-60 cursor-not-allowed" 
                    : "cursor-pointer hover:shadow-[0_8px_30px_rgba(168,85,247,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                }`}
                data-testid="button-submit"
              >
                <span className="relative flex w-full items-center justify-between rounded-[10px] bg-[#0f1923] px-7 py-4 font-extrabold tracking-widest transition-all duration-300 group-hover:bg-transparent">
                  <span>{enviando ? "ENVIANDO..." : "ENTRAR AL GRUPO"}</span>
                  <ArrowRight className={`w-5 h-5 ${enviando ? "animate-pulse" : "group-hover:translate-x-1 transition-transform duration-300"}`} />
                </span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Sub-component: success + redirect countdown ──
// NOTE: Maintained exactly as original per requirements "No cambies... la pantalla de éxito".
function SuccessRedirect() {
  const [count, setCount] = useState(3);
  const WA_URL = "https://chat.whatsapp.com/CZHF8IfmVjHEU63r3RPLu4?s=sw&p=i&mlu=4";

  useEffect(() => {
    if (count <= 0) {
      window.location.href = WA_URL;
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div style={{ textAlign: "center", padding: "36px 0" }}>
      {/* WhatsApp icon */}
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#25d366,#128c7e)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 0 32px rgba(37,211,102,0.35)" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </div>

      <h2 style={{ color: "#00e87a", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 }}>
        ¡Registro exitoso!
      </h2>
      <p style={{ color: "#8899aa", fontSize: "0.9rem", marginBottom: 24 }}>
        Tu información fue guardada. Serás redirigido al grupo en…
      </p>

      {/* Countdown circle */}
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid #00e87a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(0,232,122,0.25)" }}>
        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#00e87a", lineHeight: 1 }}>{count > 0 ? count : "✓"}</span>
      </div>

      <a
        href={WA_URL}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(90deg,#25d366,#128c7e)", color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontWeight: 800, fontSize: "0.95rem", letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(37,211,102,0.3)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Unirme al grupo ahora
      </a>
    </div>
  );
}

// ── Sub-component: form fields ──
interface FormFieldsProps {
  nombre: string; setNombre: (v: string) => void;
  pais: typeof PAISES[0]; setPais: (v: typeof PAISES[0]) => void;
  paisOpen: boolean; setPaisOpen: (v: boolean) => void;
  buscarPais: string; setBuscarPais: (v: string) => void;
  paisesFiltrados: typeof PAISES;
  whatsapp: string; setWhatsapp: (v: string) => void;
  operadoCriptos: boolean | null; setOperadoCriptos: (v: boolean) => void;
  nivel: string | null; setNivel: (v: string) => void;
  fuente: string | null; setFuente: (v: string) => void;
  disabled: boolean;
  touched: {
    nombre: boolean;
    whatsapp: boolean;
    operadoCriptos: boolean;
    nivel: boolean;
  };
  setTouched: React.Dispatch<React.SetStateAction<{
    nombre: boolean;
    whatsapp: boolean;
    operadoCriptos: boolean;
    nivel: boolean;
  }>>;
}

function FormFields({ 
  nombre, setNombre, 
  pais, setPais, 
  paisOpen, setPaisOpen, 
  buscarPais, setBuscarPais, 
  paisesFiltrados, 
  whatsapp, setWhatsapp, 
  operadoCriptos, setOperadoCriptos, 
  nivel, setNivel, 
  disabled,
  touched, setTouched
}: FormFieldsProps) {

  const isNombreValid = nombre.trim().length > 0;
  const isWhatsappValid = whatsapp.trim().length >= 6;
  const isCriptosValid = operadoCriptos !== null;
  const isNivelValid = nivel !== null;

  const showNombreError = touched.nombre && !isNombreValid;
  const showNombreSuccess = touched.nombre && isNombreValid;

  const showWhatsappError = touched.whatsapp && !isWhatsappValid;
  const showWhatsappSuccess = touched.whatsapp && isWhatsappValid;

  const getBorderClass = (error: boolean, success: boolean) => {
    if (error) return "border-red-500 focus:border-red-500 focus:ring-red-500/20";
    if (success) return "border-[#00e87a] focus:border-[#00e87a] focus:ring-[#00e87a]/20";
    return "border-white/10 focus:border-[#00e87a] focus:ring-[#00e87a]/20 hover:border-white/20";
  };

  const getIconColorClass = (error: boolean, success: boolean) => {
    if (error) return "text-red-500";
    if (success) return "text-[#00e87a]";
    return "text-gray-400 peer-focus:text-[#00e87a]";
  };

  const getLabelColorClass = (error: boolean, success: boolean) => {
    if (error) return "text-red-500";
    if (success) return "text-[#00e87a]";
    return "text-gray-400 peer-focus:text-[#00e87a]";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Nombre */}
      <div className="relative">
        <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${getIconColorClass(showNombreError, showNombreSuccess)}`} />
        <input
          type="text"
          id="nombre"
          className={`peer block w-full h-[54px] rounded-xl bg-[#0a1520] pl-11 pr-10 pb-2 pt-6 text-sm text-[#ddeeff] outline-none ring-1 ring-transparent transition-all border ${getBorderClass(showNombreError, showNombreSuccess)}`}
          placeholder=" "
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => setTouched(p => ({ ...p, nombre: true }))}
          disabled={disabled}
          aria-invalid={showNombreError}
          aria-describedby={showNombreError ? "nombre-error" : undefined}
          data-testid="input-nombre"
        />
        <label
          htmlFor="nombre"
          className={`absolute left-11 top-[19px] z-10 origin-[0] -translate-y-4 scale-75 transform text-[13px] font-medium duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 cursor-text ${getLabelColorClass(showNombreError, showNombreSuccess)}`}
        >
          Nombre y apellido
        </label>
        {showNombreSuccess && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00e87a] w-5 h-5" data-testid="icon-nombre-success" />}
        {showNombreError && <X className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" data-testid="icon-nombre-error" />}
        
        {showNombreError && (
          <p id="nombre-error" className="text-red-500 text-xs mt-1.5 ml-1 absolute -bottom-5 left-0" data-testid="msg-nombre-error">
            Ingresa tu nombre
          </p>
        )}
      </div>
      
      {showNombreError && <div className="h-1" />}

      {/* Country + WhatsApp Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
        {/* Country */}
        <div className="relative h-[54px]" data-testid="select-pais-container">
          <button
            type="button"
            onClick={() => !disabled && setPaisOpen(!paisOpen)}
            className={`flex items-center w-full h-full rounded-xl border bg-[#0a1520] pl-3.5 pr-3 cursor-pointer transition-all outline-none border-white/10 hover:border-white/20 focus:border-[#00e87a] focus:ring-1 focus:ring-[#00e87a]/20 ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            data-testid="button-pais"
            aria-haspopup="listbox"
            aria-expanded={paisOpen}
          >
            <span className="text-2xl mr-2.5 drop-shadow-md" data-testid="selected-flag">{pais.bandera}</span>
            <div className="flex flex-col items-start justify-center flex-1 overflow-hidden">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">País</span>
              <span className="text-[13px] text-[#ddeeff] leading-none truncate w-full text-left font-medium">
                {pais.nombre} <span className="text-gray-500 font-mono ml-1">{pais.codigo}</span>
              </span>
            </div>
            <ChevronDown className={`ml-2 text-gray-400 w-4 h-4 transition-transform duration-200 ${paisOpen ? "rotate-180 text-[#00e87a]" : ""}`} />
          </button>
          
          {paisOpen && !disabled && (
            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#0f1923] border border-[#00e87a]/30 rounded-xl z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[260px] flex flex-col overflow-hidden" role="listbox">
              <div className="p-2 border-b border-white/10 bg-[#0a1520]/50 backdrop-blur-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    className="w-full bg-black/40 rounded-lg border border-white/10 text-sm text-[#ddeeff] pl-9 pr-3 py-2 outline-none focus:border-[#00e87a] focus:ring-1 focus:ring-[#00e87a]/20 transition-all placeholder:text-gray-500"
                    placeholder="Buscar país..."
                    value={buscarPais}
                    onChange={e => setBuscarPais(e.target.value)}
                    autoFocus
                    data-testid="input-buscar-pais"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {paisesFiltrados.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No se encontraron países</div>
                ) : (
                  paisesFiltrados.map((p) => (
                    <button 
                      key={p.nombre}
                      type="button"
                      onClick={() => { setPais(p); setPaisOpen(false); setBuscarPais(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#00e87a]/15 text-left transition-colors group"
                      role="option"
                      aria-selected={pais.nombre === p.nombre}
                      data-testid={`option-pais-${p.nombre}`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform drop-shadow-md">{p.bandera}</span>
                      <span className="text-[13px] text-[#ddeeff] font-medium group-hover:text-white transition-colors">{p.nombre}</span>
                      <span className="text-[11px] text-gray-500 ml-auto font-mono">{p.codigo}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className="relative">
          <MessageCircle className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${getIconColorClass(showWhatsappError, showWhatsappSuccess)}`} />
          <input
            type="tel"
            id="whatsapp"
            className={`peer block w-full h-[54px] rounded-xl bg-[#0a1520] pl-11 pr-10 pb-2 pt-6 text-sm text-[#ddeeff] outline-none ring-1 ring-transparent transition-all border ${getBorderClass(showWhatsappError, showWhatsappSuccess)}`}
            placeholder=" "
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            onBlur={() => setTouched(p => ({ ...p, whatsapp: true }))}
            disabled={disabled}
            aria-invalid={showWhatsappError}
            aria-describedby={showWhatsappError ? "whatsapp-error" : undefined}
            data-testid="input-whatsapp"
          />
          <label
            htmlFor="whatsapp"
            className={`absolute left-11 top-[19px] z-10 origin-[0] -translate-y-4 scale-75 transform text-[13px] font-medium duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 cursor-text ${getLabelColorClass(showWhatsappError, showWhatsappSuccess)}`}
          >
            Número de WhatsApp
          </label>
          {showWhatsappSuccess && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00e87a] w-5 h-5" data-testid="icon-whatsapp-success" />}
          {showWhatsappError && <X className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" data-testid="icon-whatsapp-error" />}
          
          {showWhatsappError && (
            <p id="whatsapp-error" className="text-red-500 text-xs mt-1.5 ml-1 absolute -bottom-5 left-0" data-testid="msg-whatsapp-error">
              Ingresa un número válido
            </p>
          )}
        </div>
      </div>
      
      {showWhatsappError && <div className="h-1"></div>}

      <div className="w-full h-px bg-white/5 my-1 rounded-full"></div>

      {/* Crypto Experience */}
      <div className="flex flex-col gap-3" data-testid="group-criptos">
        <label className={`text-[13.5px] font-semibold flex items-center justify-between transition-colors ${touched.operadoCriptos && !isCriptosValid ? "text-red-500" : "text-[#8899aa]"}`}>
          ¿Has operado con criptomonedas?
          {touched.operadoCriptos && !isCriptosValid && <X className="w-4 h-4 text-red-500" data-testid="icon-criptos-error" />}
          {touched.operadoCriptos && isCriptosValid && <Check className="w-4 h-4 text-[#00e87a]" data-testid="icon-criptos-success" />}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            disabled={disabled} 
            onClick={() => { setOperadoCriptos(true); setTouched(p => ({...p, operadoCriptos: true})); }} 
            className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-purple-500 to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 transition-all ${operadoCriptos === true ? "ring-2 ring-pink-300 shadow-[0_0_22px_rgba(236,72,153,0.28)]" : ""}`}
            data-testid="btn-criptos-si"
          >
            <span className="relative w-full rounded-[10px] bg-[#17212b] px-3 py-3 transition-all duration-200 group-hover:bg-transparent">
              Sí, he operado
            </span>
          </button>
          <button 
            type="button" 
            disabled={disabled} 
            onClick={() => { setOperadoCriptos(false); setTouched(p => ({...p, operadoCriptos: true})); }} 
            className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-purple-500 to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 transition-all ${operadoCriptos === false ? "ring-2 ring-pink-300 shadow-[0_0_22px_rgba(236,72,153,0.28)]" : ""}`}
            data-testid="btn-criptos-no"
          >
            <span className="relative w-full rounded-[10px] bg-[#17212b] px-3 py-3 transition-all duration-200 group-hover:bg-transparent">
              No, soy nuevo
            </span>
          </button>
        </div>
        {touched.operadoCriptos && !isCriptosValid && (
          <p className="text-red-500 text-xs ml-1" data-testid="msg-criptos-error">Selecciona una opción</p>
        )}
      </div>

      {/* Nivel */}
      <div className="flex flex-col gap-3" data-testid="group-nivel">
        <label className={`text-[13.5px] font-semibold flex items-center justify-between transition-colors ${touched.nivel && !isNivelValid ? "text-red-500" : "text-[#8899aa]"}`}>
          ¿Qué nivel consideras que tienes?
          {touched.nivel && !isNivelValid && <X className="w-4 h-4 text-red-500" data-testid="icon-nivel-error" />}
          {touched.nivel && isNivelValid && <Check className="w-4 h-4 text-[#00e87a]" data-testid="icon-nivel-success" />}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["principiante", "intermedio", "avanzado"].map((n) => {
            const isSelected = nivel === n;
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => { setNivel(n); setTouched(p => ({...p, nivel: true})); }}
                className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-purple-500 to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 transition-all ${isSelected ? "ring-2 ring-pink-300 shadow-[0_0_22px_rgba(236,72,153,0.28)] scale-[1.03]" : ""}`}
                data-testid={`btn-nivel-${n}`}
              >
                <span className="relative flex w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-[#17212b] px-2 py-3 transition-all duration-200 group-hover:bg-transparent">
                  <BarChart2 className={`w-5 h-5 transition-colors ${isSelected ? "text-pink-300" : "text-gray-400 group-hover:text-white"}`} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">{n}</span>
                </span>
              </button>
            );
          })}
        </div>
        {touched.nivel && !isNivelValid && (
          <p className="text-red-500 text-xs ml-1" data-testid="msg-nivel-error">Selecciona tu nivel</p>
        )}
      </div>
    </div>
  );
}
