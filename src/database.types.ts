/**
 * Row shapes for the Supabase tables, in the form `createClient<Database>()`
 * wants.
 *
 * WRITTEN BY HAND from supabase/migrations/*.sql, not generated — generating it
 * needs `npx supabase login` against the hosted project, which is a credential
 * this repo does not carry. The migrations are the single source either way, so
 * the rule is: change a column, change it here in the same commit. That is the
 * one thing a generated file would enforce and this one cannot.
 *
 * What it buys: `.from('solved').select('question_id')` now returns a typed
 * row, so the `as string` casts progress.ts used to need are gone and renaming
 * a column here turns every stale read into a compile error instead of an
 * undefined at runtime.
 *
 * `signals` and `signal_budget` are deliberately absent: signals.ts posts to
 * PostgREST with a bare fetch precisely so the 110 kB client stays lazy
 * (CLAUDE.md, "Feedback and analytics"), so no typed client ever touches them.
 */

/** A table whose Insert/Update shapes differ only in which columns are optional. */
interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      solved: Table<
        { user_id: string; question_id: string; solved_at: string },
        { user_id: string; question_id: string; solved_at?: string },
        { user_id?: string; question_id?: string; solved_at?: string }
      >;
      attempts: Table<
        {
          id: string;
          user_id: string;
          question_id: string;
          topic: string | null;
          correct: boolean;
          chosen: number | null;
          answered_at: string;
        },
        {
          id: string;
          user_id: string;
          question_id: string;
          topic?: string | null;
          correct: boolean;
          chosen?: number | null;
          answered_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          question_id?: string;
          topic?: string | null;
          correct?: boolean;
          chosen?: number | null;
          answered_at?: string;
        }
      >;
      bookmarks: Table<
        { user_id: string; question_id: string; created_at: string },
        { user_id: string; question_id: string; created_at?: string },
        { user_id?: string; question_id?: string; created_at?: string }
      >;
      progress_reset: Table<
        { user_id: string; reset_at: string },
        { user_id: string; reset_at?: string },
        { user_id?: string; reset_at?: string }
      >;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
