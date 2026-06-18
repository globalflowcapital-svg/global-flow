import { useRef, useState, useEffect } from "react";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setVideoEnded(true);
      setProgress(100);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleCheckout = () => {
    window.location.href = "#checkout";
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0d0d0d" }}>

      {/* HEADER / TITLE */}
      <header className="py-5 text-center" style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)" }}>
        <div className="container">
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#ffffff",
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
            }}
          >
            Descubre Todo lo que Puedes Lograr
          </h1>
          <p className="lead mt-3" style={{ color: "#a0a0b0", maxWidth: 560, margin: "0 auto" }}>
            Mira el video completo y desbloquea acceso exclusivo a nuestra oferta especial.
          </p>
        </div>
      </header>

      {/* VIDEO SECTION */}
      <main className="flex-grow-1 py-5" style={{ backgroundColor: "#111118" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9 col-xl-8">

              {/* Video wrapper */}
              <div
                className="position-relative rounded-4 overflow-hidden"
                style={{
                  boxShadow: "0 0 60px rgba(80, 200, 121, 0.15), 0 20px 60px rgba(0,0,0,0.6)",
                  border: "1px solid rgba(80, 200, 121, 0.2)",
                }}
              >
                <video
                  ref={videoRef}
                  className="w-100 d-block"
                  controls
                  controlsList="nodownload"
                  style={{ maxHeight: "520px", objectFit: "cover", backgroundColor: "#000" }}
                  poster="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1280&q=80"
                >
                  <source
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    type="video/mp4"
                  />
                  Tu navegador no soporta la reproducción de video.
                </video>

                {/* Progress bar below video */}
                <div style={{ height: 4, backgroundColor: "#1e1e2e" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      backgroundColor: "#50C879",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Status hint */}
              <p
                className="text-center mt-3 small"
                style={{ color: videoEnded ? "#50C879" : "#666680" }}
              >
                {videoEnded
                  ? "¡Video completado! El botón de compra ya está disponible."
                  : "Mira el video completo para habilitar el botón de compra."}
              </p>

              {/* CTA Button */}
              <div className="text-center mt-4">
                <button
                  onClick={handleCheckout}
                  disabled={!videoEnded}
                  className="btn btn-lg px-5 py-3 fw-semibold rounded-pill"
                  style={{
                    backgroundColor: videoEnded ? "#50C879" : "#2a2a3a",
                    color: videoEnded ? "#fff" : "#555570",
                    border: videoEnded ? "none" : "1px solid #333350",
                    fontSize: "1.1rem",
                    letterSpacing: "0.3px",
                    cursor: videoEnded ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    boxShadow: videoEnded ? "0 8px 30px rgba(80, 200, 121, 0.35)" : "none",
                    transform: videoEnded ? "translateY(0)" : "none",
                  }}
                >
                  {videoEnded ? (
                    <>
                      <i className="bi bi-bag-check-fill me-2" />
                      Ir al Checkout
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2" />
                      Mira el video para continuar
                    </>
                  )}
                </button>
              </div>

              {/* Features row */}
              <div className="row g-3 mt-5 text-center">
                {[
                  { icon: "bi-shield-check", label: "Pago Seguro" },
                  { icon: "bi-arrow-counterclockwise", label: "Garantía 30 días" },
                  { icon: "bi-headset", label: "Soporte 24/7" },
                ].map((f) => (
                  <div className="col-4" key={f.label}>
                    <div
                      className="rounded-3 py-3 px-2"
                      style={{ backgroundColor: "#1a1a2a", border: "1px solid #2a2a3e" }}
                    >
                      <i className={`${f.icon} fs-4 d-block mb-1`} style={{ color: "#50C879" }} />
                      <small style={{ color: "#8888aa", fontSize: "0.78rem" }}>{f.label}</small>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#0a0a12", borderTop: "1px solid #1e1e30" }}>
        <div className="container py-5">
          <div className="row gy-4 align-items-center">

            {/* Brand */}
            <div className="col-12 col-md-4 text-center text-md-start">
              <span className="fw-bold fs-5" style={{ color: "#ffffff" }}>
                <i className="bi bi-play-circle-fill me-2" style={{ color: "#50C879" }} />
                MiMarca
              </span>
              <p className="mt-2 mb-0 small" style={{ color: "#666680" }}>
                Transformando vidas a través del conocimiento.
              </p>
            </div>

            {/* Social links */}
            <div className="col-12 col-md-4 text-center">
              <p className="text-uppercase small fw-semibold mb-3" style={{ color: "#50C879", letterSpacing: "1.5px" }}>
                Síguenos
              </p>
              <div className="d-flex justify-content-center gap-3">
                {[
                  { icon: "bi-instagram", href: "#", label: "Instagram" },
                  { icon: "bi-facebook", href: "#", label: "Facebook" },
                  { icon: "bi-twitter-x", href: "#", label: "X / Twitter" },
                  { icon: "bi-youtube", href: "#", label: "YouTube" },
                  { icon: "bi-tiktok", href: "#", label: "TikTok" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      backgroundColor: "#1a1a2a",
                      border: "1px solid #2a2a3e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8888aa",
                      textDecoration: "none",
                      transition: "all 0.25s ease",
                      fontSize: "1.1rem",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#50C879";
                      (e.currentTarget as HTMLElement).style.borderColor = "#50C879";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#1a1a2a";
                      (e.currentTarget as HTMLElement).style.borderColor = "#2a2a3e";
                      (e.currentTarget as HTMLElement).style.color = "#8888aa";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="col-12 col-md-4 text-center text-md-end">
              <div className="d-flex flex-column gap-1">
                {["Términos y Condiciones", "Política de Privacidad", "Contacto"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="small"
                    style={{ color: "#555570", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#50C879")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555570")}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="text-center pt-4 mt-4" style={{ borderTop: "1px solid #1a1a28" }}>
            <small style={{ color: "#444458" }}>
              &copy; {new Date().getFullYear()} MiMarca. Todos los derechos reservados.
            </small>
          </div>
        </div>
      </footer>

    </div>
  );
}
