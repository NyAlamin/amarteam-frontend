import jsPDF from "jspdf";
import { Player } from "./types";
import { TeamRequest, TEAM_STATUS_INFO } from "./types";


// Convert image URL to base64 for embedding in PDF
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const GREEN: [number, number, number] = [22, 163, 74];
const DARK: [number, number, number] = [30, 41, 59];
const GRAY: [number, number, number] = [100, 116, 139];
const LIGHT: [number, number, number] = [241, 245, 249];

export async function generatePlayerPDF(p: Player) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  let y = 0;

  const typeLabel = p.playerType === "coach" ? "COACH" : p.playerType === "referee" ? "REFEREE" : "PLAYER";
  const currentClub = p.clubs?.find(c => c.isCurrent);
  const currentNational = p.nationalTeams?.find(n => n.isCurrent);

  // ─── HEADER BANNER ───
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 45, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AMAR TEAM", 14, 10);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Bangladesh Football Talent Platform", 14, 14);

  // Photo
  let photoAdded = false;
  if (p.photo) {
    const base64 = await imageToBase64(p.photo);
    if (base64) {
      try {
        doc.addImage(base64, "JPEG", 14, 18, 24, 24);
        photoAdded = true;
      } catch {}
    }
  }
  if (!photoAdded) {
    doc.setFillColor(255, 255, 255);
    doc.circle(26, 30, 12, "F");
    doc.setTextColor(...GREEN);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(p.user?.name?.charAt(0) || "?", 26, 34, { align: "center" });
  }

  // Name & Info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(p.user?.name || "—", photoAdded ? 43 : 43, 27);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subLine = [
    p.position,
    currentClub?.name,
    p.location,
  ].filter(Boolean).join("  •  ");
  doc.text(subLine || "—", 43, 33);

  // Tier + Type badges
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(43, 36, 22, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...GREEN);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`TIER ${p.tier}`, 54, 39.8, { align: "center" });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(67, 36, 24, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...GREEN);
  doc.text(typeLabel, 79, 39.8, { align: "center" });

  // Rating
  if (p.reviews?.length > 0) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Rating: ${Number(p.rating).toFixed(1)}/5  (${p.reviews.length} reviews)`, W - 14, 39.8, { align: "right" });
  }

  y = 53;

  // ─── SECTION HELPER ───
  const section = (title: string) => {
    doc.setFillColor(...LIGHT);
    doc.rect(14, y - 4, W - 28, 7, "F");
    doc.setTextColor(...GREEN);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 17, y);
    y += 8;
  };

  const field = (label: string, value: string) => {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, 17, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value || "—", 65, y);
    y += 5.5;
  };

  const checkPage = (need = 20) => {
    if (y > 275 - need) { doc.addPage(); y = 20; }
  };

  // ─── BASIC INFO ───
  section("Basic Information");
  field("Full Name", p.user?.name || "—");
  field("Email", p.user?.email || "—");
  field("Phone", p.user?.phone || "—");
  field("Age", `${p.age} years`);
  field("Experience", `${p.experience} years`);
  field("Location", p.location || "—");
  field("Availability", p.isAvailable ? "Available for hire" : "Currently unavailable");
  field("Profile Status", p.isApproved ? "Approved" : "Pending approval");
  y += 3;

  // ─── ROLE-SPECIFIC ───
  checkPage(40);

  if (p.playerType === "player") {
    section("Player Statistics");
    const s = p.stats || {} as any;
    const statBoxes = [
      { l: "Matches", v: s.matches || 0 },
      { l: "Goals", v: s.goals || 0 },
      { l: "Assists", v: s.assists || 0 },
      { l: "Clean Sheets", v: s.cleanSheets || 0 },
      { l: "Yellow Cards", v: s.yellowCards || 0 },
      { l: "Red Cards", v: s.redCards || 0 },
    ];
    let bx = 17;
    statBoxes.forEach((sb, i) => {
      if (i === 3) { bx = 17; y += 16; }
      doc.setDrawColor(...LIGHT);
      doc.setFillColor(250, 250, 252);
      doc.roundedRect(bx, y - 3, 55, 13, 1.5, 1.5, "FD");
      doc.setTextColor(...GREEN);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(String(sb.v), bx + 27.5, y + 2.5, { align: "center" });
      doc.setTextColor(...GRAY);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(sb.l, bx + 27.5, y + 7, { align: "center" });
      bx += 59;
    });
    y += 18;
  }

  if (p.playerType === "coach") {
    section("Coaching Details");
    field("Specialization", p.specialization || "—");
    field("Coaching License", p.coachingLicense || "—");
    if (p.tacticsStyle) {
      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Tactical Style", 17, y);
      y += 4;
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(p.tacticsStyle, W - 40);
      doc.text(lines, 17, y);
      y += lines.length * 4 + 2;
    }
    y += 3;
  }

  if (p.playerType === "referee") {
    section("Referee Details");
    field("License Level", p.refereeLicense || "—");
    field("Matches Officiated", String(p.matchesOfficiated || 0));
    field("FIFA Badge", p.fifaBadge ? "Yes — FIFA Badge Holder" : "No");
    y += 3;
  }

  // ─── BIO ───
  if (p.bio) {
    checkPage(25);
    section("About");
    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const bioLines = doc.splitTextToSize(p.bio, W - 34);
    doc.text(bioLines, 17, y);
    y += bioLines.length * 4.2 + 5;
  }

  // ─── CLUB HISTORY ───
  if (p.clubs?.length > 0) {
    checkPage(20 + p.clubs.length * 6);
    section(p.playerType === "referee" ? "Associations" : "Club History");

    // Table header
    doc.setFillColor(250, 250, 252);
    doc.rect(17, y - 3.5, W - 34, 6, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("NAME", 20, y);
    doc.text("FROM", 120, y);
    doc.text("TO", 145, y);
    doc.text("STATUS", 168, y);
    y += 6;

    p.clubs.forEach((c, i) => {
      checkPage(10);
      if (i % 2 === 0) {
        doc.setFillColor(252, 253, 254);
        doc.rect(17, y - 3.5, W - 34, 6, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(c.name.substring(0, 45), 20, y);
      doc.text(String(c.joinYear), 120, y);
      doc.text(c.isCurrent ? "Present" : String(c.leftYear || "—"), 145, y);
      if (c.isCurrent) {
        doc.setTextColor(...GREEN);
        doc.setFont("helvetica", "bold");
        doc.text("CURRENT", 168, y);
      } else {
        doc.setTextColor(...GRAY);
        doc.text("Past", 168, y);
      }
      y += 6;
    });
    y += 4;
  }

  // ─── NATIONAL TEAM ───
  if (p.nationalTeams?.length > 0) {
    checkPage(20 + p.nationalTeams.length * 6);
    section("National Team Representation");

    doc.setFillColor(250, 250, 252);
    doc.rect(17, y - 3.5, W - 34, 6, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("LEVEL", 20, y);
    doc.text("YEAR", 90, y);
    doc.text("STATUS", 140, y);
    y += 6;

    p.nationalTeams.forEach((n, i) => {
      checkPage(10);
      if (i % 2 === 0) {
        doc.setFillColor(252, 253, 254);
        doc.rect(17, y - 3.5, W - 34, 6, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(n.level, 20, y);
      doc.text(String(n.year), 90, y);
      if (n.isCurrent) {
        doc.setTextColor(...GREEN);
        doc.setFont("helvetica", "bold");
        doc.text("CURRENT", 140, y);
      } else {
        doc.setTextColor(...GRAY);
        doc.text("Past", 140, y);
      }
      y += 6;
    });
    y += 4;
  }

  // ─── MATCH HISTORY ───
  if (p.matchHistory?.length > 0) {
    checkPage(20 + Math.min(p.matchHistory.length, 10) * 6);
    section("Recent Match History");

    doc.setFillColor(250, 250, 252);
    doc.rect(17, y - 3.5, W - 34, 6, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("DATE", 20, y);
    doc.text("OPPONENT", 48, y);
    doc.text("TOURNAMENT", 100, y);
    doc.text("RESULT", 150, y);
    doc.text("PERFORMANCE", 170, y);
    y += 6;

    p.matchHistory.slice(0, 15).forEach((m, i) => {
      checkPage(10);
      if (i % 2 === 0) {
        doc.setFillColor(252, 253, 254);
        doc.rect(17, y - 3.5, W - 34, 6, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(m.date || "—", 20, y);
      doc.text((m.opponent || "—").substring(0, 24), 48, y);
      doc.text((m.tournament || "—").substring(0, 22), 100, y);
      doc.setFont("helvetica", "bold");
      doc.text(m.result || "—", 150, y);
      doc.setFont("helvetica", "normal");
      doc.text((m.performance || "—").substring(0, 20), 170, y);
      y += 6;
    });
    y += 4;
  }

  // ─── TOURNAMENTS ───
  if (p.tournaments?.length > 0) {
    checkPage(18);
    section("Tournaments Played");
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const tLines = doc.splitTextToSize(p.tournaments.join("  •  "), W - 34);
    doc.text(tLines, 17, y);
    y += tLines.length * 4.2 + 5;
  }

  // ─── VIDEOS ───
  if (p.videos?.length > 0) {
    checkPage(18 + p.videos.length * 5);
    section("Video Highlights");
    p.videos.forEach(v => {
      checkPage(8);
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`• ${v.title || "Video"}`, 17, y);
      y += 4;
      doc.setTextColor(...GREEN);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(v.url.substring(0, 100), 20, y);
      y += 5;
    });
    y += 3;
  }

  // ─── AVAILABILITY ───
  checkPage(20);
  section("Availability");
  if (p.unavailableDates?.length === 0) {
    doc.setTextColor(...GREEN);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("Available on all dates", 17, y);
    y += 6;
  } else {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Unavailable on ${p.unavailableDates.length} date(s):`, 17, y);
    y += 5;
    doc.setTextColor(200, 50, 50);
    const dLines = doc.splitTextToSize(p.unavailableDates.join(",  "), W - 34);
    doc.text(dLines, 17, y);
    y += dLines.length * 4 + 4;
  }

  // ─── REVIEWS ───
  if (p.reviews?.length > 0) {
    checkPage(20 + Math.min(p.reviews.length, 5) * 14);
    section(`Reviews (${p.reviews.length})`);
    p.reviews.slice(0, 6).forEach(r => {
      checkPage(16);
      doc.setDrawColor(...LIGHT);
      doc.setFillColor(252, 253, 254);
      const rLines = doc.splitTextToSize(r.text || "", W - 44);
      const boxH = 8 + rLines.length * 3.8;
      doc.roundedRect(17, y - 3.5, W - 34, boxH, 1.5, 1.5, "FD");

      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(r.author?.name || "Anonymous", 21, y);
      doc.setTextColor(...GREEN);
      doc.text(`${"*".repeat(Math.round(Number(r.rating)))}  ${Number(r.rating).toFixed(1)}/5`, W - 21, y, { align: "right" });

      doc.setTextColor(...GRAY);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(rLines, 21, y + 4.5);
      y += boxH + 2;
    });
  }

  // ─── FOOTER on every page ───
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT);
    doc.line(14, 285, W - 14, 285);
    doc.setTextColor(...GRAY);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("Amar Team — Bangladesh Football Talent Platform  |  amarteam.com.bd", 14, 290);
    doc.text(`Generated ${new Date().toLocaleDateString()}  |  Page ${i} of ${pageCount}`, W - 14, 290, { align: "right" });
  }

  const safeName = (p.user?.name || "profile").replace(/[^a-z0-9]/gi, "_");
  doc.save(`AmarTeam_${typeLabel}_${safeName}.pdf`);
}

