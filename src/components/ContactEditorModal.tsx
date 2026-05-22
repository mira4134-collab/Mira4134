import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Upload, 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github, 
  Save, 
  Image as ImageIcon,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Contact } from "../types";
import { getInitials, getBgGradient } from "./ContactCard";

interface ContactEditorModalProps {
  contactId: string | null; // null if creating new
  contacts: Contact[];
  onClose: () => void;
  onSaved: () => void;
}

const emptyFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  title: "",
  organization: "",
  website: "",
  address: "",
  linkedin: "",
  twitter: "",
  github: "",
  avatar: "",
};

export default function ContactEditorModal({ contactId, contacts, onClose, onSaved }: ContactEditorModalProps) {
  const [formData, setFormData] = useState(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!contactId;

  // Load initial data if editing
  useEffect(() => {
    if (isEditing && contactId) {
      const existing = contacts.find(c => c._id === contactId);
      if (existing) {
        setFormData({
          firstName: existing.firstName || "",
          lastName: existing.lastName || "",
          email: existing.email || "",
          phone: existing.phone || "",
          title: existing.title || "",
          organization: existing.organization || "",
          website: existing.website || "",
          address: existing.address || "",
          linkedin: existing.linkedin || "",
          twitter: existing.twitter || "",
          github: existing.github || "",
          avatar: existing.avatar || "",
        });
      }
    } else {
      setFormData(emptyFormState);
    }
    setErrorMessage(null);
  }, [contactId, isEditing, contacts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Process selected file (helper)
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Unsupported file format. Please upload an image (PNG, JPEG, WEBP).");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage("Image is too large. Base64 payload size must remain below 1.5 MB.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DropEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("First Name and Last Name are required fields.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const url = isEditing ? `/api/contacts/${contactId}` : "/api/contacts";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status} failed`);
      }

      onSaved();
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving the contact");
    } finally {
      setIsSaving(false);
    }
  };

  const prevInitials = getInitials(formData.firstName || "C", formData.lastName || "N");
  const prevGradient = getBgGradient(formData.firstName || "C", formData.lastName || "N");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          className="relative w-full max-w-5xl rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-zinc-100 grid grid-cols-1 lg:grid-cols-12 min-h-[500px]"
        >
          {/* Form Side - Column Spans 7 */}
          <div className="lg:col-span-7 p-6 md:p-8 border-r border-white/5 flex flex-col h-full overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold tracking-tight text-white flex items-center">
                {isEditing ? "Edit Digital Business Card" : "Build Digital Business Card"}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed flex items-center">
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    FIRST NAME *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    LAST NAME *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Jenkins"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Title & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    JOB TITLE
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. VP of Engineering"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    ORGANIZATION
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="e.g. TechVanguard"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sarah@techvanguard.dev"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Website and Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                  WEBSITE / PORTFOLIO URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="e.g. https://sarahjenkins.dev"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                  PHYSICAL ADDRESS
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 Innovation Way, San Francisco, CA"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
                />
              </div>

              {/* Social URLs */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                <p className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-2">
                  SOCIAL NETWORKS
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Linkedin size={14} />
                    </span>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn Profile Link"
                      className="flex-1 bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-xs py-1.5 outline-none transition"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Twitter size={14} />
                    </span>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="Twitter / X Profile Link"
                      className="flex-1 bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-xs py-1.5 outline-none transition"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Github size={14} />
                    </span>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      placeholder="GitHub Profile Link"
                      className="flex-1 bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-xs py-1.5 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar File Loader with Drag & Drop */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                  AVATAR PICTURE
                </label>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver 
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-400" 
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-950/70"
                  }`}
                  id="avatar-drop-zone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {formData.avatar ? (
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3 text-left">
                        <img
                          src={formData.avatar}
                          alt="Avatar Preview"
                          className="h-12 w-12 rounded-full object-cover border border-zinc-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-medium text-zinc-200">Custom image loaded</p>
                          <p className="text-[10px] text-zinc-500">Base64 encoded data url</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-xs bg-zinc-900 border border-zinc-850 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 py-1.5 px-3 rounded-lg text-zinc-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Upload size={16} />
                      </div>
                      <div className="text-xs text-zinc-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag & drop contact image here
                      </div>
                      <p className="text-[10px] text-zinc-500">PNG, JPG, WEBP formats up to 1.5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-center py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-sm font-medium border border-zinc-850 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-2 flex items-center justify-center space-x-2 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer disabled:opacity-50 transition shadow-lg shadow-indigo-600/10"
                  id="save-contact-submit"
                >
                  {isSaving ? (
                    <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{isEditing ? "Save Card Changes" : "Create Card Profile"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Live Business Card Preview (Desktop Only) Spans 5 */}
          <div className="hidden lg:col-span-5 bg-zinc-950/45 backdrop-blur-md p-8 flex-col justify-center items-center relative overflow-hidden">
            {/* Ambient glows */}
            <div className={`absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/15 rounded-full filter blur-3xl`} />
            <div className={`absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-3xl`} />
            
            <div className="w-full max-w-sm flex flex-col space-y-4 relative z-10">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase text-center mb-1">
                ✦ LIVE REAL-TIME CARD PREVIEW ✦
              </span>

              {/* Physical style Card */}
              <div className="w-full relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
                {/* Micro tech pattern lines */}
                <div className="absolute inset-0 bg-transparent pointer-events-none border border-white/5 opacity-40 rounded-2xl m-1" />
                
                {/* Branding Indicator */}
                <div className="flex justify-between items-center mb-6 z-15 relative">
                  <span className="text-[11px] font-mono tracking-widest font-black text-white/40">
                    CARDNET CARD
                  </span>
                  <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-tr ${prevGradient}`} />
                </div>

                <div className="flex items-start gap-4">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Preview Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/15"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${prevGradient} flex items-center justify-center font-display font-black text-xl text-white border border-white/10 shrink-0 shadow-lg`}>
                      {prevInitials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h4 className="font-display text-lg font-bold tracking-tight text-white leading-tight truncate">
                      {formData.firstName || "John"} {formData.lastName || "Smith"}
                    </h4>
                    
                    <p className="text-zinc-300 text-xs font-semibold tracking-wide truncate">
                      {formData.title || "Full Stack Architect"}
                    </p>

                    {formData.organization && (
                      <div className="flex items-center text-[11px] text-zinc-400 truncate">
                        <Building2 size={11} className="mr-1 inline font-medium text-zinc-500" />
                        <span className="truncate">{formData.organization}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 space-y-2.5">
                  {formData.phone ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Phone size={12} className="text-zinc-500 shrink-0" />
                      <span className="font-mono">{formData.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Phone size={12} className="text-zinc-700 shrink-0" />
                      <span className="font-mono italic">No phone specified</span>
                    </div>
                  )}

                  {formData.email ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Mail size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Mail size={12} className="text-zinc-700 shrink-0" />
                      <span className="italic">No email specified</span>
                    </div>
                  )}

                  {formData.address && (
                    <div className="flex items-start gap-2 text-xs text-zinc-400">
                      <MapPin size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px] font-medium">{formData.address}</span>
                    </div>
                  )}
                </div>

                {/* Social icons indicator in preview card */}
                <div className="mt-6 flex gap-2">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition ${formData.website ? "bg-white/10 text-white" : "bg-white/2 text-zinc-750"}`}>
                    <Globe size={11} />
                  </span>
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition ${formData.linkedin ? "bg-white/10 text-white" : "bg-white/2 text-zinc-750"}`}>
                    <Linkedin size={11} />
                  </span>
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition ${formData.twitter ? "bg-white/10 text-white" : "bg-white/2 text-zinc-750"}`}>
                    <Twitter size={11} />
                  </span>
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition ${formData.github ? "bg-white/10 text-white" : "bg-white/2 text-zinc-750"}`}>
                    <Github size={11} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
