CREATE TABLE public.settings (
    id text PRIMARY KEY DEFAULT 'global',
    opening_time text NOT NULL DEFAULT '09:00',
    closing_time text NOT NULL DEFAULT '19:00',
    closed_days integer[] NOT NULL DEFAULT '{0}',
    blocked_dates text[] NOT NULL DEFAULT '{}',
    buffer_time_mins integer NOT NULL DEFAULT 0
);

INSERT INTO public.settings (id, opening_time, closing_time, closed_days, blocked_dates, buffer_time_mins)
VALUES ('global', '09:00', '19:00', '{0}', '{}', 0)
ON CONFLICT (id) DO NOTHING;
