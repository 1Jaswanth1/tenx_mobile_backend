
  create table "public"."chat_room" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "is_direct" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."chat_room" enable row level security;


  create table "public"."chat_room_member" (
    "chat_room_id" uuid not null,
    "member_id" uuid not null,
    "joined_at" timestamp with time zone not null default now(),
    "last_read_at" timestamp with time zone default now()
      );


alter table "public"."chat_room_member" enable row level security;


  create table "public"."message" (
    "id" uuid not null default gen_random_uuid(),
    "chat_room_id" uuid not null,
    "author_id" uuid not null,
    "text" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "is_edited" boolean not null default false,
    "is_deleted" boolean not null default false
      );


alter table "public"."message" enable row level security;

CREATE UNIQUE INDEX chat_room_member_pkey ON public.chat_room_member USING btree (chat_room_id, member_id);

CREATE UNIQUE INDEX chat_room_pkey ON public.chat_room USING btree (id);

CREATE INDEX idx_chat_room_created_at ON public.chat_room USING btree (created_at DESC);

CREATE INDEX idx_chat_room_is_direct ON public.chat_room USING btree (is_direct) WHERE (is_direct = true);

CREATE INDEX idx_chat_room_member_member_id ON public.chat_room_member USING btree (member_id);

CREATE INDEX idx_chat_room_member_room_id ON public.chat_room_member USING btree (chat_room_id);

CREATE INDEX idx_message_author_id ON public.message USING btree (author_id);

CREATE INDEX idx_message_chat_room_id ON public.message USING btree (chat_room_id);

CREATE INDEX idx_message_created_at ON public.message USING btree (created_at DESC);

CREATE INDEX idx_message_room_created ON public.message USING btree (chat_room_id, created_at DESC);

CREATE INDEX idx_message_room_time_not_deleted ON public.message USING btree (chat_room_id, created_at DESC) WHERE (is_deleted = false);

CREATE UNIQUE INDEX message_pkey ON public.message USING btree (id);

alter table "public"."chat_room" add constraint "chat_room_pkey" PRIMARY KEY using index "chat_room_pkey";

alter table "public"."chat_room_member" add constraint "chat_room_member_pkey" PRIMARY KEY using index "chat_room_member_pkey";

alter table "public"."message" add constraint "message_pkey" PRIMARY KEY using index "message_pkey";

