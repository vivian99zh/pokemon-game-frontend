import { z } from 'zod/v4';

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
});

export const RegisterSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ['confirmPassword']
      });
    }
  });

export const pokemonListItemSchema = z.object({
  name: z.string(),
  url: z.url()
});

export const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  base_experience: z.number().nullable(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: z.string(),
        url: z.url()
      })
    })
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: z.object({
        name: z.string(),
        url: z.string().url()
      })
    })
  ),
  abilities: z
    .array(
      z.object({
        ability: z.object({
          name: z.string(),
          url: z.string().url()
        }),
        is_hidden: z.boolean(),
        slot: z.number()
      })
    )
    .optional(),
  sprites: z.object({
    front_default: z.string().url().nullable(),
    other: z.object({
      'official-artwork': z.object({
        front_default: z.string().url().nullable()
      })
    })
  })
});

// Schema for API response
export const pokemonListResponseSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(pokemonListItemSchema)
});

export const scoreSchema = z.object({
  //userId: z.string(),
  score: z.number().int().min(0)
  // wins: z.number().int().min(0),
  // losses: z.number().int().min(0),
  // pokemonName: z.string(),
  // pokemonId: z.number().int().positive()
});

export const leaderboardUserSchema = z.object({
  id: z.string(),
  username: z.string().optional()
});

export const leaderboardEntrySchema = scoreSchema.extend({
  rank: z.string(),
  user: leaderboardUserSchema,
  score: z.number().min(0).max(100000),
  date: z.string(),
  winRate: z.number().min(0).max(100)
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type PokemonListItem = z.infer<typeof pokemonListItemSchema>;
export type PokemonDetail = z.infer<typeof pokemonDetailSchema>;
export type PokemonListResponse = z.infer<typeof pokemonListResponseSchema>;
export type Score = z.infer<typeof scoreSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
