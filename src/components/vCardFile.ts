import { Contact } from "../types.js";

export function downloadVCard(contact: Contact) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contact.firstName} ${contact.lastName}`,
    `N:${contact.lastName};${contact.firstName};;;`,
  ];

  if (contact.organization) {
    lines.push(`ORG:${contact.organization}`);
  }
  if (contact.title) {
    lines.push(`TITLE:${contact.title}`);
  }
  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }
  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${contact.email}`);
  }
  if (contact.address) {
    lines.push(`ADR;TYPE=WORK:;;${contact.address};;;`);
  }
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }
  if (contact.linkedin) {
    lines.push(`X-SOCIALPROFILE;type=linkedin:${contact.linkedin}`);
  }
  if (contact.twitter) {
    lines.push(`X-SOCIALPROFILE;type=twitter:${contact.twitter}`);
  }
  if (contact.github) {
    lines.push(`X-SOCIALPROFILE;type=github:${contact.github}`);
  }

  lines.push("END:VCARD");

  const vCardContent = lines.filter(Boolean).join("\r\n");
  const blob = new Blob([vCardContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${contact.firstName}_${contact.lastName}.vcf`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
