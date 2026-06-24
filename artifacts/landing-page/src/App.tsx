import { useRef, useState, useEffect, useCallback } from "react";

const PAISES = [
  { nombre: "Argentina", codigo: "+54", bandera: "🇦🇷" },
  { nombre: "Bolivia", codigo: "+591", bandera: "🇧🇴" },
  { nombre: "Brasil", codigo: "+55", bandera: "🇧🇷" },
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

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTimeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [muted, setMuted] = useState(false);

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

  const paisesFiltrados = PAISES.filter((p) =>
    p.nombre.toLowerCase().includes(buscarPais.toLowerCase())
  );

  // Prevent seeking forward
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.currentTime > lastTimeRef.current + 0.5) {
        video.currentTime = lastTimeRef.current;
        return;
      }
      lastTimeRef.current = video.currentTime;
      setCurrentTime(video.currentTime);
      setProgress(video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0);
    };

    const onLoaded = () => setDuration(video.duration);
    const onEnded = () => { setVideoEnded(true); setProgress(100); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else video.requestFullscreen();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoEnded) return;
    if (!nombre.trim() || !whatsapp.trim() || operadoCriptos === null || !nivel || !fuente) {
      setError("Por favor completa todos los campos.");
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
          fuente,
        }),
      });
      if (!res.ok) throw new Error("Error del servidor");
      setEnviado(true);
      // Redirigir al grupo de WhatsApp después de 3 segundos
      setTimeout(() => {
        window.location.href = "https://chat.whatsapp.com/HZUpfDE1vwc2BGOBrBevLJ?s=sw&p=i&mlu=3";
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

        {/* ── LOGO ── */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="Global Flow"
            style={{
              width: "min(72vw, 280px)",
              height: "auto",
              display: "block",
              margin: "0 auto",
              borderRadius: 12,
            }}
          />
        </div>

        {/* ── HEADLINE ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(1.8rem,7vw,2.6rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 12px", letterSpacing: -0.5 }}>
            EL <span style={{ color: "#00e87a" }}>MERCADO</span> CAMBIÓ.
            <br />TU FORMA DE <span style={{ color: "#00e87a" }}>OPERAR</span> NO.
          </h1>
          <p style={{ color: "#8899aa", fontSize: "0.95rem", margin: 0 }}>Mira el video y entiende por qué.</p>
        </div>

        {/* ── CUSTOM VIDEO PLAYER ── */}
        <div style={{ borderRadius: 14, overflow: "hidden", background: "#0d1117", border: "1px solid rgba(0,150,255,0.15)", boxShadow: "0 0 40px rgba(0,100,200,0.12)", marginBottom: 24 }}>
          {/* No-skip badge */}
          <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", color: "#ccd" }}>
              🔒 Vídeo no saltable
            </span>
          </div>

          {/* Video element — hidden native controls */}
          <div style={{ position: "relative", background: "#000", cursor: "pointer" }} onClick={togglePlay}>
            <video
              ref={videoRef}
              style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "cover" }}
              poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80"
              playsInline
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
            {/* Play overlay */}
            {!playing && !videoEnded && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", pointerEvents: "none" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            )}
            {videoEnded && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#00e87a", fontSize: "2rem" }}>✓</div>
                  <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>Video completado</div>
                </div>
              </div>
            )}
          </div>

          {/* Custom controls bar */}
          <div style={{ background: "#0d1117", padding: "8px 14px" }}>
            {/* Progress bar (read-only, no click) */}
            <div style={{ height: 3, background: "#1e2a35", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00aaff,#00e87a)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
            {/* Buttons row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={togglePlay} style={{ background: "none", border: "none", color: "#ccd", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                {playing
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
              <span style={{ fontSize: "0.72rem", color: "#8899aa", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={toggleMute} style={{ background: "none", border: "none", color: "#ccd", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                {muted
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.21 16.5 12zM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12zM4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25C12.87 17.82 11.98 18.08 11 18.08c-1.38 0-2.63-.45-3.64-1.19L6 18.26C7.34 19.34 9.1 20 11 20c1.26 0 2.44-.3 3.48-.82L16.73 21.5L18 20.23L11 13.23L4.27 3zM11 5l-2.17 2.17L11 9.34V5z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                }
              </button>
              <button onClick={toggleFullscreen} style={{ background: "none", border: "none", color: "#ccd", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px" }}>
          {enviado ? (
            <SuccessRedirect />
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Form title */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: 1 }}>
                  <span style={{ marginRight: 8 }}>👥</span>ACCESO AL GRUPO
                </div>
                <div style={{ color: "#8899aa", fontSize: "0.85rem", marginTop: 4 }}>
                  Completa tus datos para entrar al grupo.
                </div>
              </div>

              {/* Overlay when video not finished */}
              {!videoEnded && (
                <div style={{ position: "relative" }}>
                  <div style={{ filter: "blur(2px) opacity(0.35)", pointerEvents: "none" }}>
                    <FormFields
                      nombre={nombre} setNombre={setNombre}
                      pais={pais} setPais={setPais}
                      paisOpen={false} setPaisOpen={() => {}}
                      buscarPais={buscarPais} setBuscarPais={setBuscarPais}
                      paisesFiltrados={paisesFiltrados}
                      whatsapp={whatsapp} setWhatsapp={setWhatsapp}
                      operadoCriptos={operadoCriptos} setOperadoCriptos={setOperadoCriptos}
                      nivel={nivel} setNivel={setNivel}
                      fuente={fuente} setFuente={setFuente}
                      disabled={true}
                    />
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <div style={{ fontSize: "2rem" }}>🔒</div>
                    <div style={{ fontWeight: 700, color: "#ccd" }}>Mira el video completo</div>
                    <div style={{ fontSize: "0.8rem", color: "#8899aa" }}>para desbloquear el formulario</div>
                  </div>
                </div>
              )}

              {videoEnded && (
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
                  disabled={false}
                />
              )}

              {error && (
                <div style={{ background: "rgba(220,50,50,0.15)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", color: "#ff8888", marginTop: 12 }}>
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!videoEnded || enviando}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", marginTop: 20, padding: "16px 24px",
                  borderRadius: 10, border: "none", fontWeight: 800, fontSize: "1rem", letterSpacing: 1,
                  cursor: videoEnded && !enviando ? "pointer" : "not-allowed",
                  background: videoEnded
                    ? (enviando ? "rgba(0,180,80,0.5)" : "linear-gradient(90deg,#00c060,#00e87a)")
                    : "rgba(255,255,255,0.05)",
                  color: videoEnded ? "#fff" : "#445566",
                  transition: "all 0.3s ease",
                  boxShadow: videoEnded ? "0 4px 24px rgba(0,200,100,0.3)" : "none",
                }}
              >
                <span>{enviando ? "Enviando..." : "ENTRAR AL GRUPO"}</span>
                <span style={{ fontSize: "1.2rem" }}>→</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Sub-component: success + redirect countdown ──
function SuccessRedirect() {
  const [count, setCount] = useState(3);
  const WA_URL = "https://chat.whatsapp.com/HZUpfDE1vwc2BGOBrBevLJ?s=sw&p=i&mlu=3";

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div style={{ textAlign: "center", padding: "36px 0" }}>
      {/* WhatsApp icon */}
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#25d366,#128c7e)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 0 32px rgba(37,211,102,0.35)" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
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
const FUENTES = [
  { value: "instagram",  label: "📸 Instagram" },
  { value: "tiktok",     label: "🎵 TikTok" },
  { value: "facebook",   label: "👤 Facebook" },
  { value: "youtube",    label: "▶️ YouTube" },
  { value: "referido",   label: "🤝 Referido / amigo" },
  { value: "twitter",    label: "🐦 Twitter / X" },
  { value: "whatsapp",   label: "💬 WhatsApp" },
  { value: "otro",       label: "🔍 Otro" },
];

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
}

function FormFields({ nombre, setNombre, pais, setPais, paisOpen, setPaisOpen, buscarPais, setBuscarPais, paisesFiltrados, whatsapp, setWhatsapp, operadoCriptos, setOperadoCriptos, nivel, setNivel, fuente, setFuente, disabled }: FormFieldsProps) {
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0a1520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#ddeeff", padding: "12px 14px", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box",
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "11px 8px", borderRadius: 8, border: active ? "1.5px solid #00e87a" : "1px solid rgba(255,255,255,0.1)",
    background: active ? "rgba(0,220,120,0.12)" : "rgba(255,255,255,0.03)",
    color: active ? "#00e87a" : "#8899aa", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Name */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8899aa" }}>👤</span>
        <input
          type="text"
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={disabled}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Country + WhatsApp */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Country dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => !disabled && setPaisOpen(!paisOpen)}
            style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <span style={{ fontSize: "0.85rem", color: "#8899aa" }}>🔍</span>
            <span style={{ fontSize: "1rem" }}>{pais.bandera}</span>
            <span style={{ fontSize: "0.85rem", color: "#ddeeff" }}>{pais.nombre.length > 9 ? pais.nombre.slice(0, 9) + "…" : pais.nombre} {pais.codigo}</span>
            <span style={{ marginLeft: "auto", color: "#556677", fontSize: "0.7rem" }}>▾</span>
          </button>
          {paisOpen && !disabled && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0f1923", border: "1px solid rgba(0,200,100,0.2)", borderRadius: 8, zIndex: 50, maxHeight: 220, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ padding: "8px 8px 4px" }}>
                <input
                  placeholder="Buscar país..."
                  value={buscarPais}
                  onChange={(e) => setBuscarPais(e.target.value)}
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "7px 10px" }}
                  autoFocus
                />
              </div>
              <div style={{ overflowY: "auto", maxHeight: 160 }}>
                {paisesFiltrados.map((p) => (
                  <button
                    key={p.nombre}
                    type="button"
                    onClick={() => { setPais(p); setPaisOpen(false); setBuscarPais(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", color: "#ddeeff", fontSize: "0.83rem", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,220,100,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span>{p.bandera}</span><span>{p.nombre}</span><span style={{ marginLeft: "auto", color: "#556677" }}>{p.codigo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* WhatsApp */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "1rem" }}>💬</span>
          <input
            type="tel"
            placeholder="Número de WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={disabled}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Crypto experience */}
      <div>
        <div style={{ fontSize: "0.85rem", color: "#ccd", marginBottom: 8, fontWeight: 600 }}>¿Has operado con criptomonedas?</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" disabled={disabled} onClick={() => setOperadoCriptos(true)} style={toggleBtnStyle(operadoCriptos === true)}>
            <span>✓</span> Sí
          </button>
          <button type="button" disabled={disabled} onClick={() => setOperadoCriptos(false)} style={toggleBtnStyle(operadoCriptos === false)}>
            <span>○</span> No
          </button>
        </div>
      </div>

      {/* Level */}
      <div>
        <div style={{ fontSize: "0.85rem", color: "#ccd", marginBottom: 8, fontWeight: 600 }}>¿Qué nivel consideras que tienes?</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["principiante", "intermedio", "avanzado"].map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => setNivel(n)}
              style={toggleBtnStyle(nivel === n)}
            >
              <span style={{ fontSize: "0.75rem" }}>📊</span>
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Traffic source */}
      <div>
        <div style={{ fontSize: "0.85rem", color: "#ccd", marginBottom: 8, fontWeight: 600 }}>¿Cómo nos encontraste?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {FUENTES.map((f) => (
            <button
              key={f.value}
              type="button"
              disabled={disabled}
              onClick={() => setFuente(f.value)}
              style={{
                padding: "10px 8px", borderRadius: 8,
                border: fuente === f.value ? "1.5px solid #00e87a" : "1px solid rgba(255,255,255,0.1)",
                background: fuente === f.value ? "rgba(0,220,120,0.12)" : "rgba(255,255,255,0.03)",
                color: fuente === f.value ? "#00e87a" : "#8899aa",
                fontWeight: 600, fontSize: "0.83rem", cursor: disabled ? "not-allowed" : "pointer",
                textAlign: "left", transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
