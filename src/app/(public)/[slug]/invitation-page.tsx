"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Play, Pause, Heart, Calendar, MapPin, MessageSquare,
  ChevronDown, Copy, Check, ExternalLink, X, Home, Image,
  Gift, Music, ChevronUp, Sparkles, Camera, ChevronLeft,
  ChevronRight, Maximize2, Minimize2, Star
} from "lucide-react";

type InvitationData = {
  id: number;
  slug: string;
  title: string | null;
  groomName: string;
  groomFullName: string | null;
  groomParent: string | null;
  groomChild: string | null;
  groomPhoto: string | null;
  brideName: string;
  brideFullName: string | null;
  brideParent: string | null;
  brideChild: string | null;
  bridePhoto: string | null;
  eventDate: string | null;
  eventTime: string | null;
  eventTitle: string | null;
  address: string | null;
  mapsUrl: string | null;
  mapsEmbedUrl: string | null;
  story: string | null;
  quoteText: string | null;
  quoteAuthor: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  bgMusicType: string | null;
  bgMusicUrl: string | null;
  bgMusicFile: string | null;
  bgMusicAuto: boolean;
  themeStyle: string;
  fontStyle: string;
  instagramUrl: string | null;
  invitationType: string;
  coverPhoto: string | null;
  dressCode1: string | null;
  dressCode2: string | null;
  dressCode3: string | null;
  createdAt: string;
  photos: { id: number; url: string; caption: string | null; order: number }[];
  bankAccounts: { id: number; type: string; bankName: string | null; accountName: string; accountNumber: string; provider: string | null }[];
  wishMessages: { id: number; name: string; message: string; attendance: string | null; createdAt: string }[];
};

const labelMap: Record<string, string> = {
  pernikahan: "Pernikahan",
  tunangan: "Tunangan",
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function FloatingHearts({ primary, accent }: { primary: string; accent: string }) {
  const hearts = [
    { left: 5, delay: 0, dur: 12, size: 10, op: 0.1, drift: -10 },
    { left: 18, delay: 2, dur: 14, size: 14, op: 0.08, drift: 15 },
    { left: 35, delay: 4, dur: 10, size: 18, op: 0.12, drift: -5 },
    { left: 50, delay: 1, dur: 16, size: 11, op: 0.09, drift: 20 },
    { left: 65, delay: 5, dur: 13, size: 20, op: 0.07, drift: -15 },
    { left: 78, delay: 3, dur: 11, size: 12, op: 0.11, drift: 8 },
    { left: 88, delay: 6, dur: 15, size: 16, op: 0.08, drift: -20 },
    { left: 95, delay: 0.5, dur: 9, size: 9, op: 0.13, drift: 25 },
    { left: 42, delay: 7, dur: 18, size: 22, op: 0.06, drift: -8 },
    { left: 23, delay: 3.5, dur: 11, size: 13, op: 0.1, drift: 12 },
    { left: 72, delay: 8, dur: 17, size: 15, op: 0.09, drift: -18 },
    { left: 55, delay: 2.5, dur: 13, size: 17, op: 0.07, drift: 5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h, i) => (
        <div
          key={i}
          className="absolute animate-float-particle"
          style={{
            left: `${h.left}%`,
            bottom: "-10%",
            width: `${h.size}px`,
            height: `${h.size}px`,
            opacity: h.op,
            color: i % 3 === 0 ? primary : i % 3 === 1 ? accent : "#fff",
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
            ['--drift' as string]: `${h.drift}px`,
          }}
        >
          <Heart size={h.size} fill="currentColor" />
        </div>
      ))}
    </div>
  );
}

function SparkleTrail() {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number; opacity: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const newSparkle = { id: idRef.current++, x: e.clientX, y: e.clientY, size: 3 + Math.random() * 4, opacity: 0.4 + Math.random() * 0.4 };
      setSparkles((prev) => [...prev.slice(-15), newSparkle]);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full animate-sparkle-fade"
          style={{
            left: s.x, top: s.y, width: s.size, height: s.size,
            background: "rgba(255,215,0,0.6)",
            boxShadow: "0 0 6px rgba(255,215,0,0.4)",
          }}
        />
      ))}
    </div>
  );
}

