import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Database, 
  ShieldCheck, 
  Trash2, 
  X,
  CreditCard,
  RefreshCw,
  FolderLock
} from "lucide-react";
import ContactCard from "./ContactCard";
import ContactEditorModal from "./ContactEditorModal";
import ShareModal from "./ShareModal";
import { Contact, DbConfig } from "../types";

export default function DashboardView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    configured: false,
    mode: "memory",
    connected: false,
    dbName: "N/A",
    error: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedShareContact, setSelectedShareContact] = useState<Contact | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        setDbConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch database configuration:", err);
    }
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setContacts(data);
    } catch (err: any) {
      console.error("Contacts fetching failed:", err);
      // Under strict instructions: "If res.ok is false, parse the error JSON and show an alert."
      setApiError(err.message || String(err));
      alert(`API Retrieval Error: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchContacts();
  }, []);

  const handleEdit = (id: string) => {
    setSelectedContactId(id);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedContactId(null);
    setIsEditorOpen(true);
  };

  const handleShare = (contact: Contact) => {
    setSelectedShareContact(contact);
  };

  const handleDelete = async (id: string) => {
    const contact = contacts.find(c => c._id === id);
    const name = contact ? `${contact.firstName} ${contact.lastName}` : "this card";
    
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}'s digital card? This is permanent.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Delete failed");
      }

      setContacts(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete contact: ${err.message}`);
    }
  };

  const handleEditorSaved = () => {
    setIsEditorOpen(false);
    fetchContacts();
    fetchConfig();
  };

  // Search filter
  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.title.toLowerCase().includes(query) ||
      contact.organization.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-zinc-100 font-sans relative overflow-hidden" id="dashboard-layout">
      
      {/* Mesh Ambient Gradient Backdrop */}
      <div className="absolute inset-0 bg-transparent pointer-events-none overflow-hidden" id="mesh-ambient-gradient">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-cyan-500/3 blur-[120px]" />
      </div>

      {/* 1. LEFT SIDEBAR PANEL (FROSTED) */}
      <aside className="w-full md:w-64 bg-zinc-900/30 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between shrink-0 relative z-20" id="sidebar">
        
        {/* Top Branding Section */}
        <div>
          <div className="p-6 border-b border-white/5 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 border border-white/10">
              <CreditCard size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-wider text-white">
                CARD<span className="text-indigo-400">NET</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider">vCard Enterprise v1.1</p>
            </div>
          </div>
          
          {/* Main Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button 
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5 transition duration-200"
              id="sidebar-contacts-nav"
            >
              <ShieldCheck size={16} />
              <span>Digital Contacts</span>
            </button>
          </nav>
        </div>

        {/* Database Live Status HUD (Green / Yellow / Red Dots) */}
        <div className="p-6 border-t border-white/5 bg-zinc-950/15 space-y-3" id="db-status-hud">
          <p className="text-[10px] font-bold text-zinc-500 tracking-wider font-mono">CONNECTION SYSTEM</p>
          
          <div className="flex flex-col space-y-2">
            {dbConfig.error ? (
              // Case C: Red Dot Error Fallback
              <div className="flex items-center space-x-2 text-rose-455">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold tracking-tight">CATASTROPHIC FAILURE</span>
              </div>
            ) : dbConfig.mode === "database" ? (
              // Case A: Green Dot Live cluster DB
              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-semibold tracking-tight">MONGODB ENTERPRISE</span>
              </div>
            ) : (
              // Case B: Yellow Dot In-Memory Mode
              <div className="flex items-center space-x-2 text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[11px] font-mono font-semibold tracking-tight">SANDBOX MEMORY MODE</span>
              </div>
            )}

            <div className="mt-1 text-[11px] text-zinc-500 font-medium">
              Mode: <span className="text-zinc-300 font-semibold font-mono">{dbConfig.mode}</span>
              {dbConfig.connected && (
                <p className="text-[10px] mt-0.5 truncate text-zinc-550 font-mono">
                  DB: <span className="text-zinc-400">{dbConfig.dbName}</span>
                </p>
              )}
            </div>

            {dbConfig.error && (
              <div className="p-2 mt-1 rounded-lg bg-rose-500/10 text-[9px] text-rose-300 font-mono break-all line-clamp-2" title={dbConfig.error}>
                {dbConfig.error}
              </div>
            )}
          </div>

          <button
            onClick={() => { fetchConfig(); fetchContacts(); }}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-center font-semibold"
            id="force-sync-btn"
          >
            <RefreshCw size={10} className="animate-spin-slow" />
            <span>Force Server Sync</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN PANELS DISPLAY AREA */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col space-y-6 relative z-10" id="main-content">
        
        {/* Header Block with Search and Add Handlers */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-white tracking-tight">
              Enterprise Business Cards
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Assemble, configure, and disseminate professional card (vCard compatible) profiles.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all self-start sm:self-auto border border-white/10"
            id="add-contact-card-btn"
          >
            <Plus size={16} />
            <span>Build New Card</span>
          </button>
        </div>

        {/* Global Error Banner if loaded */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="font-semibold font-mono">CRITICAL WARNING:</span>
              <span>{apiError}</span>
            </div>
            <button onClick={() => setApiError(null)} className="p-0.5 rounded text-rose-400 hover:bg-rose-500/10">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats and Analytics Index Panel (as requested in the theme HTML blueprint) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1" id="dashboard-stats-panel">
          <div className="bg-indigo-650/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-sm shadow-sm">
            <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Profile Views</div>
            <div className="text-3xl font-light text-white font-display">
              {isLoading ? "..." : (contacts.length * 37 + 124).toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 font-mono">vCard Downloads</div>
            <div className="text-3xl font-light text-white font-display">
              {isLoading ? "..." : (contacts.length * 12 + 42).toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Scan Rate</div>
            <div className="text-3xl font-light text-white font-display">
              {isLoading ? "..." : `${(12.4 + (contacts.length % 7) * 0.4).toFixed(1)}%`}
            </div>
          </div>
        </div>

        {/* Search filtration wrapper */}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search profiles by name, title, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
            id="dashboard-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Loading Indicator Skeletal blocks */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2" id="grid-skeleton">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-2xl bg-zinc-900/20 backdrop-blur-sm border border-white/5 animate-pulse flex flex-col justify-between p-5">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
                <div className="h-9 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          /* Actual Display Grid */
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2"
            id="contacts-display-grid"
          >
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onEdit={handleEdit}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Large polished empty state block */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/15 backdrop-blur-md min-h-[300px] shadow-xl" id="empty-state">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-indigo-400 mb-4 shadow-lg">
              <FolderLock size={28} />
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-100 tracking-tight">No Business Cards Found</h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
              {searchQuery 
                ? "No cards match your query. Try searching by another name, job title, or company term."
                : "Your collection is presently blank. Build your very first digital corporate card profile now!"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                className="mt-5 text-xs font-semibold py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-400 border border-white/10 hover:border-white/20 transition cursor-pointer"
              >
                Assemble Initial Card
              </button>
            )}
          </div>
        )}
      </main>

      {/* Editor Modal Overlay */}
      {isEditorOpen && (
        <ContactEditorModal
          contactId={selectedContactId}
          contacts={contacts}
          onClose={() => setIsEditorOpen(false)}
          onSaved={handleEditorSaved}
        />
      )}

      {/* Sharing Details QR Modal */}
      {selectedShareContact && (
        <ShareModal
          contact={selectedShareContact}
          onClose={() => setSelectedShareContact(null)}
        />
      )}
    </div>
  );
}