alter table "public"."chat_room_member" add constraint "chat_room_member_chat_room_id_fkey" FOREIGN KEY (chat_room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE not valid;

alter table "public"."chat_room_member" validate constraint "chat_room_member_chat_room_id_fkey";

alter table "public"."chat_room_member" add constraint "chat_room_member_member_id_fkey" FOREIGN KEY (member_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_room_member" validate constraint "chat_room_member_member_id_fkey";

alter table "public"."message" add constraint "message_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."message" validate constraint "message_author_id_fkey";

alter table "public"."message" add constraint "message_chat_room_id_fkey" FOREIGN KEY (chat_room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE not valid;

alter table "public"."message" validate constraint "message_chat_room_id_fkey";

alter table "public"."message" add constraint "message_text_check" CHECK (((length(text) > 0) AND (length(text) <= 10000))) not valid;

alter table "public"."message" validate constraint "message_text_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(user1_id uuid, user2_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  room_id UUID;
  room_name TEXT;
BEGIN
  -- Check if room already exists between these two users
  SELECT crm1.chat_room_id INTO room_id
  FROM chat_room_member crm1
  JOIN chat_room_member crm2 ON crm1.chat_room_id = crm2.chat_room_id
  JOIN chat_room cr ON crm1.chat_room_id = cr.id
  WHERE crm1.member_id = user1_id
    AND crm2.member_id = user2_id
    AND cr.is_direct = true
  LIMIT 1;

  -- If room doesn't exist, create it
  IF room_id IS NULL THEN
    -- Generate room name from usernames
    SELECT
      CONCAT(u1.username, ' & ', u2.username) INTO room_name
    FROM users u1, users u2
    WHERE u1.id = user1_id AND u2.id = user2_id;

    -- Create the room
    INSERT INTO chat_room (name, is_direct)
    VALUES (room_name, true)
    RETURNING id INTO room_id;

    -- Add both members
    INSERT INTO chat_room_member (chat_room_id, member_id)
    VALUES
      (room_id, user1_id),
      (room_id, user2_id);
  END IF;

  RETURN room_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid, p_room_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  unread_count INTEGER;
  last_read TIMESTAMPTZ;
BEGIN
  -- Get user's last read timestamp
  SELECT last_read_at INTO last_read
  FROM chat_room_member
  WHERE chat_room_id = p_room_id AND member_id = p_user_id;

  -- Count messages after last read
  SELECT COUNT(*) INTO unread_count
  FROM message
  WHERE chat_room_id = p_room_id
    AND created_at > COALESCE(last_read, '1970-01-01'::TIMESTAMPTZ)
    AND author_id != p_user_id
    AND is_deleted = false;

  RETURN unread_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_duplicate_chat_room()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  existing_room_id UUID;
  other_member_id UUID;
BEGIN
  -- Only check for direct chat rooms (1-on-1)
  IF (SELECT is_direct FROM chat_room WHERE id = NEW.chat_room_id) THEN
    -- Get the other member in this room (if any)
    SELECT member_id INTO other_member_id
    FROM chat_room_member
    WHERE chat_room_id = NEW.chat_room_id
      AND member_id != NEW.member_id
    LIMIT 1;

    -- If there's another member, check if these two users already have a room together
    IF other_member_id IS NOT NULL THEN
      SELECT crm1.chat_room_id INTO existing_room_id
      FROM chat_room_member crm1
      JOIN chat_room_member crm2 ON crm1.chat_room_id = crm2.chat_room_id
      JOIN chat_room cr ON crm1.chat_room_id = cr.id
      WHERE crm1.member_id = NEW.member_id
        AND crm2.member_id = other_member_id
        AND cr.is_direct = true
        AND crm1.chat_room_id != NEW.chat_room_id
      LIMIT 1;

      -- If a room already exists, prevent the insert
      IF existing_room_id IS NOT NULL THEN
        RAISE EXCEPTION 'Chat room already exists between these users: %', existing_room_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."chat_room" to "anon";

grant insert on table "public"."chat_room" to "anon";

grant references on table "public"."chat_room" to "anon";

grant select on table "public"."chat_room" to "anon";

grant trigger on table "public"."chat_room" to "anon";

grant truncate on table "public"."chat_room" to "anon";

grant update on table "public"."chat_room" to "anon";

grant delete on table "public"."chat_room" to "authenticated";

grant insert on table "public"."chat_room" to "authenticated";

grant references on table "public"."chat_room" to "authenticated";

grant select on table "public"."chat_room" to "authenticated";

grant trigger on table "public"."chat_room" to "authenticated";

grant truncate on table "public"."chat_room" to "authenticated";

grant update on table "public"."chat_room" to "authenticated";

grant delete on table "public"."chat_room" to "service_role";

grant insert on table "public"."chat_room" to "service_role";

grant references on table "public"."chat_room" to "service_role";

grant select on table "public"."chat_room" to "service_role";

grant trigger on table "public"."chat_room" to "service_role";

grant truncate on table "public"."chat_room" to "service_role";

grant update on table "public"."chat_room" to "service_role";

grant delete on table "public"."chat_room_member" to "anon";

grant insert on table "public"."chat_room_member" to "anon";

grant references on table "public"."chat_room_member" to "anon";

grant select on table "public"."chat_room_member" to "anon";

grant trigger on table "public"."chat_room_member" to "anon";

grant truncate on table "public"."chat_room_member" to "anon";

grant update on table "public"."chat_room_member" to "anon";

grant delete on table "public"."chat_room_member" to "authenticated";

grant insert on table "public"."chat_room_member" to "authenticated";

grant references on table "public"."chat_room_member" to "authenticated";

grant select on table "public"."chat_room_member" to "authenticated";

grant trigger on table "public"."chat_room_member" to "authenticated";

grant truncate on table "public"."chat_room_member" to "authenticated";

grant update on table "public"."chat_room_member" to "authenticated";

grant delete on table "public"."chat_room_member" to "service_role";

grant insert on table "public"."chat_room_member" to "service_role";

grant references on table "public"."chat_room_member" to "service_role";

grant select on table "public"."chat_room_member" to "service_role";

grant trigger on table "public"."chat_room_member" to "service_role";

grant truncate on table "public"."chat_room_member" to "service_role";

grant update on table "public"."chat_room_member" to "service_role";

grant delete on table "public"."message" to "anon";

grant insert on table "public"."message" to "anon";

grant references on table "public"."message" to "anon";

grant select on table "public"."message" to "anon";

grant trigger on table "public"."message" to "anon";

grant truncate on table "public"."message" to "anon";

grant update on table "public"."message" to "anon";

grant delete on table "public"."message" to "authenticated";

grant insert on table "public"."message" to "authenticated";

grant references on table "public"."message" to "authenticated";

grant select on table "public"."message" to "authenticated";

grant trigger on table "public"."message" to "authenticated";

grant truncate on table "public"."message" to "authenticated";

grant update on table "public"."message" to "authenticated";

grant delete on table "public"."message" to "service_role";

grant insert on table "public"."message" to "service_role";

grant references on table "public"."message" to "service_role";

grant select on table "public"."message" to "service_role";

grant trigger on table "public"."message" to "service_role";

grant truncate on table "public"."message" to "service_role";

grant update on table "public"."message" to "service_role";


  create policy "Users can create chat rooms"
  on "public"."chat_room"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can view their chat rooms"
  on "public"."chat_room"
  as permissive
  for select
  to public
using ((id IN ( SELECT chat_room_member.chat_room_id
   FROM public.chat_room_member
  WHERE (chat_room_member.member_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = auth.uid()))))));



  create policy "Users cannot delete chat rooms"
  on "public"."chat_room"
  as permissive
  for delete
  to public
using (false);



  create policy "Users cannot update chat rooms"
  on "public"."chat_room"
  as permissive
  for update
  to public
using (false);



  create policy "Users can join rooms"
  on "public"."chat_room_member"
  as permissive
  for insert
  to public
with check ((member_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))));



  create policy "Users can leave rooms"
  on "public"."chat_room_member"
  as permissive
  for delete
  to public
