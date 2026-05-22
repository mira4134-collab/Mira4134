import React from "react";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter, 
  Github, 
  Globe, 
  Edit3, 
  Trash2, 
  Share2, 
  FileDown 
} from "lucide-react";
import { Contact } from "../types";
import { downloadVCard } from "./vCardFile";

interface ContactCardProps {
  key?: string;
  contact: Contact;
  onEdit: (id: string) => void;
  onShare: (contact: Contact) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function getInitials(first: string, last: string) {
  return `${first.charAt(0) || ""}${last.charAt(0) || ""}`.toUpperCase();
}

export function getBgGradient(first: string, last: string) {
  const fullName = `${first}${last}`;
  const hash = fullName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "from-indigo-600 to-cyan-500",
    "from-purple-600 to-fuchsia-500",
    "from-teal-600 to-emerald-500",
    "from-amber-600 to-orange-500",
    "from-rose-600 to-pink-500",
    "from-blue-600 to-indigo-500",
  ];
  return gradients[hash % gradients.length];
}

export default function ContactCard({ contact, onEdit, onShare, onDelete }: ContactCardProps) {
  const initials = getInitials(contact.firstName, contact.lastName);
  const bgGradient = getBgGradient(contact.firstName, contact.lastName);

  return (
    <div 
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      id={`contact-card-${contact._id}`}
    >
      {/* Visual Accent header tag */}
      <div className={`h-1 w-full bg-gradient-to-r ${bgGradient}`} />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Core Profile Area */}
        <div className="flex items-start space-x-4">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={`${contact.firstName} ${contact.lastName}`}
              className="h-14 w-14 rounded-full object-cover border-2 border-white/15 shadow-xl flex-shrink-0"
              referrerPolicy="no-referrer"
              id={`avatar-${contact._id}`}
            />
          ) : (
            <div 
              className={`h-14 w-14 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white font-display font-semibold text-lg border border-white/15 shadow-xl flex-shrink-0`}
              id={`avatar-initials-${contact._id}`}
            >
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 
              className="text-base font-semibold text-zinc-100 font-display tracking-tight truncate group-hover:text-amber-100 transition duration-200"
              id={`name-${contact._id}`}
            >
              {contact.firstName} {contact.lastName}
            </h4>
            
            {contact.title && (
              <p className="text-xs font-medium text-zinc-300 mt-0.5 truncate" id={`title-${contact._id}`}>
                {contact.title}
              </p>
            )}

            {contact.organization && (
              <p className="text-xs text-zinc-400 flex items-center mt-1 truncate" id={`org-${contact._id}`}>
                <Building2 size={12} className="mr-1 inline text-zinc-500" />
                {contact.organization}
              </p>
            )}
          </div>
        </div>

        {/* Address tag if exist */}
        {contact.address && (
          <div className="mt-4 text-xs text-zinc-400 truncate flex items-center border-t border-white/5 pt-3">
            <MapPin size={12} className="mr-1 text-zinc-500 shrink-0" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}

        {/* Social Link Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
          {contact.website && (
            <a
              href={contact.website}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              title="Website"
            >
              <Globe size={13} />
            </a>
          )}
          {contact.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              title="LinkedIn"
            >
              <Linkedin size={13} />
            </a>
          )}
          {contact.twitter && (
            <a
              href={contact.twitter}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              title="Twitter / X"
            >
              <Twitter size={13} />
            </a>
          )}
          {contact.github && (
            <a
              href={contact.github}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              title="GitHub"
            >
              <Github size={13} />
            </a>
          )}
        </div>

        {/* Direct Phone & Email row as requested (Muted text under socials) */}
        <div className="mt-3.5 space-y-1 text-xs text-zinc-550 border-t border-white/5 pt-3">
          {contact.phone && (
            <div className="flex items-center space-x-1.5 truncate">
              <Phone size={11} className="text-zinc-600 shrink-0" />
              <span className="truncate font-mono">{contact.phone}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center space-x-1.5 truncate">
              <Mail size={11} className="text-zinc-600 shrink-0" />
              <span className="truncate font-mono">{contact.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (Footer of the card) */}
      <div className="flex border-t border-white/5 bg-zinc-950/30 p-2.5 space-x-2 backdrop-blur-sm">
        <button
          onClick={() => onEdit(contact._id)}
          className="flex-1 flex items-center justify-center space-x-1.5 text-[11px] font-medium py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all"
          id={`edit-contact-btn-${contact._id}`}
        >
          <Edit3 size={12} />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onShare(contact)}
          className="flex-1 flex items-center justify-center space-x-1.5 text-[11px] font-medium py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all"
          id={`share-contact-btn-${contact._id}`}
        >
          <Share2 size={12} />
          <span>Share</span>
        </button>

        <button
          onClick={() => downloadVCard(contact)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all"
          title="Download vCard"
          id={`download-vcard-btn-${contact._id}`}
        >
          <FileDown size={13} />
        </button>

        <button
          onClick={() => onDelete(contact._id)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-zinc-500 hover:text-rose-450 transition-all"
          title="Delete Contact"
          id={`delete-btn-${contact._id}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
