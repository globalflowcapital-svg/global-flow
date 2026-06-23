import { useState, useEffect } from "react";

interface Lead {
  id: number;
  nombre: string;
  pais: string;
  codigoPais: string;
  whatsapp: string;
  operadoCriptos: boolean;
  nivel: string;
  createdAt: string;
}

const ADMIN_PASSWORD = "globalflow2024"; // ← cambia esta contraseña

function exportCSV(leads: Lead[]) {
  const headers = ["ID", "Nombre", "País", "Código", "WhatsApp", "Operó Criptos", "Nivel", "Fecha"];
  const rows = leads.map((l) => [
    l.id,
    `"${l.nombre}"`,
    `"${l.pais}"`,
    l.codigoPais,
    l.whatsapp,
    l.operadoCriptos ? "Sí" : "No",
    l.nivel,
    new Date(l.createdAt).toLocaleString("es-CO"),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-globalflow-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("gf_admin", "1");
      onLogin();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050a0e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#003a7a,#005533)", border: "2px solid rgba(0,200,100,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 0 24px rgba(0,150,255,0.2)" }}>
            <span style={{ fontSize: "1.6rem" }}>🌐</span>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: 2, background: "linear-gradient(90deg,#fff 40%,#00e87a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GLOBAL FLOW</div>
          <div style={{ color: "#556677", fontSize: "0.75rem", marginTop: 4 }}>Panel de Administración</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "28px 24px" }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: 6, textAlign: "center" }}>Acceso Restringido</h2>
          <p style={{ color: "#8899aa", fontSize: "0.82rem", textAlign: "center", marginBottom: 20 }}>Ingresa la contraseña de administrador</p>

          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#556677" }}>🔑</span>
            <input
              type="password"
              placeholder="Contraseña"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              style={{ width: "100%", background: "#0a1520", border: `1px solid ${error ? "rgba(220,60,60,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: "#ddeeff", padding: "12px 14px 12px 36px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ background: "rgba(220,50,50,0.12)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: 7, padding: "8px 12px", fontSize: "0.82rem", color: "#ff8888", marginBottom: 14, textAlign: "center" }}>
              Contraseña incorrecta
            </div>
          )}

          <button type="submit" style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg,#00c060,#00e87a)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", letterSpacing: 0.5, fontFamily: "inherit" }}>
            Entrar →
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "#334455", fontSize: "0.75rem" }}>
          ← <a href="/landing-page/" style={{ color: "#445566", textDecoration: "none" }}>Volver a la landing</a>
        </p>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{icon}</div>
      <div style={{ color: "#8899aa", fontSize: "0.75rem", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#00e87a", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#556677", fontSize: "0.72rem", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Admin panel ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem("gf_admin") === "1");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterNivel, setFilterNivel] = useState("todos");
  const [filterCriptos, setFilterCriptos] = useState("todos");
  const [sortDesc, setSortDesc] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Error " + res.status);
      setLeads(await res.json());
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchLeads();
  }, [authed]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  // ── Filters ──
  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.nombre.toLowerCase().includes(q) || l.whatsapp.includes(q) || l.pais.toLowerCase().includes(q);
      const matchNivel = filterNivel === "todos" || l.nivel === filterNivel;
      const matchCriptos = filterCriptos === "todos" || (filterCriptos === "si" ? l.operadoCriptos : !l.operadoCriptos);
      return matchSearch && matchNivel && matchCriptos;
    })
    .sort((a, b) => sortDesc ? b.id - a.id : a.id - b.id);

  // ── Stats ──
  const total = leads.length;
  const conCriptos = leads.filter((l) => l.operadoCriptos).length;
  const porNivel: Record<string, number> = {};
  leads.forEach((l) => { porNivel[l.nivel] = (porNivel[l.nivel] ?? 0) + 1; });
  const nivelMayor = Object.entries(porNivel).sort((a, b) => b[1] - a[1])[0];

  const paises: Record<string, number> = {};
  leads.forEach((l) => { paises[l.pais] = (paises[l.pais] ?? 0) + 1; });
  const paisTop = Object.entries(paises).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ minHeight: "100vh", background: "#050a0e", fontFamily: "'Inter',sans-serif", color: "#fff" }}>
      {/* BG glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle,rgba(0,80,180,0.12) 0%,transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#003a7a,#005533)", border: "1px solid rgba(0,200,100,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🌐</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: 1 }}>GLOBAL FLOW <span style={{ color: "#00e87a" }}>ADMIN</span></div>
              <div style={{ color: "#556677", fontSize: "0.72rem" }}>Panel de registros</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={fetchLeads} style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ccd", padding: "8px 16px", cursor: "pointer", fontSize: "0.83rem", fontFamily: "inherit" }}>
              🔄 Actualizar
            </button>
            <button onClick={() => exportCSV(filtered)} style={{ background: "linear-gradient(90deg,#00c060,#00e87a)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.83rem", fontWeight: 700, fontFamily: "inherit" }}>
              ⬇ Exportar CSV
            </button>
            <button onClick={() => { sessionStorage.removeItem("gf_admin"); setAuthed(false); }}
              style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.2)", borderRadius: 8, color: "#ff8888", padding: "8px 16px", cursor: "pointer", fontSize: "0.83rem", fontFamily: "inherit" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard icon="👥" label="TOTAL LEADS" value={total} />
          <StatCard icon="💰" label="CON EXPERIENCIA EN CRIPTOS" value={total > 0 ? `${Math.round(conCriptos / total * 100)}%` : "—"} sub={`${conCriptos} de ${total}`} />
          <StatCard icon="📊" label="NIVEL MÁS COMÚN" value={nivelMayor ? nivelMayor[0].charAt(0).toUpperCase() + nivelMayor[0].slice(1) : "—"} sub={nivelMayor ? `${nivelMayor[1]} personas` : ""} />
          <StatCard icon="🌎" label="PAÍS TOP" value={paisTop ? paisTop[0] : "—"} sub={paisTop ? `${paisTop[1]} registros` : ""} />
        </div>

        {/* ── FILTERS ── */}
        <div style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#556677", fontSize: "0.85rem" }}>🔍</span>
            <input
              placeholder="Buscar por nombre, WhatsApp o país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", background: "#0a1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ddeeff", padding: "9px 12px 9px 32px", fontSize: "0.83rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
          {/* Nivel filter */}
          <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)}
            style={{ background: "#0a1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ddeeff", padding: "9px 12px", fontSize: "0.83rem", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <option value="todos">Todos los niveles</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
          {/* Criptos filter */}
          <select value={filterCriptos} onChange={(e) => setFilterCriptos(e.target.value)}
            style={{ background: "#0a1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ddeeff", padding: "9px 12px", fontSize: "0.83rem", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <option value="todos">Con/sin criptos</option>
            <option value="si">Con experiencia</option>
            <option value="no">Sin experiencia</option>
          </select>
          {/* Sort */}
          <button onClick={() => setSortDesc(!sortDesc)}
            style={{ background: "#0a1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#ccd", padding: "9px 14px", fontSize: "0.83rem", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            {sortDesc ? "⬇ Más recientes" : "⬆ Más antiguos"}
          </button>
          <span style={{ color: "#556677", fontSize: "0.78rem", marginLeft: "auto" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8899aa" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            Cargando registros...
          </div>
        ) : error ? (
          <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.2)", borderRadius: 10, padding: "24px", textAlign: "center", color: "#ff8888" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>⚠️</div>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8899aa" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{leads.length === 0 ? "📭" : "🔍"}</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{leads.length === 0 ? "Aún no hay registros" : "Sin resultados"}</div>
            <div style={{ fontSize: "0.82rem" }}>{leads.length === 0 ? "Los leads aparecerán aquí cuando alguien complete el formulario." : "Prueba con otros filtros."}</div>
          </div>
        ) : (
          <div style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                <thead>
                  <tr style={{ background: "#0a1520", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["#", "Nombre", "País", "WhatsApp", "Criptos", "Nivel", "Fecha"].map((h) => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#8899aa", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr key={lead.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,220,100,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")}
                    >
                      <td style={{ padding: "11px 14px", color: "#556677" }}>{lead.id}</td>
                      <td style={{ padding: "11px 14px", color: "#fff", fontWeight: 600 }}>{lead.nombre}</td>
                      <td style={{ padding: "11px 14px", color: "#ccd", whiteSpace: "nowrap" }}>
                        {lead.pais} <span style={{ color: "#556677" }}>{lead.codigoPais}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <a href={`https://wa.me/${lead.codigoPais.replace(/\D/g, "")}${lead.whatsapp.replace(/\D/g, "")}`}
                          target="_blank" rel="noreferrer"
                          style={{ color: "#00e87a", textDecoration: "none" }}>
                          💬 {lead.whatsapp}
                        </a>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: lead.operadoCriptos ? "rgba(0,200,80,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${lead.operadoCriptos ? "rgba(0,200,80,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 6, padding: "3px 9px", color: lead.operadoCriptos ? "#00e87a" : "#8899aa", fontWeight: 600, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                          {lead.operadoCriptos ? "✓ Sí" : "✗ No"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: "rgba(0,150,255,0.1)", border: "1px solid rgba(0,150,255,0.2)", borderRadius: 6, padding: "3px 9px", color: "#66aaff", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>
                          {lead.nivel}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#556677", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                        {new Date(lead.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        <br />
                        <span style={{ color: "#334455" }}>{new Date(lead.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
