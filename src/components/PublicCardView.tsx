import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github, 
  UserPlus, 
  Share2, 
  ArrowLeft,
  Building2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Contact } from "../types";
import { downloadVCard } from "./vCardFile";
import ShareModal from "./ShareModal";
import { getInitials, getBgGradient } from "./ContactCard";

export default function PublicCardView() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await fetch(`/api/contacts/${id}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Contact is not available");
        }
        const data = await response.json();
        setContact(data);
      } catch (err: any) {
        console.error("Public card fetch failed:", err);
        setErrorMsg(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchContact();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 space-y-6 animate-pulse">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-24 w-24 rounded-full bg-zinc-800" />
            <div className="h-6 bg-zinc-800 rounded w-1/2" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-14 bg-zinc-800 rounded-xl" />
            <div className="h-14 bg-zinc-800 rounded-xl" />
            <div className="h-14 bg-zinc-800 rounded-xl" />
          </div>
          <div className="h-10 bg-zinc-800 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (errorMsg || !contact) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <MapPin size={24} />
          </div>
          <h2 className="font-display font-bold text-xl text-white">Profile Card Not Present</h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            The digital business card could not be retrieved. The profile link may be expired, or the unique identifier is malformed.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 px-5 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft size={14} />
              <span>Go to CARDNET portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = getInitials(contact.firstName, contact.lastName);
  const bgGradient = getBgGradient(contact.firstName, contact.lastName);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-start items-center relative py-12 px-4 md:px-0 select-none overflow-x-hidden">
      
      {/* Immersive background ambient gradient circles */}
      <div className="absolute inset-0 bg-transparent pointer-events-none overflow-hidden" id="mesh-ambient-gradient">
        <div className={`absolute top-[-5%] left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-br ${bgGradient} opacity-[0.22] rounded-full filter blur-[110px]`} />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Floating admin portal gateway link */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-xs text-zinc-300 hover:text-white transition duration-200"
          id="back-portal-gateway-btn"
        >
          <ArrowLeft size={13} />
          <span className="font-semibold">Portal</span>
        </Link>
      </div>

      {/* PHONE MOCKUP FRAME */}
      <div className="w-full max-w-sm border-[6px] border-zinc-900 rounded-[44px] p-2 bg-zinc-900/60 backdrop-blur-md relative z-10 shadow-3xl overflow-hidden mt-6" id="cards-mobile-frame">
        {/* Inner Phone Content */}
        <div className="bg-zinc-950/80 rounded-[36px] overflow-hidden flex flex-col relative p-6 space-y-6">
          
          {/* Inner Mesh Gradient Background */}
          <div className="absolute inset-0 bg-indigo-950/10 pointer-events-none" style={{ backgroundImage: `radial-gradient(at top left, #4338ca 0%, transparent 50%), radial-gradient(at bottom right, #312e81 0%, transparent 50%)`, filter: "blur(30px)", opacity: 0.4 }} />

          {/* TOP PROFILE HEADER BLOCK */}
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={`${contact.firstName} ${contact.lastName}`}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/15 shadow-xl bg-zinc-900 relative z-10"
                referrerPolicy="no-referrer"
                id="public-avatar"
              />
            ) : (
              <div 
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center font-display font-black text-2xl text-white border-2 border-white/15 shadow-xl shrink-0`}
                id="public-avatar-initials"
              >
                {initials}
              </div>
            )}

            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight text-white" id="public-fullname">
                {contact.firstName} {contact.lastName}
              </h2>
              
              {contact.title && (
                <p className="text-xs font-semibold tracking-wide text-indigo-400 uppercase" id="public-title">
                  {contact.title}
                </p>
              )}

              {contact.organization && (
                <div className="flex items-center justify-center text-xs text-zinc-400 font-medium" id="public-org">
                  <Building2 size={11} className="mr-1 inline text-zinc-500 shrink-0" />
                  <span>{contact.organization}</span>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE - 4 QUICK FROSTED ACTIONS VERTICAL LIST */}
          <div className="space-y-2.5 relative z-10" id="public-quick-actions">
            {/* Phone call Action */}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center space-x-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                id="public-action-phone"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-455 rounded-lg border border-indigo-500/10">
                  <Phone size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[8px] text-zinc-500 font-mono tracking-wider font-bold">TELEPHONE CONTACT</span>
                  <span className="block text-zinc-250 text-xs font-semibold truncate font-mono">{contact.phone}</span>
                </div>
                <ChevronRight size={13} className="text-zinc-650" />
              </a>
            )}

            {/* Email write Action */}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center space-x-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                id="public-action-email"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-455 rounded-lg border border-indigo-500/10">
                  <Mail size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[8px] text-zinc-500 font-mono tracking-wider font-bold">SEND EMAIL ADDRESS</span>
                  <span className="block text-zinc-250 text-xs font-semibold truncate font-mono">{contact.email}</span>
                </div>
                <ChevronRight size={13} className="text-zinc-650" />
              </a>
            )}

            {/* SMS messaging Action */}
            {contact.phone && (
              <a
                href={`sms:${contact.phone}`}
                className="flex items-center space-x-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                id="public-action-sms"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-455 rounded-lg border border-indigo-500/10">
                  <MessageSquare size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[8px] text-zinc-500 font-mono tracking-wider font-bold">CELL TEXT MESSAGE (SMS)</span>
                  <span className="block text-zinc-250 text-xs font-semibold truncate font-mono">{contact.phone}</span>
                </div>
                <ChevronRight size={13} className="text-zinc-650" />
              </a>
            )}

            {/* Map address navigation query Action */}
            {contact.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                id="public-action-map"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-455 rounded-lg border border-indigo-500/10">
                  <MapPin size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[8px] text-zinc-500 font-mono tracking-wider font-bold">MAP ROUTING DIRECTIONS</span>
                  <span className="block text-zinc-250 text-xs font-sans truncate">{contact.address}</span>
                </div>
                <ChevronRight size={13} className="text-zinc-650" />
              </a>
            )}
          </div>

          {/* LOWER - FROSTED SOCIAL TILES PORTFOLIO */}
          {(contact.website || contact.linkedin || contact.twitter || contact.github) && (
            <div className="space-y-2.5 pt-2 relative z-10" id="public-socials">
              <p className="text-[9px] font-bold text-zinc-500 tracking-wider font-mono">PORTFOLIO & SOCIALS</p>
              
              <div className="grid grid-cols-2 gap-3.5">
                {contact.website && (
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all truncate"
                    id="social-tile-website"
                  >
                    <Globe size={13} className="text-zinc-400 mr-2 shrink-0" />
                    <span className="text-zinc-300 text-xs font-medium truncate">Website</span>
                  </a>
                )}

                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all truncate"
                    id="social-tile-linkedin"
                  >
                    <Linkedin size={13} className="text-zinc-400 mr-2 shrink-0" />
                    <span className="text-zinc-300 text-xs font-medium truncate">LinkedIn</span>
                  </a>
                )}

                {contact.twitter && (
                  <a
                    href={contact.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all truncate"
                    id="social-tile-twitter"
                  >
                    <Twitter size={13} className="text-zinc-400 mr-2 shrink-0" />
                    <span className="text-zinc-300 text-xs font-medium truncate">Twitter / X</span>
                  </a>
                )}

                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all truncate"
                    id="social-tile-github"
                  >
                    <Github size={13} className="text-zinc-400 mr-2 shrink-0" />
                    <span className="text-zinc-300 text-xs font-medium truncate">GitHub</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM UTILITY ACTIONS */}
          <div className="flex gap-3 pt-6 border-t border-white/5 relative z-10" id="public-utility-footer">
            <button
              onClick={() => downloadVCard(contact)}
              className="flex-1 flex items-center justify-center space-x-1.5 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
              id="public-add-contacts-btn"
            >
              <UserPlus size={14} />
              <span>Add vCard</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              id="public-share-btn"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>

          {/* Small phone home bottom indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Small humble footer branding */}
      <div className="text-center pt-8 relative z-10">
        <span className="text-[10px] tracking-wider text-zinc-600 inline-flex items-center space-x-1.5 uppercase font-mono">
          <span>Powered by</span>
          <span className="text-zinc-500 font-bold">CARDNET Digital Ecosystem</span>
        </span>
      </div>

      {isShareOpen && (
        <ShareModal
          contact={contact}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
