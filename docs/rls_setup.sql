-- this is the sql Gabor used to set up the RLS policies for the Supabase database

BEGIN;

create policy "Project insert" on public.projects
  for insert with check (auth.role() = 'authenticated');

create policy "Scene insert" on public.scenes
  for insert with check (auth.role() = 'authenticated');

create policy "Prompt insert" on public.scene_prompts
  for insert with check (auth.role() = 'authenticated');

create policy "Still insert" on public.scene_stills
  for insert with check (auth.role() = 'authenticated');

create policy "Video insert" on public.scene_videos
  for insert with check (auth.role() = 'authenticated');

create policy "Project output insert" on public.project_outputs
  for insert with check (auth.role() = 'authenticated');

create policy "User profile insert" on public.user_profiles
  for insert with check (auth.role() = 'authenticated');

create policy "Project update" on public.projects
  for update using ( auth.uid() = owner_id );

create policy "Project select" on public.projects
  for select using ( auth.uid() = owner_id );

create policy "Project delete" on public.projects
  for delete using ( auth.uid() = owner_id );

create policy "Scene update" on public.scenes
  for update using ( auth.uid() = owner_id );

create policy "Scene select" on public.scenes
  for select using ( auth.uid() = owner_id );

create policy "Scene delete" on public.scenes
  for delete using ( auth.uid() = owner_id );

create policy "Prompt update" on public.scene_prompts
  for update using ( auth.uid() = owner_id );

create policy "Prompt select" on public.scene_prompts
  for select using ( auth.uid() = owner_id );

create policy "Prompt delete" on public.scene_prompts
  for delete using ( auth.uid() = owner_id );

create policy "Still update" on public.scene_stills
  for update using ( auth.uid() = owner_id );

create policy "Still select" on public.scene_stills
  for select using ( auth.uid() = owner_id );

create policy "Still delete" on public.scene_stills
  for delete using ( auth.uid() = owner_id );

create policy "Video update" on public.scene_videos
  for update using ( auth.uid() = owner_id );

create policy "Video select" on public.scene_videos
  for select using ( auth.uid() = owner_id );

create policy "Video delete" on public.scene_videos
  for delete using ( auth.uid() = owner_id );

create policy "Project output update" on public.project_outputs
  for update using ( auth.uid() = owner_id );

create policy "Project output select" on public.project_outputs
  for select using ( auth.uid() = owner_id );

create policy "Project output delete" on public.project_outputs
  for delete using ( auth.uid() = owner_id );

create policy "User profile update" on public.user_profiles
  for update using ( auth.uid() = owner_id );

create policy "User profile select" on public.user_profiles
  for select using ( auth.uid() = owner_id );

create policy "User profile delete" on public.user_profiles
  for delete using ( auth.uid() = owner_id );

COMMIT;