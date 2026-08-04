"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "bn";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

// ─── Dictionary ───
const dict: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.players": { en: "Players", bn: "খেলোয়াড়" },
  "nav.coaches": { en: "Coaches", bn: "কোচ" },
  "nav.referees": { en: "Referees", bn: "রেফারি" },
  "nav.buildTeam": { en: "Build Team", bn: "টিম তৈরি" },
  "nav.login": { en: "Login", bn: "লগইন" },
  "nav.register": { en: "Register", bn: "রেজিস্টার" },
  "nav.logout": { en: "Logout", bn: "লগআউট" },
  "nav.adminPanel": { en: "Admin Panel", bn: "অ্যাডমিন প্যানেল" },
  "nav.myProfile": { en: "My Profile", bn: "আমার প্রোফাইল" },
  "nav.registerAsPlayer": { en: "Register as Player", bn: "খেলোয়াড় হিসেবে রেজিস্টার" },

  // Hero
  "hero.title": { en: "Hire Top Football Talent", bn: "শীর্ষ ফুটবল প্রতিভা নিয়োগ করুন" },
  "hero.subtitle": { en: "Bangladesh's premier platform to discover and hire professional football players, coaches & referees.", bn: "বাংলাদেশের সেরা প্ল্যাটফর্ম — পেশাদার ফুটবল খেলোয়াড়, কোচ ও রেফারি খুঁজুন এবং নিয়োগ করুন।" },
  "hero.browsePlayers": { en: "Browse Players", bn: "খেলোয়াড় দেখুন" },
  "hero.browseCoaches": { en: "Browse Coaches", bn: "কোচ দেখুন" },
  "hero.browseReferees": { en: "Browse Referees", bn: "রেফারি দেখুন" },

  // Stats
  "stats.players": { en: "Players", bn: "খেলোয়াড়" },
  "stats.coaches": { en: "Coaches", bn: "কোচ" },
  "stats.referees": { en: "Referees", bn: "রেফারি" },
  "stats.available": { en: "Available", bn: "উপলব্ধ" },
  "stats.tierA": { en: "Tier A Stars", bn: "টিয়ার এ তারকা" },
  "stats.cities": { en: "Cities", bn: "শহর" },

  // Sections
  "section.topPlayers": { en: "Top Players", bn: "সেরা খেলোয়াড়" },
  "section.topCoaches": { en: "Top Coaches", bn: "সেরা কোচ" },
  "section.topReferees": { en: "Top Referees", bn: "সেরা রেফারি" },
  "section.viewAll": { en: "View All →", bn: "সব দেখুন →" },
  "section.noPlayers": { en: "No players yet", bn: "এখনো কোন খেলোয়াড় নেই" },
  "section.noCoaches": { en: "No coaches yet", bn: "এখনো কোন কোচ নেই" },
  "section.noReferees": { en: "No referees yet", bn: "এখনো কোন রেফারি নেই" },

  // Player Card
  "card.available": { en: "Available", bn: "উপলব্ধ" },
  "card.booked": { en: "Booked", bn: "বুকড" },
  "card.unavailable": { en: "Unavailable", bn: "অনুপলব্ধ" },
  "card.noRatings": { en: "No ratings", bn: "রেটিং নেই" },
  "card.nationalTeam": { en: "National Team", bn: "জাতীয় দল" },
  "card.current": { en: "Current", bn: "বর্তমান" },

  // Profile
  "profile.overview": { en: "Overview", bn: "সারসংক্ষেপ" },
  "profile.matches": { en: "Matches", bn: "ম্যাচ" },
  "profile.videos": { en: "Videos", bn: "ভিডিও" },
  "profile.calendar": { en: "Calendar", bn: "ক্যালেন্ডার" },
  "profile.reviews": { en: "Reviews", bn: "রিভিউ" },
  "profile.hirePlayer": { en: "Hire This Player", bn: "এই খেলোয়াড়কে নিয়োগ করুন" },
  "profile.hireCoach": { en: "Hire This Coach", bn: "এই কোচকে নিয়োগ করুন" },
  "profile.hireReferee": { en: "Hire This Referee", bn: "এই রেফারিকে নিয়োগ করুন" },
  "profile.clubHistory": { en: "Club History", bn: "ক্লাব ইতিহাস" },
  "profile.matchCharges": { en: "Match Charges", bn: "ম্যাচ চার্জ" },
  "profile.experience": { en: "Experience", bn: "অভিজ্ঞতা" },
  "profile.age": { en: "Age", bn: "বয়স" },
  "profile.goals": { en: "Goals", bn: "গোল" },
  "profile.assists": { en: "Assists", bn: "অ্যাসিস্ট" },
  "profile.cleanSheets": { en: "Clean Sheets", bn: "ক্লিন শিট" },
  "profile.tournaments": { en: "Tournaments", bn: "টুর্নামেন্ট" },
  "profile.availableDates": { en: "Available Dates", bn: "উপলব্ধ তারিখ" },
  "profile.unavailableDates": { en: "Unavailable Dates", bn: "অনুপলব্ধ তারিখ" },
  "profile.noVideos": { en: "No videos uploaded", bn: "কোন ভিডিও নেই" },
  "profile.noMatches": { en: "No match history", bn: "কোন ম্যাচ ইতিহাস নেই" },
  "profile.noReviews": { en: "No reviews yet", bn: "এখনো কোন রিভিউ নেই" },
  "profile.leaveReview": { en: "Leave a Review", bn: "রিভিউ দিন" },
  "profile.submitReview": { en: "Submit Review", bn: "রিভিউ জমা দিন" },
  "profile.present": { en: "Present", bn: "বর্তমান" },

  // Charges
  "charges.friendly": { en: "Friendly", bn: "ফ্রেন্ডলি" },
  "charges.groupRound": { en: "Group Round", bn: "গ্রুপ রাউন্ড" },
  "charges.final": { en: "Final", bn: "ফাইনাল" },

  // Auth
  "auth.welcomeBack": { en: "Welcome back", bn: "স্বাগতম" },
  "auth.signIn": { en: "Sign In", bn: "লগইন করুন" },
  "auth.signingIn": { en: "Signing in...", bn: "লগইন হচ্ছে..." },
  "auth.createAccount": { en: "Create Account", bn: "অ্যাকাউন্ট তৈরি করুন" },
  "auth.registerAsHirer": { en: "Register as Hirer", bn: "নিয়োগকর্তা হিসেবে রেজিস্টার" },
  "auth.noAccount": { en: "No account?", bn: "অ্যাকাউন্ট নেই?" },
  "auth.haveAccount": { en: "Have an account?", bn: "অ্যাকাউন্ট আছে?" },
  "auth.email": { en: "Email", bn: "ইমেইল" },
  "auth.password": { en: "Password", bn: "পাসওয়ার্ড" },
  "auth.name": { en: "Full Name", bn: "পুরো নাম" },
  "auth.phone": { en: "Phone", bn: "ফোন" },
  "auth.location": { en: "Location", bn: "অবস্থান" },

  // Registration
  "reg.title": { en: "Register as Player / Coach / Referee", bn: "খেলোয়াড় / কোচ / রেফারি হিসেবে রেজিস্টার করুন" },
  "reg.subtitle": { en: "Your profile will be reviewed by admin before going public.", bn: "আপনার প্রোফাইল প্রকাশের আগে অ্যাডমিন পর্যালোচনা করবে।" },
  "reg.type": { en: "Register as", bn: "হিসেবে রেজিস্টার" },
  "reg.player": { en: "Player", bn: "খেলোয়াড়" },
  "reg.coach": { en: "Coach", bn: "কোচ" },
  "reg.referee": { en: "Referee", bn: "রেফারি" },
  "reg.submit": { en: "Submit Registration", bn: "রেজিস্ট্রেশন জমা দিন" },
  "reg.submitting": { en: "Submitting...", bn: "জমা হচ্ছে..." },
  "reg.success": { en: "Registration submitted! Admin will review your profile.", bn: "রেজিস্ট্রেশন জমা হয়েছে! অ্যাডমিন আপনার প্রোফাইল পর্যালোচনা করবে।" },
  "reg.position": { en: "Position", bn: "পজিশন" },
  "reg.bio": { en: "Bio / About", bn: "সংক্ষিপ্ত বিবরণী" },

  // Hire
  "hire.title": { en: "Hire", bn: "নিয়োগ করুন" },
  "hire.matchDate": { en: "Match Date", bn: "ম্যাচের তারিখ" },
  "hire.tournament": { en: "Tournament", bn: "টুর্নামেন্ট" },
  "hire.matchType": { en: "Match Type", bn: "ম্যাচের ধরণ" },
  "hire.message": { en: "Message (Optional)", bn: "বার্তা (ঐচ্ছিক)" },
  "hire.submit": { en: "Submit Hire Request", bn: "নিয়োগ অনুরোধ জমা দিন" },
  "hire.youWillPay": { en: "You will pay", bn: "আপনি পরিশোধ করবেন" },

  // Team Builder
  "team.title": { en: "Build Your Team", bn: "আপনার টিম তৈরি করুন" },
  "team.subtitle": { en: "Tell us your budget. Admin will suggest best players.", bn: "আপনার বাজেট বলুন। অ্যাডমিন সেরা খেলোয়াড় সাজেস্ট করবে।" },
  "team.budget": { en: "Budget", bn: "বাজেট" },
  "team.playersNeeded": { en: "Players Needed", bn: "খেলোয়াড় প্রয়োজন" },
  "team.requirements": { en: "Requirements", bn: "প্রয়োজনীয়তা" },
  "team.submit": { en: "Submit", bn: "জমা দিন" },

  // Footer
  "footer.tagline": { en: "Bangladesh's #1 Football Talent Hiring Platform", bn: "বাংলাদেশের ১ নম্বর ফুটবল প্রতিভা নিয়োগ প্ল্যাটফর্ম" },
  "footer.rights": { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },

  // Admin
  "admin.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "admin.players": { en: "All Players", bn: "সকল খেলোয়াড়" },
  "admin.addPlayer": { en: "Add Player", bn: "খেলোয়াড় যোগ করুন" },
  "admin.pending": { en: "Pending", bn: "অপেক্ষমাণ" },
  "admin.tiers": { en: "Tiers", bn: "টিয়ার" },
  "admin.bookings": { en: "Bookings", bn: "বুকিং" },
  "admin.hirers": { en: "Hirers", bn: "নিয়োগকর্তা" },
  "admin.teamRequests": { en: "Team Requests", bn: "টিম অনুরোধ" },
  "admin.reviews": { en: "Reviews", bn: "রিভিউ" },
  "admin.settings": { en: "Settings", bn: "সেটিংস" },
  "admin.approve": { en: "Approve", bn: "অনুমোদন" },
  "admin.reject": { en: "Reject", bn: "বাতিল" },

  // Common
  "common.search": { en: "Search", bn: "অনুসন্ধান" },
  "common.filter": { en: "Filter", bn: "ফিল্টার" },
  "common.allTiers": { en: "All Tiers", bn: "সকল টিয়ার" },
  "common.allPositions": { en: "All Positions", bn: "সকল পজিশন" },
  "common.all": { en: "All", bn: "সব" },
  "common.topRated": { en: "Top Rated", bn: "সেরা রেটেড" },
  "common.save": { en: "Save", bn: "সংরক্ষণ" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.confirm": { en: "Confirm", bn: "নিশ্চিত" },
  "common.delete": { en: "Delete", bn: "মুছুন" },
  "common.edit": { en: "Edit", bn: "সম্পাদনা" },
  "common.loading": { en: "Loading...", bn: "লোড হচ্ছে..." },
  "common.backToSite": { en: "Back to Site", bn: "সাইটে ফিরুন" },
  "common.year": { en: "yr", bn: "বছর" },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("amarteam-lang") as Lang;
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("amarteam-lang", newLang);
  };

  const t = (key: string): string => {
    return dict[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);