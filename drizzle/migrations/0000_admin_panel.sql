create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- First 2 accounts become admins automatically
create or replace function public.assign_first_admins()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.user_roles where role = 'admin') < 2 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.assign_first_admins();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price text not null default '',
  image_path text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads visible products" on public.products for select to anon, authenticated using (visible or public.has_role(auth.uid(), 'admin'));
create policy "admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- Gallery
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  image_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.gallery to anon, authenticated;
grant insert, update, delete on public.gallery to authenticated;
grant all on public.gallery to service_role;
alter table public.gallery enable row level security;
create policy "public reads gallery" on public.gallery for select to anon, authenticated using (true);
create policy "admins manage gallery" on public.gallery for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Filament inventory (admin only)
create table public.filaments (
  id uuid primary key default gen_random_uuid(),
  material text not null default 'PLA',
  color text not null,
  nuevo int not null default 0,
  medio int not null default 0,
  pichintun int not null default 0,
  comprar int not null default 0,
  notes text not null default '',
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.filaments to authenticated;
grant all on public.filaments to service_role;
alter table public.filaments enable row level security;
create policy "admins manage filaments" on public.filaments for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger filaments_touch before update on public.filaments for each row execute function public.touch_updated_at();

-- Project requests (anyone can send, only admins read)
create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null default '',
  material text not null default '',
  tamano text not null default '',
  cantidad int not null default 1,
  detalle text not null,
  archivo_nombre text not null default '',
  status text not null default 'nuevo',
  created_at timestamptz not null default now()
);
grant insert on public.project_requests to anon, authenticated;
grant select, update, delete on public.project_requests to authenticated;
grant all on public.project_requests to service_role;
alter table public.project_requests enable row level security;
create policy "anyone sends requests" on public.project_requests for insert to anon, authenticated
  with check (status = 'nuevo' and length(nombre) between 1 and 120 and length(detalle) between 1 and 4000);
create policy "admins read requests" on public.project_requests for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins update requests" on public.project_requests for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete requests" on public.project_requests for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Storage: admins upload to images bucket
create policy "admins upload images" on storage.objects for insert to authenticated with check (bucket_id = 'images' and public.has_role(auth.uid(), 'admin'));
create policy "admins update images" on storage.objects for update to authenticated using (bucket_id = 'images' and public.has_role(auth.uid(), 'admin'));
create policy "admins delete images" on storage.objects for delete to authenticated using (bucket_id = 'images' and public.has_role(auth.uid(), 'admin'));

-- Seed
insert into public.products (name, description, price, image_path, sort_order) values
('Decoración', 'Maceteros, floreros y objetos de diseño low-poly.', 'Desde $8.000', 'seed/p-deco.jpg', 1),
('Figuras y coleccionables', 'Miniaturas, personajes y juguetes articulados.', 'Desde $6.000', 'seed/p-figuras.jpg', 2),
('Piezas funcionales', 'Engranajes, soportes, organizadores y repuestos.', 'Desde $3.000', 'seed/p-funcional.jpg', 3);

insert into public.filaments (color, nuevo, pichintun, medio, comprar) values
('amarillo',2,2,1,2),('beige',1,0,0,0),('blanco',2,7,1,2),('blue',0,0,1,1),('cafe',1,1,1,1),
('dark blue',2,1,0,1),('dusk',0,0,2,0),('fluo green',1,0,1,0),('fluo yellow',0,1,1,0),('forest green',0,1,0,0),
('gray',1,1,2,0),('green',1,1,2,0),('light blue 1',0,0,1,0),('light blue 2',0,1,0,0),('marmolado',1,1,2,0),
('morado brillante',1,0,0,0),('naranjo',2,1,0,0),('negro',2,2,1,1),('piel',1,1,1,0),('purple',1,0,2,0),
('rojo',1,1,0,0),('rosado',1,0,2,1),('silver',1,2,0,0),('transparente',6,0,2,0);