"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useSettings } from "@/lib/settings-context";
import { useLang } from "@/lib/language-context";

const content = {
  en: {
    title: "About",
    subtitle: "Bangladesh's Football Talent Platform",
    mission: "Our Mission",
    missionText: "আমার টিম (Amar Team) is built to solve a real problem in Bangladesh's football ecosystem — connecting hirers who need talent with the players, coaches, referees, and cameramen who are ready to work. Before us, hiring football talent meant endless phone calls, WhatsApp groups, and word of mouth. We're changing that with one platform that puts everything in one place.",
    whatWeDo: "What We Do",
    whatWeDoText: "We're a full-service football platform. Whether you're organizing a weekend friendly, a district tournament, or a professional league — we've got you covered:",
    features: [
      { icon: "⚽", title: "Player Hiring", desc: "Browse and hire players by position, tier, district, and experience. From strikers to goalkeepers — find exactly who you need." },
      { icon: "🎓", title: "Coach Booking", desc: "Connect with experienced coaches for your team, academy, or tournament. Filter by specialization and availability." },
      { icon: "🏁", title: "Referee Booking", desc: "Licensed referees available across all districts. Book for any match type — friendly, group round, or final." },
      { icon: "📷", title: "Match Cameramen", desc: "Professional cameramen with drone footage and editing. Get your matches recorded and highlights produced." },
      { icon: "🌍", title: "Foreign Players", desc: "Access international talent. Foreign players registered on our platform, ready to play in Bangladesh." },
      { icon: "🚗", title: "Vehicle Rental", desc: "Team transport sorted. Buses, microbuses, and pickups available in every district for match day or tournament travel." },
      { icon: "🛍️", title: "Sports Shop", desc: "Jerseys, boots, balls, and training equipment — everything your team needs, delivered to your door." },
    ],
    howItWorks: "How It Works",
    steps: [
      { n: "1", title: "Browse & Select", desc: "Search talent by position, rating, district, or tier. View profiles, experience, and match history." },
      { n: "2", title: "Build Your Squad", desc: "Use our interactive pitch to assemble your full team. Add players to positions and submit your request." },
      { n: "3", title: "We Confirm & Price", desc: "Our team contacts you by phone to confirm details, negotiate pricing, and finalize the booking." },
      { n: "4", title: "Match Day", desc: "Your hired talent shows up ready. After the match, rate and review to help the community." },
    ],
    forTalent: "For Talent",
    forTalentText: "If you're a player, coach, referee, or cameraman — আমার টিম is your platform to get discovered. Create your profile for free, set your availability, and let hirers find you. You'll receive booking requests, get matched to tournaments, and earn from your talent. We handle the admin — you focus on the game.",
    whereWeOperate: "Where We Operate",
    whereText: "We operate across all 64 districts of Bangladesh. Whether it's Dhaka, Chittagong, Sylhet, Rajshahi, or any upazila — our talent network covers the entire country. Our goal is to make professional football services accessible everywhere, not just in the capital.",
    contact: "Contact Us",
    contactText: "Have questions, feedback, or partnership inquiries? We'd love to hear from you.",
  },
  bn: {
    title: "আমাদের সম্পর্কে",
    subtitle: "বাংলাদেশের ফুটবল প্রতিভা প্ল্যাটফর্ম",
    mission: "🎯 আমাদের লক্ষ্য",
    missionText: "আমার টিম বাংলাদেশের ফুটবল জগতের একটি বাস্তব সমস্যা সমাধানের জন্য তৈরি — যারা প্রতিভা খুঁজছেন তাদের সাথে খেলোয়াড়, কোচ, রেফারি এবং ক্যামেরাম্যানদের সংযুক্ত করা। আমাদের আগে, ফুটবল প্রতিভা ভাড়া করতে গেলে অসংখ্য ফোন কল, হোয়াটসঅ্যাপ গ্রুপ এবং মুখের কথার উপর নির্ভর করতে হতো। আমরা সবকিছু এক প্ল্যাটফর্মে এনে এটি বদলে দিচ্ছি।",
    whatWeDo: "⚽ আমরা কী করি",
    whatWeDoText: "আমরা একটি পূর্ণ সেবার ফুটবল প্ল্যাটফর্ম। আপনি সাপ্তাহিক ফ্রেন্ডলি ম্যাচ, জেলা টুর্নামেন্ট বা পেশাদার লিগ — যাই আয়োজন করুন, আমরা আপনাকে সাহায্য করতে প্রস্তুত:",
    features: [
      { icon: "⚽", title: "খেলোয়াড় ভাড়া", desc: "পজিশন, টায়ার, জেলা এবং অভিজ্ঞতা অনুযায়ী খেলোয়াড় খুঁজুন এবং ভাড়া করুন। স্ট্রাইকার থেকে গোলকিপার — ঠিক যাকে দরকার তাকে খুঁজে নিন।" },
      { icon: "🎓", title: "কোচ বুকিং", desc: "আপনার দল, একাডেমি বা টুর্নামেন্টের জন্য অভিজ্ঞ কোচদের সাথে যুক্ত হোন।" },
      { icon: "🏁", title: "রেফারি বুকিং", desc: "সকল জেলায় লাইসেন্সধারী রেফারি পাওয়া যায়। ফ্রেন্ডলি, গ্রুপ রাউন্ড বা ফাইনাল — যেকোনো ম্যাচের জন্য বুক করুন।" },
      { icon: "📷", title: "ম্যাচ ক্যামেরাম্যান", desc: "ড্রোন ফুটেজ এবং এডিটিং সহ পেশাদার ক্যামেরাম্যান। আপনার ম্যাচ রেকর্ড করুন এবং হাইলাইট তৈরি করুন।" },
      { icon: "🌍", title: "বিদেশি খেলোয়াড়", desc: "আন্তর্জাতিক প্রতিভার সুযোগ। আমাদের প্ল্যাটফর্মে নিবন্ধিত বিদেশি খেলোয়াড়, বাংলাদেশে খেলতে প্রস্তুত।" },
      { icon: "🚗", title: "গাড়ি ভাড়া", desc: "দলের যাতায়াতের ব্যবস্থা। বাস, মাইক্রোবাস এবং পিকআপ — প্রতিটি জেলায় ম্যাচ ডে বা টুর্নামেন্ট ভ্রমণের জন্য।" },
      { icon: "🛍️", title: "স্পোর্টস শপ", desc: "জার্সি, বুট, বল এবং প্রশিক্ষণ সরঞ্জাম — আপনার দলের যা কিছু দরকার, আপনার দোরগোড়ায় ডেলিভারি।" },
    ],
    howItWorks: "🏟️ কিভাবে কাজ করে",
    steps: [
      { n: "১", title: "ব্রাউজ ও বাছাই করুন", desc: "পজিশন, রেটিং, জেলা বা টায়ার অনুযায়ী প্রতিভা খুঁজুন। প্রোফাইল, অভিজ্ঞতা এবং ম্যাচ ইতিহাস দেখুন।" },
      { n: "২", title: "আপনার স্কোয়াড তৈরি করুন", desc: "আমাদের ইন্টারেক্টিভ পিচে আপনার পুরো দল সাজান। পজিশনে খেলোয়াড় যোগ করুন এবং রিকোয়েস্ট জমা দিন।" },
      { n: "৩", title: "আমরা নিশ্চিত করি ও মূল্য জানাই", desc: "আমাদের টিম ফোনে আপনার সাথে যোগাযোগ করে বিস্তারিত নিশ্চিত করবে, মূল্য আলোচনা করবে এবং বুকিং ফাইনাল করবে।" },
      { n: "৪", title: "ম্যাচ ডে", desc: "আপনার ভাড়া করা প্রতিভা প্রস্তুত হয়ে আসবে। ম্যাচের পর রেটিং ও রিভিউ দিন।" },
    ],
    forTalent: "🤝 প্রতিভাদের জন্য",
    forTalentText: "আপনি যদি খেলোয়াড়, কোচ, রেফারি বা ক্যামেরাম্যান হন — আমার টিম আপনার আবিষ্কৃত হওয়ার প্ল্যাটফর্ম। বিনামূল্যে আপনার প্রোফাইল তৈরি করুন, আপনার সময়সূচী সেট করুন এবং হায়ারারদের আপনাকে খুঁজে পেতে দিন। আপনি বুকিং রিকোয়েস্ট পাবেন, টুর্নামেন্টে ম্যাচ হবে এবং আপনার প্রতিভা থেকে আয় করবেন।",
    whereWeOperate: "📍 আমরা কোথায় কাজ করি",
    whereText: "আমরা বাংলাদেশের সকল ৬৪ জেলায় কাজ করি। ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী বা যেকোনো উপজেলা — আমাদের প্রতিভা নেটওয়ার্ক সারা দেশে ছড়িয়ে আছে। আমাদের লক্ষ্য হলো পেশাদার ফুটবল সেবা সবার কাছে পৌঁছে দেওয়া, শুধু রাজধানীতে সীমাবদ্ধ না রাখা।",
    contact: "💬 যোগাযোগ করুন",
    contactText: "প্রশ্ন, মতামত বা অংশীদারিত্বের জন্য আমাদের সাথে যোগাযোগ করুন।",
  },
};

