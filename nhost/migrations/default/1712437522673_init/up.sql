SET check_function_bodies = false;
CREATE TYPE public.datetime_range AS (
	start integer,
	stop integer
);
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.availability (
    username text NOT NULL,
    event_id uuid NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    availability jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_extrapeople boolean DEFAULT false NOT NULL,
    dates public.datetime_range[] NOT NULL,
    "shouldUseWeekdays" boolean DEFAULT false NOT NULL
);
ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.availability
    ADD CONSTRAINT unique_event_username UNIQUE (event_id, username);
CREATE TRIGGER set_public_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_availability_updated_at ON public.availability IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE RESTRICT ON DELETE CASCADE;
