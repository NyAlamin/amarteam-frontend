"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useSettings } from "@/lib/settings-context";
import { useLang } from "@/lib/language-context";

const content = {
  en: {
    title: "Privacy Policy & Terms",
    updated: "Last updated: September 2026",
    privacy: "Privacy Policy",
    privacyIntro: "আমার টিম (\"we\", \"our\", \"us\") respects your privacy. This policy explains what data we collect, how we use it, and your rights regarding your information.",
    infoCollect: "Information We Collect",
    infoCollectSub: "When you register and use our platform, we may collect:",
    infoItems: [
      { label: "Account information:", value: "name, email, phone number, password (encrypted), location" },
      { label: "Profile information (talent):", value: "photo, position, experience, clubs, availability, match history" },
      { label: "Booking information:", value: "match dates, tournament names, venues, payment details" },
      { label: "Order information:", value: "delivery address, phone number, product selections" },
      { label: "Usage data:", value: "pages visited, features used, device type" },
    ],
    howWeUse: "How We Use Your Data",
    useItems: [
      "To provide and improve our services — matching talent with hirers",
      "To process bookings, orders, and payments",
      "To send booking confirmations, status updates, and important notifications via email and SMS",
      "To verify identity and prevent fraud",
      "To respond to your inquiries and provide customer support",
    ],
    dataSharing: "Data Sharing",
    dataSharingIntro: "We do not sell your personal data to third parties. We may share limited information with:",
    shareItems: [
      { label: "Hirers:", value: "Your public profile (name, photo, position, rating) when they browse talent" },
      { label: "Talent:", value: "Hirer's name and contact when a booking is confirmed" },
      { label: "Payment providers:", value: "Transaction details for payment processing" },
      { label: "Cloud services:", value: "We use Cloudinary for image storage, which may process your uploaded photos" },
    ],
    dataSecurity: "Data Security",
    dataSecurityText: "We use industry-standard security measures including encrypted passwords (bcrypt), HTTPS/SSL encryption, JWT-based authentication, and role-based access controls. However, no system is 100% secure, and we cannot guarantee absolute security.",
    yourRights: "Your Rights",
    rightsItems: [
      "Access your personal data through your profile and settings",
      "Update or correct your information at any time",
      "Request deletion of your account by contacting us",
      "Opt out of promotional communications",
    ],
    tos: "Terms of Service",
    acceptance: "Acceptance",
    acceptanceText: "By registering for or using আমার টিম, you agree to these Terms of Service. If you do not agree, please do not use our platform.",
    userAccounts: "User Accounts",
    accountItems: [
      "You must provide accurate, current information during registration",
      "You are responsible for maintaining the security of your account",
      "One account per person — duplicate accounts may be removed",
      "You must be at least 16 years old to register",
    ],
    talentProfiles: "Talent Profiles",
    talentProfilesIntro: "Players, coaches, referees, and cameramen who register as talent agree that:",
    talentItems: [
      "Profile information (name, photo, position, rating) will be publicly visible on the platform",
      "You will keep your availability calendar up to date",
      "You will honor confirmed bookings — repeated cancellations may result in account suspension",
      "You agree to the platform's commission rates as set by the admin",
    ],
    bookingsPayments: "Bookings & Payments",
    bookingItems: [
      "Pricing is confirmed by our team via phone after a booking request is submitted",
      "An advance payment may be required to confirm a booking",
      "Cancellation policies vary by booking type — our team will inform you during confirmation",
      "আমার টিম acts as a facilitator between hirers and talent — we are not the employer of any talent listed",
      "Commission rates are applied transparently and visible in talent earnings",
    ],
    shopOrders: "Shop Orders",
    shopItems: [
      "Product prices are listed in BDT (৳) and include applicable charges",
      "Delivery charges depend on location (Dhaka vs outside Dhaka)",
      "Cash on delivery is the current payment method; online payment is coming soon",
      "Returns and refunds will be handled on a case-by-case basis — contact us within 3 days of delivery",
    ],
    vehicleRental: "Vehicle Rental",
    vehicleItems: [
      "Vehicle availability is subject to confirmation",
      "Estimated pricing may change based on route, duration, and additional requirements",
      "The hirer is responsible for any damages caused during the rental period beyond normal wear",
    ],
    prohibitedConduct: "Prohibited Conduct",
    prohibitedIntro: "Users must not:",
    prohibitedItems: [
      "Provide false information in profiles or bookings",
      "Harass, threaten, or discriminate against other users",
      "Attempt to bypass the platform to avoid commissions",
      "Scrape, copy, or redistribute content from the platform",
      "Use the platform for any illegal purpose",
    ],
    contentOwnership: "Content Ownership",
    contentText: "You retain ownership of content you upload (photos, videos). By uploading, you grant আমার টিম a non-exclusive license to display it on the platform. We may remove content that violates these terms.",
    liability: "Limitation of Liability",
    liabilityText: "আমার টিম is a platform connecting hirers with talent. We do not guarantee the quality, reliability, or performance of any talent or service booked through the platform. We are not liable for disputes between hirers and talent, injuries during matches, or losses arising from bookings.",
    changes: "Changes to Terms",
    changesText: "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. Significant changes will be communicated via email or on-site notification.",
    refund: "Refund Policy",
    refundSections: [
      { title: "Talent Bookings", desc: "If a booking is cancelled before the match date, advance payments may be refundable depending on the timing. Contact us for case-by-case resolution." },
      { title: "Vehicle Rentals", desc: "Cancellations made at least 24 hours before the start date are eligible for a full refund. Late cancellations may incur a fee." },
      { title: "Shop Orders", desc: "Defective or wrong items can be returned within 3 days of delivery. Contact us with photos and your order number. Shipping costs for returns are covered by us for defective products." },
    ],
    questionsTitle: "Questions about our policies?",
    questionsSub: "Reach out to us and we'll respond within 24 hours.",
  },
  bn: {
    title: "গোপনীয়তা নীতি ও শর্তাবলী",
    updated: "সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬",
    privacy: "🔒 গোপনীয়তা নীতি",
    privacyIntro: "আমার টিম (\"আমরা\") আপনার গোপনীয়তাকে সম্মান করে। এই নীতিতে ব্যাখ্যা করা হয়েছে আমরা কী তথ্য সংগ্রহ করি, কিভাবে ব্যবহার করি এবং আপনার তথ্য সম্পর্কে আপনার অধিকার কী।",
    infoCollect: "আমরা যে তথ্য সংগ্রহ করি",
    infoCollectSub: "আপনি যখন আমাদের প্ল্যাটফর্মে নিবন্ধন ও ব্যবহার করেন, আমরা সংগ্রহ করতে পারি:",
    infoItems: [
      { label: "অ্যাকাউন্ট তথ্য:", value: "নাম, ইমেইল, ফোন নম্বর, পাসওয়ার্ড (এনক্রিপ্টেড), অবস্থান" },
      { label: "প্রোফাইল তথ্য (প্রতিভা):", value: "ছবি, পজিশন, অভিজ্ঞতা, ক্লাব, সময়সূচী, ম্যাচ ইতিহাস" },
      { label: "বুকিং তথ্য:", value: "ম্যাচের তারিখ, টুর্নামেন্টের নাম, ভেন্যু, পেমেন্ট বিবরণ" },
      { label: "অর্ডার তথ্য:", value: "ডেলিভারি ঠিকানা, ফোন নম্বর, পণ্য নির্বাচন" },
      { label: "ব্যবহার ডেটা:", value: "পরিদর্শিত পৃষ্ঠা, ব্যবহৃত ফিচার, ডিভাইসের ধরন" },
    ],
    howWeUse: "আমরা কিভাবে আপনার ডেটা ব্যবহার করি",
    useItems: [
      "আমাদের সেবা প্রদান ও উন্নত করতে — প্রতিভাদের সাথে হায়ারারদের মিলিয়ে দিতে",
      "বুকিং, অর্ডার এবং পেমেন্ট প্রক্রিয়া করতে",
      "বুকিং নিশ্চিতকরণ, স্ট্যাটাস আপডেট এবং গুরুত্বপূর্ণ বিজ্ঞপ্তি ইমেইল ও এসএমএসের মাধ্যমে পাঠাতে",
      "পরিচয় যাচাই এবং জালিয়াতি প্রতিরোধ করতে",
      "আপনার প্রশ্নের উত্তর দিতে এবং গ্রাহক সহায়তা প্রদান করতে",
    ],
    dataSharing: "ডেটা শেয়ারিং",
    dataSharingIntro: "আমরা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত ডেটা বিক্রি করি না। আমরা সীমিত তথ্য শেয়ার করতে পারি:",
    shareItems: [
      { label: "হায়ারার:", value: "আপনার পাবলিক প্রোফাইল (নাম, ছবি, পজিশন, রেটিং) যখন তারা প্রতিভা ব্রাউজ করে" },
      { label: "প্রতিভা:", value: "বুকিং নিশ্চিত হলে হায়ারারের নাম ও যোগাযোগ" },
      { label: "পেমেন্ট প্রদানকারী:", value: "পেমেন্ট প্রক্রিয়াকরণের জন্য লেনদেনের বিবরণ" },
      { label: "ক্লাউড সেবা:", value: "আমরা ছবি সংরক্ষণের জন্য Cloudinary ব্যবহার করি" },
    ],
    dataSecurity: "ডেটা নিরাপত্তা",
    dataSecurityText: "আমরা শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি যার মধ্যে রয়েছে এনক্রিপ্টেড পাসওয়ার্ড (bcrypt), HTTPS/SSL এনক্রিপশন, JWT-ভিত্তিক প্রমাণীকরণ এবং ভূমিকা-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ। তবে কোনো সিস্টেমই ১০০% নিরাপদ নয়।",
    yourRights: "আপনার অধিকার",
    rightsItems: [
      "আপনার প্রোফাইল ও সেটিংসের মাধ্যমে আপনার ব্যক্তিগত ডেটা দেখুন",
      "যেকোনো সময় আপনার তথ্য আপডেট বা সংশোধন করুন",
      "আমাদের সাথে যোগাযোগ করে আপনার অ্যাকাউন্ট মুছে ফেলার অনুরোধ করুন",
      "প্রচারমূলক যোগাযোগ থেকে বিরত থাকুন",
    ],
    tos: "📋 সেবার শর্তাবলী",
    acceptance: "১. গ্রহণযোগ্যতা",
    acceptanceText: "আমার টিমে নিবন্ধন বা ব্যবহার করলে আপনি এই সেবার শর্তাবলীতে সম্মত হচ্ছেন। সম্মত না হলে অনুগ্রহ করে আমাদের প্ল্যাটফর্ম ব্যবহার করবেন না।",
    userAccounts: "২. ব্যবহারকারী অ্যাকাউন্ট",
    accountItems: [
      "নিবন্ধনের সময় সঠিক, বর্তমান তথ্য প্রদান করতে হবে",
      "আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখার দায়িত্ব আপনার",
      "প্রতি ব্যক্তিতে একটি অ্যাকাউন্ট — ডুপ্লিকেট অ্যাকাউন্ট সরানো হতে পারে",
      "নিবন্ধনের জন্য আপনার বয়স কমপক্ষে ১৬ বছর হতে হবে",
    ],
    talentProfiles: "৩. প্রতিভা প্রোফাইল",
    talentProfilesIntro: "খেলোয়াড়, কোচ, রেফারি এবং ক্যামেরাম্যান যারা প্রতিভা হিসেবে নিবন্ধন করেন তারা সম্মত হন যে:",
    talentItems: [
      "প্রোফাইল তথ্য (নাম, ছবি, পজিশন, রেটিং) প্ল্যাটফর্মে সর্বজনীনভাবে দৃশ্যমান হবে",
      "আপনি আপনার সময়সূচী ক্যালেন্ডার আপ টু ডেট রাখবেন",
      "নিশ্চিত বুকিং সম্মান করবেন — বারবার বাতিল করলে অ্যাকাউন্ট স্থগিত হতে পারে",
      "আপনি প্ল্যাটফর্মের কমিশন হারে সম্মত",
    ],
    bookingsPayments: "৪. বুকিং ও পেমেন্ট",
    bookingItems: [
      "বুকিং রিকোয়েস্ট জমা দেওয়ার পর আমাদের টিম ফোনে মূল্য নিশ্চিত করবে",
      "বুকিং নিশ্চিত করতে অগ্রিম পেমেন্ট প্রয়োজন হতে পারে",
      "বাতিলকরণ নীতি বুকিংয়ের ধরন অনুযায়ী পরিবর্তিত হয়",
      "আমার টিম হায়ারার ও প্রতিভার মধ্যে সুবিধাদাতা — আমরা কোনো প্রতিভার নিয়োগকর্তা নই",
      "কমিশন হার স্বচ্ছভাবে প্রয়োগ করা হয় এবং প্রতিভার আয়ে দৃশ্যমান",
    ],
    shopOrders: "৫. শপ অর্ডার",
    shopItems: [
      "পণ্যের মূল্য BDT (৳) তে তালিকাভুক্ত",
      "ডেলিভারি চার্জ অবস্থানের উপর নির্ভর করে (ঢাকা vs ঢাকার বাইরে)",
      "ক্যাশ অন ডেলিভারি বর্তমান পেমেন্ট পদ্ধতি; অনলাইন পেমেন্ট শীঘ্রই আসছে",
      "রিটার্ন ও রিফান্ড কেস বাই কেস ভিত্তিতে — ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করুন",
    ],
    vehicleRental: "৬. গাড়ি ভাড়া",
    vehicleItems: [
      "গাড়ির প্রাপ্যতা নিশ্চিতকরণ সাপেক্ষে",
      "আনুমানিক মূল্য রুট, সময়কাল এবং অতিরিক্ত প্রয়োজনীয়তার উপর ভিত্তি করে পরিবর্তিত হতে পারে",
      "ভাড়ার সময়কালে স্বাভাবিক ব্যবহারের বাইরে কোনো ক্ষতির জন্য হায়ারার দায়ী",
    ],
    prohibitedConduct: "৭. নিষিদ্ধ আচরণ",
    prohibitedIntro: "ব্যবহারকারীদের অবশ্যই করা উচিত নয়:",
    prohibitedItems: [
      "প্রোফাইল বা বুকিংয়ে মিথ্যা তথ্য প্রদান",
      "অন্য ব্যবহারকারীদের হয়রানি, হুমকি বা বৈষম্য করা",
      "কমিশন এড়াতে প্ল্যাটফর্মকে বাইপাস করার চেষ্টা",
      "প্ল্যাটফর্ম থেকে কন্টেন্ট স্ক্র্যাপ, কপি বা পুনঃবিতরণ",
      "কোনো অবৈধ উদ্দেশ্যে প্ল্যাটফর্ম ব্যবহার",
    ],
    contentOwnership: "৮. কন্টেন্ট মালিকানা",
    contentText: "আপনি আপলোড করা কন্টেন্টের (ছবি, ভিডিও) মালিকানা ধরে রাখেন। আপলোড করার মাধ্যমে আপনি আমার টিমকে এটি প্ল্যাটফর্মে প্রদর্শনের জন্য একটি অ-এক্সক্লুসিভ লাইসেন্স দেন।",
    liability: "৯. দায়বদ্ধতার সীমাবদ্ধতা",
    liabilityText: "আমার টিম হায়ারার ও প্রতিভাদের সংযুক্তকারী একটি প্ল্যাটফর্ম। আমরা প্ল্যাটফর্মের মাধ্যমে বুক করা কোনো প্রতিভা বা সেবার গুণমান, নির্ভরযোগ্যতা বা কর্মক্ষমতার নিশ্চয়তা দিই না। হায়ারার ও প্রতিভার মধ্যে বিরোধ, ম্যাচের সময় আঘাত বা বুকিং থেকে উদ্ভূত ক্ষতির জন্য আমরা দায়ী নই।",
    changes: "১০. শর্তাবলীতে পরিবর্তন",
    changesText: "আমরা সময়ে সময়ে এই শর্তাবলী আপডেট করতে পারি। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহার চালিয়ে যাওয়া মানে গ্রহণযোগ্যতা। উল্লেখযোগ্য পরিবর্তন ইমেইল বা সাইটে বিজ্ঞপ্তির মাধ্যমে জানানো হবে।",
    refund: "💰 রিফান্ড নীতি",
    refundSections: [
      { title: "প্রতিভা বুকিং", desc: "ম্যাচের তারিখের আগে বুকিং বাতিল করা হলে, সময়ের উপর নির্ভর করে অগ্রিম পেমেন্ট ফেরতযোগ্য হতে পারে। কেস বাই কেস সমাধানের জন্য আমাদের সাথে যোগাযোগ করুন।" },
      { title: "গাড়ি ভাড়া", desc: "শুরুর তারিখের কমপক্ষে ২৪ ঘণ্টা আগে বাতিল করলে সম্পূর্ণ রিফান্ডের যোগ্য। দেরিতে বাতিল করলে ফি লাগতে পারে।" },
      { title: "শপ অর্ডার", desc: "ত্রুটিপূর্ণ বা ভুল পণ্য ডেলিভারির ৩ দিনের মধ্যে ফেরত দেওয়া যাবে। ছবি ও অর্ডার নম্বর সহ আমাদের সাথে যোগাযোগ করুন। ত্রুটিপূর্ণ পণ্যের জন্য রিটার্ন শিপিং খরচ আমরা বহন করি।" },
    ],
    questionsTitle: "আমাদের নীতি সম্পর্কে প্রশ্ন?",
    questionsSub: "আমাদের সাথে যোগাযোগ করুন, ২৪ ঘণ্টার মধ্যে উত্তর দেব।",
  },
};

