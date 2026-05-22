import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Contact } from "../types";

interface ShareModalProps {
  contact: Contact | null;
  onClose: () => void;
}

export default function ShareModal({ contact, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const shareUrl = `${window.location.origin}/card/${contact._id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          id="share-backdrop"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white"
          id="share-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-semibold tracking-tight text-white">
              Share Business Card
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
              id="close-share-modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-xl transition-all hover:scale-105 duration-350">
              <QRCodeSVG
                value={shareUrl}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "", // Can hold small center logo if desired
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            <div className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Scan this QR code with any mobile device to view and download{" "}
              <span className="font-medium text-indigo-300">
                {contact.firstName} {contact.lastName}
              </span>
              's digital profile directly.
            </div>

            {/* URL Input Copy Section */}
            <div className="w-full flex items-center space-x-2 bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-zinc-300 outline-none select-all truncate font-mono"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center p-2 rounded-lg transition-all font-medium text-xs space-x-1 duration-200 ${
                  copied
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25"
                }`}
                id="copy-link-btn"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Link */}
            <div className="flex space-x-4 pt-2">
              <a
                href={`/card/${contact._id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition space-x-1"
                id="open-live-preview-link"
              >
                <span>Open card profile in new window</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
