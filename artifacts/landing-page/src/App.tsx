import { useEffect, useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !whatsapp.trim() || operadoCriptos === null || !nivel) {
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
          fuente: fuente ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Error del servidor");
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

        {/* ── AUTOPLAY VIDEO ── */}
        <div style={{ borderRadius: 14, overflow: "hidden", background: "#0d1117", border: "1px solid rgba(0,150,255,0.15)", boxShadow: "0 0 40px rgba(0,100,200,0.12)", marginBottom: 24 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: "#000" }}>
            <video
              src={`${import.meta.env.BASE_URL}globalflow-presentation.mp4`}
              poster={`${import.meta.env.BASE_URL}globalflow-poster.jpg`}
              aria-label="Video de presentación"
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate nofullscreen"
              onClick={(event) => void event.currentTarget.play()}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, objectFit: "cover" }}
            />
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

              {error && (
                <div style={{ background: "rgba(220,50,50,0.15)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", color: "#ff8888", marginTop: 12 }}>
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                onClick={trackMetaLead}
                disabled={enviando}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", marginTop: 20, padding: "16px 24px",
                  borderRadius: 10, border: "none", fontWeight: 800, fontSize: "1rem", letterSpacing: 1,
                  cursor: enviando ? "not-allowed" : "pointer",
                  background: enviando ? "rgba(0,180,80,0.5)" : "linear-gradient(90deg,#00c060,#00e87a)",
                  color: "#fff",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 24px rgba(0,200,100,0.3)",
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

    </div>
  );
}