function SectionWrapper({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section
      id={id}
      data-section={id}
      className={className}
    >
      {children}
    </section>
  );
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getYouTubeEmbedUrl(url: string, autoplay: boolean): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&controls=0&showinfo=0&loop=1&playlist=${id}&enablejsapi=1`;
}

export function InvitationPage({

  invitation,
}: {
  invitation: InvitationData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wishes, setWishes] = useState(invitation.wishMessages);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [activeSection, setActiveSection] = useState("cover-section");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const isGlass = invitation.themeStyle === "glassmorphism";
  const typeLabel = labelMap[invitation.invitationType] || "Pernikahan";
  const c = {
    primary: invitation.colorPrimary,
    secondary: invitation.colorSecondary,
    accent: invitation.colorAccent,
    rgb: hexToRgb(invitation.colorPrimary),
  };

  const toggleMusic = useCallback(() => {

    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); }
      else { audioRef.current.play().catch(() => {}); }
      setIsPlaying(!isPlaying);
    } else if (youtubeIframeRef.current) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      youtubeIframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const navItems = useMemo(() => {
    const items = [
      { id: "cover-section", label: "Home", icon: Home },
      { id: "acara-section", label: "Acara", icon: Calendar },
    ];
    if (invitation.photos.length > 0) items.push({ id: "galeri-section", label: "Galeri", icon: Image });
    if (invitation.bankAccounts.length > 0) items.push({ id: "amplop-section", label: "Amplop", icon: Gift });
    items.push({ id: "ucapan-section", label: "Ucapan", icon: MessageSquare });
    return items;
  }, [invitation.photos.length, invitation.bankAccounts.length]);
  async function handleSubmitWish(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const res = await fetch(`/api/invitations/${invitation.id}/wishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        message: data.get("message"),
        attendance: data.get("attendance"),
      }),
    });
    if (res.ok) {
      const newWish = await res.json();
      setWishes([newWish, ...wishes]);
      (form.querySelector("input[name='name']") as HTMLInputElement)!.value = "";
      (form.querySelector("textarea") as HTMLTextAreaElement)!.value = "";
      (form.querySelector("select") as HTMLSelectElement)!.selectedIndex = 0;
    }
  }

  async function copyNumber(account: InvitationData["bankAccounts"][0]) {
    const text = account.type === "bank"
      ? `${account.bankName} - ${account.accountNumber} a.n. ${account.accountName}`
      : `${account.provider} - ${account.accountNumber} a.n. ${account.accountName}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const sectionBg = isGlass
    ? `linear-gradient(135deg, ${c.secondary} 0%, ${c.primary}11 50%, ${c.secondary} 100%)`
    : undefined;

  useEffect(() => {
    if (!invitation.eventDate) return;
    const target = new Date(invitation.eventDate);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [invitation.eventDate]);

  useEffect(() => {
    if (!isOpen) return;
    if (!invitation.bgMusicAuto) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else if (youtubeIframeRef.current) {
        youtubeIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo' }),
          '*'
        );
        setIsPlaying(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isOpen, invitation.bgMusicAuto]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowNav(scrollTop > 100);
      setShowScrollTop(scrollTop > 300);

      const sections = document.querySelectorAll("[data-section]");
      let current = "cover-section";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          current = section.getAttribute("data-section") || current;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======== PRE-OPEN COVER ========
  if (!isOpen) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: invitation.coverPhoto
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${invitation.coverPhoto}) center/cover no-repeat fixed`
            : isGlass
              ? `linear-gradient(135deg, ${c.secondary} 0%, ${c.primary}22 50%, ${c.secondary} 100%)`
              : `linear-gradient(135deg, ${c.secondary} 0%, ${c.secondary}88 100%)`,
        }}
      >
        <FloatingHearts primary={c.primary} accent={c.accent} />

        {!invitation.coverPhoto && (
          <div className="absolute inset-0 opacity-[0.12]">
            <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full ${isGlass ? "animate-float" : ""}`} style={{ background: c.primary }} />
            <div className={`absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full ${isGlass ? "animate-float-delayed" : ""}`} style={{ background: c.accent }} />
          </div>
        )}

        {invitation.coverPhoto && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 shadow-2xl opacity-90 animate-cover-float"
              style={{
                borderColor: `${c.primary}66`,
              }}
            >
              <img src={invitation.coverPhoto || undefined} alt="Cover" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="text-center z-10 px-6 space-y-6" style={{ marginTop: invitation.coverPhoto ? "18rem" : "0" }}>
          <p className="text-sm tracking-[0.25em] uppercase" style={{ color: invitation.coverPhoto ? "rgba(255,255,255,0.75)" : c.accent }}>
            <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
            Undangan {typeLabel}
          </p>
          <h1
            className={`text-4xl md:text-6xl font-great-vibes leading-tight ${invitation.coverPhoto ? "text-white drop-shadow-lg" : ""}`}
            style={!invitation.coverPhoto ? { color: c.primary } : undefined}
          >
            {invitation.brideName}
            <br />
            <span className="text-2xl md:text-3xl">&</span>
            <br />
            {invitation.groomName}
          </h1>
          {invitation.eventDate && (
            <p className={`text-sm ${invitation.coverPhoto ? "text-white/70" : isGlass ? "text-gray-600" : ""}`}>
              {new Date(invitation.eventDate || "").toLocaleDateString("id-ID", { dateStyle: "long" })}
            </p>
          )}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-12 flex flex-col items-center gap-2 z-10 group"
          style={{ color: invitation.coverPhoto ? "#fff" : c.primary }}
        >
          <span className="text-sm tracking-wider group-hover:translate-y-1 transition-transform duration-300">Buka Undangan</span>

          <ChevronDown className="animate-scroll-down" size={20} />
        </button>

        {invitation.bgMusicType === 'youtube' && invitation.bgMusicUrl && (
          <iframe
            ref={youtubeIframeRef}
            src={getYouTubeEmbedUrl(invitation.bgMusicUrl || "", invitation.bgMusicAuto) || ""}
            className="hidden"
            onLoad={() => {
              if (invitation.bgMusicAuto) setIsPlaying(true);
            }}
          />
        )}
        {invitation.bgMusicType === 'file' && invitation.bgMusicFile && (
          <audio ref={audioRef} src={invitation.bgMusicFile || undefined} loop />
        )}
      </div>
    );
  }

  // ======== POST-OPEN CONTENT ========
  return (
    <div
      className="min-h-screen relative pb-20"
      style={isGlass ? { background: `linear-gradient(135deg, ${c.secondary} 0%, ${c.primary}11 50%, ${c.secondary} 100%)` } : { background: "#fff" }}
    >
      <FloatingHearts primary={c.primary} accent={c.accent} />
      <SparkleTrail />

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1">
        <div className="h-full transition-all duration-150 ease-out" style={{ width: `${scrollProgress}%`, background: `linear-gradient(90deg, ${c.primary}, ${c.accent})` }} />
      </div>

      {/* Glass background blobs */}
      {isGlass && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/6 -left-20 w-96 h-96 rounded-full opacity-[0.08] animate-float" style={{ background: c.primary }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.06] animate-float-delayed" style={{ background: c.accent }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-[0.05] animate-float-slow" style={{ background: c.primary }} />
        </div>
      )}

        {invitation.bgMusicType === 'youtube' && invitation.bgMusicUrl && (
          <iframe
            ref={youtubeIframeRef}
            src={getYouTubeEmbedUrl(invitation.bgMusicUrl || "", invitation.bgMusicAuto) || ""}
            className="hidden"
            onLoad={() => {
              if (invitation.bgMusicAuto) setIsPlaying(true);
            }}
          />
        )}
        {invitation.bgMusicType === 'file' && invitation.bgMusicFile && (
          <audio ref={audioRef} src={invitation.bgMusicFile || undefined} loop />
        )}



      {/* Music Button */}
      <button
        onClick={toggleMusic}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 animate-glow ${isGlass ? "glass-strong" : ""}`}
        style={{ background: isGlass ? undefined : c.primary, color: isGlass ? c.primary : "#fff" }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Scroll to Top */}
      <button
        onClick={() => scrollToSection("cover-section")}
        className={`fixed bottom-24 right-4 z-50 p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} ${isGlass ? "glass-strong" : ""}`}
        style={{ background: isGlass ? undefined : c.primary, color: isGlass ? c.primary : "#fff" }}
      >
        <ChevronUp size={18} />
      </button>

      {/* Cover Section */}
      <SectionWrapper id="cover-section">
        <section
          className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
           style={(() => {
             const base = { position: "relative" as const };
             if (invitation.coverPhoto) {
               return {
                 ...base,
                 willChange: "transform",
                 background: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${invitation.coverPhoto}) center/cover no-repeat`,
               };
             }
             if (isGlass) return { ...base, background: sectionBg };
             return { ...base, background: `linear-gradient(135deg, ${c.secondary} 0%, ${c.secondary}88 100%)` };
           })()}
        >
          {isGlass && !invitation.coverPhoto && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-48 h-48 rounded-full opacity-[0.07] animate-float" style={{ background: c.primary }} />
              <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-[0.05] animate-float-delayed" style={{ background: c.accent }} />
            </div>
          )}

          {invitation.coverPhoto && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 shadow-2xl opacity-80 animate-cover-float"
                style={{
                  borderColor: `${c.primary}88`,
                }}
              >
                <img src={invitation.coverPhoto || undefined} alt="Cover" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div
            className={`text-center z-10 space-y-6 ${isGlass && !invitation.coverPhoto ? "glass p-12 md:p-16 rounded-2xl max-w-xl w-full" : invitation.coverPhoto ? "text-white" : ""}`}
            style={{ marginTop: invitation.coverPhoto ? "16rem" : "0" }}
          >
            <p className="text-sm tracking-[0.25em] uppercase" style={invitation.coverPhoto ? { color: "rgba(255,255,255,0.8)" } : { color: c.accent }}>
              <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
              Undangan {typeLabel}
            </p>
            <h1
              className={`text-4xl md:text-6xl font-great-vibes leading-tight ${invitation.coverPhoto ? "text-white drop-shadow-lg" : ""}`}
              style={!invitation.coverPhoto ? { color: c.primary } : undefined}
            >
              {invitation.brideName}
              <br />
              <span className="text-2xl md:text-3xl">&</span>
              <br />
              {invitation.groomName}
            </h1>
            {invitation.eventDate && (
              <p className={`text-sm ${invitation.coverPhoto ? "text-white/70" : isGlass ? "" : "text-gray-500"}`}>
              {new Date(invitation.eventDate || "").toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            )}
            <div className="pt-8">
              <Star
                style={invitation.coverPhoto ? { color: "#fff" } : { color: c.primary }}
                size={32}
                className="mx-auto animate-heartbeat"
                fill={invitation.coverPhoto ? "#fff" : c.primary}
              />
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* Quote */}
      {invitation.quoteText && (
        <SectionWrapper id="quote-section">
          <section className={`py-20 px-6 text-center ${isGlass ? "relative" : ""}`} style={isGlass ? { background: "transparent" } : { background: c.primary }}>
            <div className={`max-w-2xl mx-auto space-y-4 ${isGlass ? "glass p-10 rounded-2xl" : ""}`}>
              <p className={`text-2xl md:text-4xl font-great-vibes ${isGlass ? "opacity-40" : "text-white/30"}`} style={isGlass ? { color: c.primary } : undefined}>&ldquo;</p>
              <p className={`text-lg md:text-xl italic leading-relaxed ${isGlass ? "" : "text-white"}`}>{invitation.quoteText}</p>
              {invitation.quoteAuthor && (
                <p className={`text-sm ${isGlass ? "opacity-60" : "text-white/70"}`} style={isGlass ? { color: c.accent } : undefined}>
                  &mdash; {invitation.quoteAuthor}
                </p>
              )}
            </div>
          </section>
        </SectionWrapper>
      )}

      {/* Bride & Groom */}
      <SectionWrapper id="couple-section">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-2">
              <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>Pembuka</p>
              <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Assalamualaikum Wr. Wb.</h2>
              <p className={`max-w-xl mx-auto ${isGlass ? "" : "text-gray-500"}`}>
                Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara {typeLabel.toLowerCase()}:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {[
                { name: invitation.brideName, fullName: invitation.brideFullName, parent: invitation.brideParent, child: invitation.brideChild, photo: invitation.bridePhoto, label: "Wanita" },
                { name: invitation.groomName, fullName: invitation.groomFullName, parent: invitation.groomParent, child: invitation.groomChild, photo: invitation.groomPhoto, label: "Pria" },
              ].map((person) => (
                <div key={person.label} className={`space-y-5 group p-6 rounded-2xl ${isGlass ? "glass" : "bg-white/80 shadow-md"} transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl`}>
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 transition-all duration-500 group-hover:border-dashed group-hover:animate-spin-slow" style={{ borderColor: c.primary }}>
                    {person.photo ? (
                      <img src={person.photo} alt={person.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: isGlass ? "rgba(255,255,255,0.5)" : c.secondary }}>
                        <span className="text-4xl font-great-vibes" style={{ color: c.primary }}>{person.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-great-vibes" style={{ color: c.primary }}>{person.name}</h3>
                    {person.fullName && <p className={`text-sm mt-1 ${isGlass ? "" : "text-gray-600"}`}>{person.fullName}</p>}
                    {person.child && <p className="text-xs mt-1 opacity-60">{person.child}</p>}
                    {person.parent && <p className={`text-sm mt-2 ${isGlass ? "opacity-70" : "text-gray-500"}`}>{person.parent}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* Countdown & Event */}
      {invitation.eventDate && (
        <SectionWrapper id="acara-section">
          <section className="py-20 px-6" style={isGlass ? { background: "transparent" } : { background: c.secondary }}>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-2">
                <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>Acara</p>
                <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Menghitung Hari</h2>
              </div>

              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                {[
                  { label: "Hari", value: countdown.days },
                  { label: "Jam", value: countdown.hours },
                  { label: "Menit", value: countdown.minutes },
                  { label: "Detik", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl p-3 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-lg ${isGlass ? "glass" : "bg-white"}`}>
                    <div className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: c.primary }}>
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs mt-1 opacity-60">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-6 shadow-sm max-w-md mx-auto space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${isGlass ? "glass" : "bg-white"}`}>
                {invitation.eventTitle && (
                  <div className="flex items-center gap-2 justify-center" style={{ color: c.accent }}>
                    <Calendar size={18} />
                    <span className="font-medium">{invitation.eventTitle}</span>
                  </div>
                )}
                <p className={isGlass ? "" : "text-gray-700"}>
                  {new Date(invitation.eventDate || "").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                {invitation.eventTime && <p className="opacity-70">{invitation.eventTime}</p>}
                {invitation.address && <p className="text-sm opacity-70">{invitation.address}</p>}
                {invitation.mapsUrl && (
                  <a href={invitation.mapsUrl || undefined} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg transition-all duration-300 text-sm hover:scale-105 active:scale-95 hover:shadow-lg"
                    style={{ background: c.primary }}>
                    <MapPin size={16} />
                    Buka Google Maps
                  </a>
                )}
              </div>

              {invitation.mapsEmbedUrl && (
                <div className={`w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md ${isGlass ? "glass p-2" : ""}`}>
                  <iframe src={invitation.mapsEmbedUrl || undefined} width="100%" height="300" style={{ border: 0, borderRadius: isGlass ? "0.75rem" : undefined }} allowFullScreen loading="lazy" />
                </div>
              )}

              {invitation.dressCode1 && (
                <div className={`rounded-xl p-6 shadow-sm max-w-md mx-auto space-y-3 ${isGlass ? "glass" : "bg-white"}`}>
                  <p className="text-sm font-medium opacity-70">Dress Code</p>
                  <div className="flex items-center justify-center gap-3">
                    {[invitation.dressCode1, invitation.dressCode2, invitation.dressCode3].filter(Boolean).map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-sm transition-transform duration-300 hover:scale-110"
                          style={{ backgroundColor: color || undefined, borderColor: `${c.primary}44` }}
                        />
                        <span className="text-[10px] opacity-50">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </SectionWrapper>
      )}

      {/* Story */}
      {invitation.story && (
        <SectionWrapper id="story-section">
          <section className="py-20 px-6">
            <div className={`max-w-2xl mx-auto text-center space-y-6 transition-all duration-300 ${isGlass ? "glass p-10 rounded-2xl hover:shadow-lg" : ""}`}>
              <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>Cerita</p>
              <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Love Story</h2>
              <p className={`leading-relaxed whitespace-pre-line ${isGlass ? "" : "text-gray-600"}`}>{invitation.story}</p>
            </div>
          </section>
        </SectionWrapper>
      )}

      {/* Gallery */}
      {invitation.photos.length > 0 && (
        <SectionWrapper id="galeri-section">
          <section className="py-20 px-6" style={isGlass ? { background: "transparent" } : { background: c.secondary }}>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-2">
                <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>
                  <Camera size={14} className="inline mr-1.5 -mt-0.5" />
                  Galeri
                </p>
                <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Foto-Foto</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {invitation.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => { setSelectedPhoto(index); setIsModalOpen(true); }}
                    className={`aspect-square overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${isGlass ? "glass rounded-xl p-1" : "rounded-xl shadow-sm"}`}
                  >
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <img src={photo.url} alt={photo.caption || ""}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1" />
                    </div>
                    {photo.caption && (
                      <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {photo.caption}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </SectionWrapper>
      )}

      {/* Photo Modal */}
      {isModalOpen && selectedPhoto !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-all hover:scale-110 hover:rotate-90">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedPhoto((selectedPhoto! - 1 + invitation.photos.length) % invitation.photos.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl z-10 transition-all hover:scale-125 p-2">
            <ChevronLeft size={32} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedPhoto((selectedPhoto! + 1) % invitation.photos.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl z-10 transition-all hover:scale-125 p-2">
            <ChevronRight size={32} />
          </button>
          <div className="relative max-w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={invitation.photos[selectedPhoto!].url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            {invitation.photos[selectedPhoto!].caption && (
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                {invitation.photos[selectedPhoto!].caption}
              </p>
            )}
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            {selectedPhoto! + 1} / {invitation.photos.length}
          </p>
        </div>
      )}

      {/* Gift */}
      {invitation.bankAccounts.length > 0 && (
        <SectionWrapper id="amplop-section">
          <section className="py-20 px-6">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-2">
                <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>
                  <Gift size={14} className="inline mr-1.5 -mt-0.5" />
                  Amplop Digital
                </p>
                <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Tanda Kasih</h2>
                <p className="text-sm max-w-md mx-auto opacity-70">
                  Doa restu adalah hadiah terindah. Jika berkenan, dapat juga memberikan tanda kasih melalui:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitation.bankAccounts.map((account) => (
                  <div key={account.id} className={`rounded-xl p-5 space-y-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] ${isGlass ? "glass" : "bg-white border border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      {account.type === "bank" ? (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: c.primary }}>
                          {account.bankName?.slice(0, 2) || "BNK"}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: c.accent }}>
                          {account.provider?.slice(0, 2) || "EW"}
                        </div>
                      )}
                      <div className="text-left">
                        <p className={`text-sm font-medium ${isGlass ? "text-gray-800" : "text-gray-900"}`}>
                          {account.type === "bank" ? account.bankName : account.provider}
                        </p>
                        <p className="text-xs opacity-60">{account.type === "bank" ? "Transfer Bank" : "E-Wallet"}</p>
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <p className="text-lg font-bold tabular-nums" style={{ color: c.primary }}>{account.accountNumber}</p>
                      <p className="text-sm opacity-70">a.n. {account.accountName}</p>
                    </div>
                    <button onClick={() => copyNumber(account)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-all duration-200 border hover:bg-opacity-10 active:scale-95"
                      style={{ borderColor: c.primary, color: c.primary }}>
                      {copiedId === account.id ? (
                        <><Check size={16} className="animate-bounce-gentle" /> Tersalin!</>
                      ) : (
                        <><Copy size={16} /> Salin Nomor</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionWrapper>
      )}

      {/* Wishes */}
      <SectionWrapper id="ucapan-section">
        <section className="py-20 px-6" style={isGlass ? { background: "transparent" } : { background: c.secondary }}>
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="text-sm tracking-[0.25em] uppercase" style={{ color: c.accent }}>
                <MessageSquare size={14} className="inline mr-1.5 -mt-0.5" />
                Ucapan &amp; Doa
              </p>
              <h2 className="text-3xl font-great-vibes" style={{ color: c.primary }}>Ucapan &amp; Konfirmasi</h2>
            </div>

            <form onSubmit={handleSubmitWish} className={`rounded-xl p-6 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md ${isGlass ? "glass" : "bg-white"}`}>
              <div>
                <input name="name" type="text" required placeholder="Nama Anda"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 outline-none transition-all duration-300 ${isGlass ? "bg-white/70 backdrop-blur-sm border border-white/30 text-gray-800 placeholder:text-gray-400" : "border border-gray-200 focus:border-transparent"}`}
                  style={isGlass ? { borderColor: "rgba(255,255,255,0.3)" } : { borderColor: c.primary }} />
              </div>
              <div>
                <select name="attendance"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 outline-none ${isGlass ? "bg-white/70 backdrop-blur-sm border border-white/30 text-gray-800" : "border border-gray-200 text-gray-600"}`}
                  style={isGlass ? { borderColor: "rgba(255,255,255,0.2)" } : undefined}>
                  <option value="" className={isGlass ? "bg-white text-gray-800" : ""}>Konfirmasi Kehadiran</option>
                  <option value="hadir" className={isGlass ? "bg-white text-gray-800" : ""}>Hadir</option>
                  <option value="tidak_hadir" className={isGlass ? "bg-white text-gray-800" : ""}>Tidak Hadir</option>
                  <option value="ragu" className={isGlass ? "bg-white text-gray-800" : ""}>Masih Ragu</option>
                </select>
              </div>
              <div>
                <textarea name="message" required rows={3} placeholder="Tulis ucapan dan doa..."
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 outline-none transition-all duration-300 ${isGlass ? "bg-white/70 backdrop-blur-sm border border-white/30 text-gray-800 placeholder:text-gray-400" : "border border-gray-200 focus:border-transparent"}`}
                  style={isGlass ? { borderColor: "rgba(255,255,255,0.3)" } : undefined} />
              </div>
              <button type="submit" className="w-full py-2.5 text-white rounded-lg transition-all duration-300 text-sm hover:scale-[1.02] active:scale-95 hover:shadow-lg" style={{ background: c.primary }}>
                Kirim Ucapan
              </button>
            </form>

            <div className="space-y-4">
              {wishes.map((wish) => (
                <div key={wish.id} className={`rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isGlass ? "glass" : "bg-white"}`}>
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-sm" style={isGlass ? { color: "#1a1a1a" } : { color: "#1a1a1a" }}>{wish.name}</span>
                    {wish.attendance && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${wish.attendance === "hadir" ? "bg-green-100 text-green-700" : wish.attendance === "tidak_hadir" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {wish.attendance === "hadir" ? "Hadir" : wish.attendance === "tidak_hadir" ? "Tidak Hadir" : "Ragu"}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${isGlass ? "text-gray-700" : "text-gray-600"}`}>{wish.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* Footer */}
      <footer className={`py-12 px-6 text-center ${isGlass ? "glass-dark" : ""}`} style={isGlass ? { background: "transparent" } : { background: c.primary }}>
        <div className={`max-w-md mx-auto space-y-4 transition-all duration-300 ${isGlass ? "glass p-8 rounded-2xl hover:shadow-lg" : ""}`}>
          <h3 className="text-2xl font-great-vibes" style={{ color: isGlass ? c.primary : "#fff" }}>
            {invitation.brideName} &amp; {invitation.groomName}
          </h3>
          <p className={`text-sm ${isGlass ? "opacity-70" : "text-white/70"}`}>
            Terima kasih atas doa dan restu dari keluarga, sahabat, dan kerabat.
          </p>
          {invitation.instagramUrl && (
            <a href={invitation.instagramUrl || undefined} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-all duration-300 hover:scale-105"
              style={{ color: isGlass ? c.accent : "rgba(255,255,255,0.8)" }}>
              <ExternalLink size={18} />
              <span className="text-sm">Instagram</span>
            </a>
          )}
          <p className={`text-xs pt-4 ${isGlass ? "opacity-50" : "text-white/50"}`}>
            &copy; {new Date().getFullYear()} Undangan Online
          </p>
        </div>
      </footer>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 ${isGlass ? "glass-dark" : "bg-white/90 backdrop-blur-md"} border-t ${isGlass ? "border-white/10" : "border-gray-200"} animate-slide-up`}>
          <div className="max-w-lg mx-auto flex items-center justify-around py-1.5">
             {navItems.map((item) => {
               const isActive = activeSection === item.id;
               return (
                 <button
                   key={item.id}
                   onClick={() => scrollToSection(item.id)}
                   className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-300 relative ${isActive ? "scale-110" : "opacity-50 hover:opacity-80 hover:scale-105"}`}
                   style={{ color: isActive ? c.primary : (isGlass ? "rgba(255,255,255,0.7)" : "#666") }}
                 >
                   <item.icon size={20} className={isActive ? "animate-bounce-gentle" : ""} />
                   <span className="text-[10px] font-medium">{item.label}</span>
                   {isActive && (
                     <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: c.primary }} />
                   )}
                 </button>
               );
             })}
          </div>
        </nav>
      )}
    </div>
  );
}