export default function PolicyPage() {
  const { get } = useSettings();
  const { lang } = useLang();
  const siteName = get("siteName") || "আমার টিম";
  const t = lang === "bn" ? content.bn : content.en;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16">

        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">{t.title}</h1>
          <p className="text-white/40 text-sm">{t.updated}</p>
        </div>

        <div className="space-y-8 text-white/70 text-[15px] leading-relaxed">

          {/* Privacy Policy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{lang === "en" ? "🔒 " : ""}{t.privacy}</h2>
            <p className="mb-4">{t.privacyIntro}</p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.infoCollect}</h3>
            <p className="mb-2">{t.infoCollectSub}</p>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-1.5 text-sm mb-4">
              {t.infoItems.map((item, i) => (
                <p key={i}>• <span className="text-white/90">{item.label}</span> {item.value}</p>
              ))}
            </div>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.howWeUse}</h3>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-1.5 text-sm mb-4">
              {t.useItems.map((item, i) => (
                <p key={i}>• {item}</p>
              ))}
            </div>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.dataSharing}</h3>
            <p className="mb-2">{t.dataSharingIntro}</p>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-1.5 text-sm mb-4">
              {t.shareItems.map((item, i) => (
                <p key={i}>• <span className="text-white/90">{item.label}</span> {item.value}</p>
              ))}
            </div>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.dataSecurity}</h3>
            <p>{t.dataSecurityText}</p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.yourRights}</h3>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-1.5 text-sm mt-2">
              {t.rightsItems.map((item, i) => (
                <p key={i}>• {item}</p>
              ))}
            </div>
          </section>

          {/* Terms of Service */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{lang === "en" ? "📋 " : ""}{t.tos}</h2>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.acceptance}</h3>
            <p>{t.acceptanceText}</p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.userAccounts}</h3>
            <InfoBox items={t.accountItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.talentProfiles}</h3>
            <p className="mb-2">{t.talentProfilesIntro}</p>
            <InfoBox items={t.talentItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.bookingsPayments}</h3>
            <InfoBox items={t.bookingItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.shopOrders}</h3>
            <InfoBox items={t.shopItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.vehicleRental}</h3>
            <InfoBox items={t.vehicleItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.prohibitedConduct}</h3>
            <p className="mb-2">{t.prohibitedIntro}</p>
            <InfoBox items={t.prohibitedItems} />

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.contentOwnership}</h3>
            <p>{t.contentText}</p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.liability}</h3>
            <p>{t.liabilityText}</p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">{t.changes}</h3>
            <p>{t.changesText}</p>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t.refund}</h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-3 text-sm">
              {t.refundSections.map((s, i) => (
                <div key={i}>
                  <p className="text-white font-semibold mb-1">{s.title}</p>
                  <p className="text-white/50">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-white font-semibold mb-2">{t.questionsTitle}</p>
              <p className="text-white/40 text-sm mb-4">{t.questionsSub}</p>
              <a href="mailto:contact@amarteam.app"
                className="inline-block bg-primary-500 hover:bg-primary-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                📧 contact@amarteam.app
              </a>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}

function InfoBox({ items }: { items: string[] }) {
  return (
    <div className="bg-dark-card rounded-xl border border-dark-border p-4 space-y-1.5 text-sm mt-2 mb-4">
      {items.map((item, i) => (
        <p key={i}>• {item}</p>
      ))}
    </div>
  );
}