// ─── Bulk export for admin ───
export function generateBulkPDF(players: Player[], title = "All Profiles") {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = 297;
  let y = 0;

  // Header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AMAR TEAM", 14, 10);
  doc.setFontSize(15);
  doc.text(title, 14, 19);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${players.length} records  |  ${new Date().toLocaleDateString()}`, W - 14, 19, { align: "right" });

  y = 34;

  // Table header
  const cols = [
    { l: "NAME", x: 14, w: 42 },
    { l: "TYPE", x: 56, w: 18 },
    { l: "POSITION", x: 74, w: 24 },
    { l: "TIER", x: 98, w: 12 },
    { l: "CURRENT CLUB", x: 110, w: 40 },
    { l: "AGE", x: 150, w: 12 },
    { l: "EXP", x: 162, w: 12 },
    { l: "LOCATION", x: 174, w: 26 },
    { l: "PHONE", x: 200, w: 26 },
    { l: "RATING", x: 226, w: 16 },
    { l: "AVAIL", x: 242, w: 16 },
    { l: "STATUS", x: 258, w: 25 },
  ];

  const drawHeader = () => {
    doc.setFillColor(...LIGHT);
    doc.rect(14, y - 4, W - 28, 7, "F");
    doc.setTextColor(...GREEN);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    cols.forEach(c => doc.text(c.l, c.x + 1, y));
    y += 7;
  };

  drawHeader();

  players.forEach((p, i) => {
    if (y > 190) { doc.addPage(); y = 20; drawHeader(); }

    if (i % 2 === 0) {
      doc.setFillColor(252, 253, 254);
      doc.rect(14, y - 4, W - 28, 6.5, "F");
    }

    const cc = p.clubs?.find(c => c.isCurrent)?.name || "—";
    doc.setTextColor(...DARK);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    doc.text((p.user?.name || "—").substring(0, 24), 15, y);
    doc.text(p.playerType || "—", 57, y);
    doc.text((p.position || "—").substring(0, 12), 75, y);
    doc.setFont("helvetica", "bold");
    doc.text(p.tier || "—", 99, y);
    doc.setFont("helvetica", "normal");
    doc.text(cc.substring(0, 22), 111, y);
    doc.text(String(p.age || "—"), 151, y);
    doc.text(String(p.experience || 0), 163, y);
    doc.text((p.location || "—").substring(0, 14), 175, y);
    doc.text(p.user?.phone || "—", 201, y);
    doc.text(p.reviews?.length > 0 ? Number(p.rating).toFixed(1) : "—", 227, y);

    doc.setTextColor(p.isAvailable ? 22 : 200, p.isAvailable ? 163 : 50, p.isAvailable ? 74 : 50);
    doc.setFont("helvetica", "bold");
    doc.text(p.isAvailable ? "Yes" : "No", 243, y);

    doc.setTextColor(p.isApproved ? 22 : 200, p.isApproved ? 163 : 140, p.isApproved ? 74 : 20);
    doc.text(p.isApproved ? "Approved" : "Pending", 259, y);

    y += 6.5;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT);
    doc.line(14, 198, W - 14, 198);
    doc.setTextColor(...GRAY);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("Amar Team — Bangladesh Football Talent Platform", 14, 203);
    doc.text(`Page ${i} of ${pageCount}`, W - 14, 203, { align: "right" });
  }

  doc.save(`AmarTeam_${title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateTeamRequestPDF(tr: TeamRequest) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  let y = 0;

  const status = TEAM_STATUS_INFO[tr.status] || { label: tr.status };

  // Header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AMAR TEAM", 14, 10);
  doc.setFontSize(16);
  doc.text("TEAM REQUEST", 14, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Request ID: ${tr.id.slice(0, 8).toUpperCase()}`, 14, 27);
  doc.text(`Created: ${new Date(tr.createdAt).toLocaleDateString()}`, 14, 32);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(W - 62, 14, 48, 9, 2, 2, "F");
  doc.setTextColor(...GREEN);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(status.label.toUpperCase(), W - 38, 20.5, { align: "center" });

  y = 48;

  const section = (title: string) => {
    doc.setFillColor(...LIGHT);
    doc.rect(14, y - 4, W - 28, 7, "F");
    doc.setTextColor(...GREEN);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 17, y);
    y += 8;
  };

  const field = (label: string, value: string) => {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, 17, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value || "-", 70, y);
    y += 5.5;
  };

  const checkPage = (need = 20) => {
    if (y > 275 - need) { doc.addPage(); y = 20; }
  };

  section("Hirer Information");
  field("Name / Club", tr.hirer?.name || "-");
  field("Email", tr.hirer?.email || "-");
  field("Phone", tr.hirer?.phone || "-");
  field("Location", tr.hirer?.location || "-");
  y += 3;

  section("Match Details");
  field("Match Date", tr.matchDate || "Not specified");
  field("Tournament", tr.tournament || "Not specified");
  field("Venue / Location", tr.location || "Not specified");
  field("Players Needed", String(tr.playersNeeded));
  field("Hirer Budget", tr.budget ? `BDT ${tr.budget.toLocaleString()}` : "Not specified");
  y += 3;

  section("Status & Payment");
  field("Current Status", status.label);
  if (tr.finalAmount) field("Final Agreed Amount", `BDT ${tr.finalAmount.toLocaleString()}`);
  if (tr.advanceAmount) field("Advance Amount", `BDT ${tr.advanceAmount.toLocaleString()}`);
  if (tr.finalAmount && tr.advanceAmount) {
    field("Balance Due", `BDT ${(tr.finalAmount - tr.advanceAmount).toLocaleString()}`);
  }
  y += 3;

  if (tr.squad?.length > 0) {
    checkPage(20 + tr.squad.length * 6);
    section(`Requested Squad (${tr.squad.length} players)`);

    doc.setFillColor(250, 250, 252);
    doc.rect(17, y - 3.5, W - 34, 6, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("#", 20, y);
    doc.text("FIELD POSITION", 30, y);
    doc.text("PLAYER NAME", 75, y);
    doc.text("NATURAL POSITION", 145, y);
    y += 6;

    tr.squad.forEach((s, i) => {
      checkPage(10);
      if (i % 2 === 0) {
        doc.setFillColor(252, 253, 254);
        doc.rect(17, y - 3.5, W - 34, 6, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(String(i + 1), 20, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(s.positionKey, 30, y);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.text((s.playerName || "-").substring(0, 40), 75, y);
      doc.setTextColor(...GRAY);
      doc.text(s.playerPosition || "-", 145, y);
      y += 6;
    });
    y += 4;
  }

  if (tr.message) {
    checkPage(25);
    section("Hirer Notes");
    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(tr.message, W - 34);
    doc.text(lines, 17, y);
    y += lines.length * 4.2 + 5;
  }

  if (tr.adminNote) {
    checkPage(25);
    section("Internal Admin Notes");
    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(tr.adminNote, W - 34);
    doc.text(lines, 17, y);
    y += lines.length * 4.2 + 5;
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT);
    doc.line(14, 285, W - 14, 285);
    doc.setTextColor(...GRAY);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("Amar Team - Bangladesh Football Talent Platform", 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, W - 14, 290, { align: "right" });
  }

  doc.save(`AmarTeam_Request_${tr.id.slice(0, 8).toUpperCase()}.pdf`);
}