export default function AboutPage() {
  const { get } = useSettings();
  const { lang } = useLang();
  const logo = get("logo");
  const siteName = get("siteName") || "আমার টিম";
  const t = lang === "bn" ? content.bn : content.en;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          {logo ? (
            <img src={logo} alt={siteName} className="h-16 sm:h-20 mx-auto object-contain mb-4" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">{t.title} {siteName}</h1>
          <p className="text-white/40 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white/70 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{lang === "en" ? "🎯" : ""} {t.mission}</h2>
            <p>{t.missionText}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{lang === "en" ? "⚽" : ""} {t.whatWeDo}</h2>
            <p className="mb-4">{t.whatWeDoText}</p>
            <div className="space-y-3">
              {t.features.map((f, i) => (
                <div key={i} className="flex gap-3 bg-dark-card rounded-xl border border-dark-border p-4">
                  <span className="text-xl shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-white text-sm mb-0.5">{f.title}</p>
                    <p className="text-white/50 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{lang === "en" ? "🏟️" : ""} {t.howItWorks}</h2>
            <div className="space-y-3">
              {t.steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0 mt-0.5">{s.n}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{s.title}</p>
                    <p className="text-white/50 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t.forTalent}</h2>
            <p>{t.forTalentText}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t.whereWeOperate}</h2>
            <p>{t.whereText}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t.contact}</h2>
            <p className="mb-3">{t.contactText}</p>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-base">📧</span>
                <a href="mailto:contact@amarteam.app" className="text-primary-400 hover:text-primary-300 transition">contact@amarteam.app</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base">📱</span>
                <a href="https://facebook.com/amarteam.app" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 transition">facebook.com/amarteam.app</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base">🌐</span>
                <span className="text-white/50">amarteam.app</span>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}