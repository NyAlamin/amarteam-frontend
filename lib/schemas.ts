import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must have uppercase, lowercase & number"),
  phone: z.string().regex(/^01\d{9}$/, "Invalid BD number").optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
});
export type RegisterInput = z.infer<typeof registerSchema>;

const clubEntrySchema = z.object({
  name: z.string().min(1).max(100),
  joinYear: z.number().min(1990).max(2030),
  leftYear: z.number().min(1990).max(2030).nullable().optional(),
  isCurrent: z.boolean(),
});

const nationalTeamSchema = z.object({
  level: z.string().min(1),
  year: z.number().min(1990).max(2030),
  isCurrent: z.boolean(),
});

const chargesSchema = z.object({
  friendly: z.number().min(500),
  groupRound: z.number().min(500),
  final: z.number().min(500),
  friendlyDiscount: z.number().min(0).nullable().optional(),
  groupRoundDiscount: z.number().min(0).nullable().optional(),
  finalDiscount: z.number().min(0).nullable().optional(),
});

export const createPlayerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  phone: z.string().optional().or(z.literal("")),
  photo: z.string().optional().or(z.literal("")),
  position: z.enum(["GK","LB","CB","RB","LWB","RWB","CDM","CM","CAM","LM","RM","LW","RW","LF","CF","RF","ST"]),
  tier: z.enum(["A", "B", "C"]).optional(),
  charges: chargesSchema,
  age: z.number().min(15).max(50),
  experience: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  location: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  stats: z.object({
    goals: z.number().min(0), assists: z.number().min(0), matches: z.number().min(0),
    cleanSheets: z.number().min(0), yellowCards: z.number().min(0), redCards: z.number().min(0),
  }).optional(),
});
export type CreatePlayerInput = z.infer<typeof createPlayerSchema> & {
  clubs?: any[];
  nationalTeams?: any[];
};

export const updatePlayerSchema = z.object({
  photo: z.string().optional(), photoPublicId: z.string().optional(),
  position: z.enum(["GK","LB","CB","RB","LWB","RWB","CDM","CM","CAM","LM","RM","LW","RW","LF","CF","RF","ST"]).optional(),
  tier: z.enum(["A", "B", "C"]).optional(),
  // clubs: z.array(clubEntrySchema).optional(),
  // nationalTeams: z.array(nationalTeamSchema).optional(),
  charges: chargesSchema.optional(),
  age: z.number().min(15).max(50).optional(),
  experience: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  isAvailable: z.boolean().optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  stats: z.object({
    goals: z.number().min(0), assists: z.number().min(0), matches: z.number().min(0),
    cleanSheets: z.number().min(0), yellowCards: z.number().min(0), redCards: z.number().min(0),
  }).optional(),
});
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

export const playerSelfUpdateSchema = z.object({
  bio: z.string().max(1000).optional(),
  photo: z.string().optional(), photoPublicId: z.string().optional(),
  location: z.string().max(100).optional(),
  experience: z.number().min(0).max(50).optional(),
 clubs: z.any().optional(),
nationalTeams: z.any().optional(),
  charges: chargesSchema.optional(),
  videos: z.array(z.object({
    url: z.string(), publicId: z.string(), thumbnailUrl: z.string().optional(),
    title: z.string().max(200).optional(), duration: z.number().optional(),
  })).optional(),
  availableDates: z.array(z.string()).optional(),
  unavailableDates: z.array(z.string()).optional(),
  tournaments: z.array(z.string()).optional(),
  matchHistory: z.array(z.object({
    date: z.string(), tournament: z.string(), opponent: z.string(),
    result: z.string(), performance: z.string(),
  })).optional(),
});
export type PlayerSelfUpdateInput = z.infer<typeof playerSelfUpdateSchema>;

export const createBookingSchema = z.object({
  playerId: z.string().uuid(),
  matchDate: z.string().min(1, "Date required"),
  tournament: z.string().min(1, "Tournament required").max(150),
  matchType: z.enum(["friendly", "groupRound", "final"]),
  message: z.string().max(500).optional().or(z.literal("")),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const createReviewSchema = z.object({
  playerId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createTeamRequestSchema = z.object({
  budget: z.number().min(5000),
  playersNeeded: z.number().min(1).max(30),
  message: z.string().max(1000).optional().or(z.literal("")),
});
export type CreateTeamRequestInput = z.infer<typeof createTeamRequestSchema>;