using ((member_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))));



  create policy "Users can update own membership"
  on "public"."chat_room_member"
  as permissive
  for update
  to public
using ((member_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))))
with check ((member_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))));



  create policy "Users can view room members"
  on "public"."chat_room_member"
  as permissive
  for select
  to public
using ((chat_room_id IN ( SELECT chat_room_member_1.chat_room_id
   FROM public.chat_room_member chat_room_member_1
  WHERE (chat_room_member_1.member_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = auth.uid()))))));



  create policy "Users can delete own messages"
  on "public"."message"
  as permissive
  for update
  to public
using ((author_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))));



  create policy "Users can send messages to their rooms"
  on "public"."message"
  as permissive
  for insert
  to public
with check (((author_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))) AND (chat_room_id IN ( SELECT chat_room_member.chat_room_id
   FROM public.chat_room_member
  WHERE (chat_room_member.member_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = auth.uid())))))));



  create policy "Users can update own messages"
  on "public"."message"
  as permissive
  for update
  to public
using ((author_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))))
with check (((author_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = auth.uid()))) AND (author_id = ( SELECT message_1.author_id
   FROM public.message message_1
  WHERE (message_1.id = message_1.id))) AND (chat_room_id = ( SELECT message_1.chat_room_id
   FROM public.message message_1
  WHERE (message_1.id = message_1.id)))));



  create policy "Users can view messages in their rooms"
  on "public"."message"
  as permissive
  for select
  to public
using ((chat_room_id IN ( SELECT chat_room_member.chat_room_id
   FROM public.chat_room_member
  WHERE (chat_room_member.member_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = auth.uid()))))));


CREATE TRIGGER update_chat_room_updated_at BEFORE UPDATE ON public.chat_room FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER check_duplicate_chat_room BEFORE INSERT ON public.chat_room_member FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_chat_room();

CREATE TRIGGER update_message_updated_at BEFORE UPDATE ON public.message FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


