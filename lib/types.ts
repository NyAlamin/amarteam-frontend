export enum Role {
  ADMIN = "admin", PLAYER = "player", HIRER = "hirer",
}
export enum Tier { A = "A", B = "B", C = "C" }
export enum Position {
  GK = "GK", LB = "LB", CB = "CB", RB = "RB",
  LWB = "LWB", RWB = "RWB", CDM = "CDM", CM = "CM", CAM = "CAM",
  LM = "LM", RM = "RM", LW = "LW", RW = "RW",
  LF = "LF", CF = "CF", RF = "RF", ST = "ST",
}

export enum PlayerType {
  PLAYER = "player",
  COACH = "coach",
  REFEREE = "referee",
  CAMERAMAN = "cameraman",
}
export enum BookingStatus {
  CALLING_SOON = "callingSoon",
  ADVANCE_PENDING = "advancePending",
  CONFIRMED = "confirmed",
  PLAYER_ON_THE_WAY = "playerOnTheWay",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
export enum TeamRequestStatus {
  CALLING_SOON = "callingSoon",
  ADVANCE_PENDING = "advancePending",
  CONFIRMED = "confirmed",
  PLAYER_ON_THE_WAY = "playerOnTheWay",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface SquadEntry {
  positionKey: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  /** Fee assigned by admin after the confirmation call. */
  amount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  authProvider: AuthProvider;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClubEntry {
  name: string; joinYear: number; leftYear: number | null; isCurrent: boolean;
}

export interface NationalTeamEntry {
  level: string; year: number; isCurrent: boolean;
}

export interface Charges {
  friendly: number; groupRound: number; final: number;
  friendlyDiscount: number | null; groupRoundDiscount: number | null; finalDiscount: number | null;
}

export interface VideoEntry {
  url: string; publicId: string; thumbnailUrl?: string;
  title?: string; duration?: number;
}

export interface MatchHistoryEntry {
  date: string; tournament: string; opponent: string;
  result: string; performance: string;

  // Coach fields
  coachingLicense?: string;
  specialization?: string;
  tacticsStyle?: string;
  // Referee fields
  refereeLicense?: string;
  fifaBadge?: boolean;
  matchesOfficiated?: number;
}

export interface PlayerStats {
  goals: number; assists: number; matches: number;
  cleanSheets: number; yellowCards: number; redCards: number;
}

export interface Player {
  id: string; user: User; userId: string;
  playerType: PlayerType;
  isApproved: boolean;
  photo?: string; photoPublicId?: string;
  position: Position; tier: Tier;
  clubs: ClubEntry[];
  nationalTeams: NationalTeamEntry[];
  charges: Charges;
  age: number; experience: number; rating: number;
  isAvailable: boolean; location?: string; bio?: string;
  stats: PlayerStats; availableDates: string[];
  unavailableDates: string[]; videos: VideoEntry[];
  tournaments: string[]; matchHistory: MatchHistoryEntry[];

  //for foreign players

  isForeign?: boolean;
  nationality?: string;
  currentCountry?: string;
  availableFrom?: string | null;
  availableTo?: string | null;
  // Coach fields
  coachingLicense?: string;
  specialization?: string;
  tacticsStyle?: string;
  // Referee fields
  refereeLicense?: string;
  fifaBadge?: boolean;
  matchesOfficiated?: number;
  // Location
  district?: string;
  upazila?: string;
  // Cameraman fields
  perMatchRate?: number;
  equipment?: string;
  portfolioPhotos?: PhotoEntry[];
  portfolioVideos?: VideoEntry[];
  hasDrone?: boolean;
  doesEditing?: boolean;
  reviews: Review[]; bookings: Booking[];
  createdAt: string; updatedAt: string;
}

export interface Booking {
  id: string; hirer: User; hirerId: string; player: Player;
  playerId: string; matchDate: string; tournament: string;
  matchType?: string;
  message?: string; amount: number; status: BookingStatus;
  adminNote?: string;
  finalAmount?: number;
  advanceAmount?: number;
  // Payment
  commissionRate?: number;
  commissionAmount?: number;
  amountPaid?: number;
  payoutPaid?: number;
  paymentStatus?: string;
  createdAt: string; updatedAt: string;
}

export interface Review {
  id: string; author: User; authorId: string; player: Player;
  playerId: string; rating: number; text: string; createdAt: string;
}

export interface TeamRequest {
  id: string;
  hirer: User;
  hirerId: string;
  matchDate?: string;
  tournament?: string;
  location?: string;
  budget: number;
  playersNeeded: number;
  message?: string;
  squad: SquadEntry[];
  status: TeamRequestStatus;
  adminNote?: string;
  finalAmount?: number;
  advanceAmount?: number;
  // Payment
  commissionRate?: number;
  commissionAmount?: number;
  amountPaid?: number;
  payoutPaid?: number;
  paymentStatus?: string;
  suggestedPlayerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const NATIONAL_LEVELS = ["Senior", "U-23", "U-20", "U-19", "U-18", "U-17", "U-16", "U-15"];

export const MATCH_TYPES = [
  { value: "friendly", label: "Friendly Match" },
  { value: "groupRound", label: "Group Round" },
  { value: "final", label: "Final Match" },
];

export const PLAYER_TYPES = [
  { value: "player", labelEn: "Player", labelBn: "খেলোয়াড়", icon: "⚽" },
  { value: "coach", labelEn: "Coach", labelBn: "কোচ", icon: "🎓" },
  { value: "referee", labelEn: "Referee", labelBn: "রেফারি", icon: "🏁" },
  { value: "cameraman", labelEn: "Cameraman", labelBn: "ক্যামেরাম্যান", icon: "📷" },
];
export const FOOTBALL_POSITIONS = [
  // Attack
  { key: "ST", label: "Striker", labelBn: "স্ট্রাইকার", x: 50, y: 8, group: "Attack" },
  { key: "LF", label: "Left Forward", labelBn: "লেফট ফরোয়ার্ড", x: 18, y: 20, group: "Attack" },
  { key: "CF", label: "Center Forward", labelBn: "সেন্টার ফরোয়ার্ড", x: 50, y: 20, group: "Attack" },
  { key: "RF", label: "Right Forward", labelBn: "রাইট ফরোয়ার্ড", x: 82, y: 20, group: "Attack" },
  // Wings
  { key: "LW", label: "Left Wing", labelBn: "লেফট উইং", x: 18, y: 32, group: "Attack" },
  { key: "CAM", label: "Attacking Mid", labelBn: "অ্যাটাকিং মিড", x: 50, y: 32, group: "Midfield" },
  { key: "RW", label: "Right Wing", labelBn: "রাইট উইং", x: 82, y: 32, group: "Attack" },
  // Midfield
  { key: "LM", label: "Left Mid", labelBn: "লেফট মিড", x: 18, y: 50, group: "Midfield" },
  { key: "CM", label: "Center Mid", labelBn: "সেন্টার মিড", x: 50, y: 50, group: "Midfield" },
  { key: "RM", label: "Right Mid", labelBn: "রাইট মিড", x: 82, y: 50, group: "Midfield" },
  { key: "CDM", label: "Defensive Mid", labelBn: "ডিফেন্সিভ মিড", x: 50, y: 63, group: "Midfield" },
  // Defense
  { key: "LWB", label: "Left Wing Back", labelBn: "লেফট উইং ব্যাক", x: 18, y: 71, group: "Defense" },
  { key: "RWB", label: "Right Wing Back", labelBn: "রাইট উইং ব্যাক", x: 82, y: 71, group: "Defense" },
  { key: "LB", label: "Left Back", labelBn: "লেফট ব্যাক", x: 24, y: 80, group: "Defense" },
  { key: "CB", label: "Center Back", labelBn: "সেন্টার ব্যাক", x: 50, y: 80, group: "Defense" },
  { key: "RB", label: "Right Back", labelBn: "রাইট ব্যাক", x: 76, y: 80, group: "Defense" },
  // GK
  { key: "GK", label: "Goalkeeper", labelBn: "গোলকিপার", x: 50, y: 92, group: "Goalkeeper" },
];

export const POSITION_OPTIONS = FOOTBALL_POSITIONS.map(p => ({
  value: p.key,
  label: `${p.key} — ${p.label}`,
  group: p.group,
}));


export const COACH_SPECIALIZATIONS = [
  "Head Coach", "Assistant Coach", "Youth Coach", "Goalkeeping Coach",
  "Fitness Coach", "Tactical Analyst", "Set-Piece Coach",
];

export const REFEREE_LICENSES = [
  "FIFA Badge", "AFC License", "BFF A License", "BFF B License",
  "District Level", "Divisional Level", "National Level",
];

export const TEAM_STATUS_INFO: Record<string, {
  label: string; labelBn: string; color: string; bg: string; icon: string; desc: string;
}> = {
  callingSoon: {
    label: "Calling Soon", labelBn: "শীঘ্রই কল করা হবে",
    color: "text-blue-400", bg: "bg-blue-900/30 border-blue-800",
    icon: "📞", desc: "Our team will contact you shortly to confirm details and pricing.",
  },
  advancePending: {
    label: "Advance Pending", labelBn: "অগ্রিম বাকি",
    color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-800",
    icon: "💰", desc: "Waiting for advance payment to confirm the booking.",
  },
  confirmed: {
    label: "Confirmed", labelBn: "নিশ্চিত",
    color: "text-green-400", bg: "bg-green-900/30 border-green-800",
    icon: "✓", desc: "Booking confirmed. Players are locked in for this match.",
  },
  playerOnTheWay: {
    label: "Players On The Way", labelBn: "খেলোয়াড় পথে আছে",
    color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-800",
    icon: "🚗", desc: "Squad has left for the venue. Hirer has been notified.",
  },
  completed: {
    label: "Completed", labelBn: "সম্পন্ন",
    color: "text-purple-400", bg: "bg-purple-900/30 border-purple-800",
    icon: "🏁", desc: "Match completed successfully.",
  },
  cancelled: {
    label: "Cancelled", labelBn: "বাতিল",
    color: "text-red-400", bg: "bg-red-900/30 border-red-800",
    icon: "✕", desc: "This request was cancelled.",
  },
};

export const BOOKING_STATUS_INFO: Record<string, {
  label: string; labelBn: string; color: string; bg: string; icon: string; desc: string;
}> = {
  callingSoon: {
    label: "Calling Soon", labelBn: "শীঘ্রই কল করা হবে",
    color: "text-blue-400", bg: "bg-blue-900/30 border-blue-800",
    icon: "📞", desc: "We'll contact you shortly to confirm details and pricing.",
  },
  advancePending: {
    label: "Advance Pending", labelBn: "অগ্রিম বাকি",
    color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-800",
    icon: "💰", desc: "Waiting for advance payment to confirm the booking.",
  },
  confirmed: {
    label: "Confirmed", labelBn: "নিশ্চিত",
    color: "text-green-400", bg: "bg-green-900/30 border-green-800",
    icon: "✓", desc: "Booking confirmed. The player is locked in for this match.",
  },
  playerOnTheWay: {
    label: "On The Way", labelBn: "পথে আছে",
    color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-800",
    icon: "🚗", desc: "Player has left for the venue. Hirer has been notified.",
  },
  completed: {
    label: "Completed", labelBn: "সম্পন্ন",
    color: "text-purple-400", bg: "bg-purple-900/30 border-purple-800",
    icon: "🏁", desc: "Match completed successfully.",
  },
  cancelled: {
    label: "Cancelled", labelBn: "বাতিল",
    color: "text-red-400", bg: "bg-red-900/30 border-red-800",
    icon: "✕", desc: "This booking was cancelled.",
  },
};

// ═══════════ VEHICLES ═══════════

export enum VehicleType {
  CAR = "car",
  MICROBUS = "microbus",
  MINIBUS = "minibus",
  BUS = "bus",
  PICKUP = "pickup",
}

export const VEHICLE_TYPES = [
  { value: "car", label: "Car", labelBn: "কার", icon: "🚗" },
  { value: "microbus", label: "Microbus", labelBn: "মাইক্রোবাস", icon: "🚐" },
  { value: "minibus", label: "Minibus", labelBn: "মিনিবাস", icon: "🚌" },
  { value: "bus", label: "Bus", labelBn: "বাস", icon: "🚍" },
  { value: "pickup", label: "Pickup", labelBn: "পিকআপ", icon: "🛻" },
];

export interface PhotoEntry {
  url: string;
  publicId: string;
}

export interface DistrictCharge {
  district: string;
  extraCharge: number;
}

export interface Vehicle {
  id: string;
  model: string;
  vehicleType: VehicleType;
  seats: number;
  hasAc: boolean;
  description?: string;
  photos: PhotoEntry[];
  basePerDay: number;
  districtCharges: DistrictCharge[];
  minDays: number;
  maxDays?: number;
  isAvailable: boolean;
  unavailableDates: string[];
  baseDistrict?: string;
  registrationNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleBooking {
  id: string;
  customer: User;
  customerId: string;
  vehicle: Vehicle;
  vehicleId: string;
  startDate: string;
  days: number;
  district: string;
  upazila?: string;
  pickupAddress?: string;
  message?: string;
  estimatedAmount: number;
  finalAmount?: number;
  advanceAmount?: number;
  status: string;
  adminNote?: string;
  // Payment
  commissionRate?: number;
  commissionAmount?: number;
  amountPaid?: number;
  payoutPaid?: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════ SHOP ═══════════

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ON_THE_WAY = "onTheWay",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export const ORDER_STATUS_INFO: Record<string, {
  label: string; labelBn: string; color: string; bg: string; icon: string; desc: string;
}> = {
  pending: {
    label: "Pending", labelBn: "অপেক্ষমাণ",
    color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-800",
    icon: "⏳", desc: "We received your order and will confirm shortly.",
  },
  confirmed: {
    label: "Confirmed", labelBn: "নিশ্চিত",
    color: "text-blue-400", bg: "bg-blue-900/30 border-blue-800",
    icon: "✓", desc: "Order confirmed and being prepared.",
  },
  onTheWay: {
    label: "On The Way", labelBn: "পথে আছে",
    color: "text-purple-400", bg: "bg-purple-900/30 border-purple-800",
    icon: "🚚", desc: "Your order is out for delivery.",
  },
  delivered: {
    label: "Delivered", labelBn: "ডেলিভারি হয়েছে",
    color: "text-green-400", bg: "bg-green-900/30 border-green-800",
    icon: "📦", desc: "Order delivered successfully.",
  },
  cancelled: {
    label: "Cancelled", labelBn: "বাতিল",
    color: "text-red-400", bg: "bg-red-900/30 border-red-800",
    icon: "✕", desc: "This order was cancelled.",
  },
};

export const SERVICE_STATUS_INFO: Record<string, {
  label: string; labelBn: string; color: string; bg: string; icon: string; desc: string;
}> = {
  advancePending: {
    label: "Advance Pending", labelBn: "অগ্রিম বাকি",
    color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-800",
    icon: "💰", desc: "Waiting for advance payment to confirm.",
  },
  confirmed: {
    label: "Confirmed", labelBn: "নিশ্চিত",
    color: "text-green-400", bg: "bg-green-900/30 border-green-800",
    icon: "✓", desc: "Booking confirmed.",
  },
  completed: {
    label: "Completed", labelBn: "সম্পন্ন",
    color: "text-purple-400", bg: "bg-purple-900/30 border-purple-800",
    icon: "🏁", desc: "Service completed successfully.",
  },
  cancelled: {
    label: "Cancelled", labelBn: "বাতিল",
    color: "text-red-400", bg: "bg-red-900/30 border-red-800",
    icon: "✕", desc: "This booking was cancelled.",
  },
};

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  icon?: string;
  image?: string;
  imagePublicId?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  category?: Category;
  categoryId?: string;
  photos: PhotoEntry[];
  price: number;
  oldPrice?: number;
  stock: number;
  brand?: string;
  variants: ProductVariant[];
  dhakaDeliveryCharge: number;
  outsideDeliveryCharge: number;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  photo: string;
  price: number;
  quantity: number;
  variant?: string;
  subtotal: number;
}

export interface Order {
  amountPaid: number;
  id: string;
  orderNo: string;
  customer: User;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  recipientName: string;
  phone: string;
  district: string;
  upazila?: string;
  address: string;
  note?: string;
  status: OrderStatus;
  paymentMethod: string;
  isPaid: boolean;
  transactionId?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════ CAMERAMAN ═══════════

export interface CameramanBooking {
  id: string;
  customer: User;
  customerId: string;
  cameraman: Player;
  cameramanId: string;
  matchDate: string;
  tournament?: string;
  district: string;
  upazila?: string;
  venue?: string;
  startTime?: string;
  durationHours: number;
  message?: string;
  quotedRate: number;
  finalAmount?: number;
  advanceAmount?: number;
  status: string;
  adminNote?: string;
  // Payment
  commissionRate?: number;
  commissionAmount?: number;
  amountPaid?: number;
  payoutPaid?: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
  APPLE = "apple",
}

export enum OtpPurpose {
  EMAIL_VERIFY = "emailVerify",
  PHONE_VERIFY = "phoneVerify",
  PASSWORD_RESET = "passwordReset",
  LOGIN = "login",
}

export enum OtpChannel {
  EMAIL = "email",
  SMS = "sms",
}