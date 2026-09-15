-- Rugby Campus — Supabase setup
-- Paste this entire file into Supabase SQL Editor and click RUN once.

create table if not exists colleges (
  id bigint primary key generated always as identity,
  slug text unique not null, name text not null, location text, state text, region text,
  lat double precision, lng double precision, map_x double precision, map_y double precision,
  affiliation text, conference text, tier text, program_type text,
  draft_picks int default 0, player_count int default 0,
  coach_name text default '', coach_email text default '',
  description text, enrollment int, popular_majors jsonb default '[]',
  weather_summary text, monthly_temps jsonb default '[]',
  badges jsonb default '[]', achievements jsonb default '[]',
  website text, image_url text, gender text default 'mens',
  updated_at timestamptz default now()
);

create table if not exists email_subscribers (
  id bigint primary key generated always as identity,
  email text not null, source text not null default 'newsletter',
  created_at timestamptz default now()
);

create table if not exists contacts (
  id bigint primary key generated always as identity,
  name text, email text not null, message text, type text default 'general',
  created_at timestamptz default now()
);

-- Row Level Security: public can READ colleges and INSERT emails/contacts. Only you (dashboard) can edit.
alter table colleges enable row level security;
alter table email_subscribers enable row level security;
alter table contacts enable row level security;
create policy "public read colleges" on colleges for select using (true);
create policy "public insert subscribers" on email_subscribers for insert with check (true);
create policy "public insert contacts" on contacts for insert with check (true);

-- Seed all 40 colleges
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-california-berkeley','University of California, Berkeley','Berkeley, California','California','west',
  37.8719,-122.2585,37.6,255.8,
  'CRAA D1A','California','championship','Varsity',
  4,60,'Jack Clark','clarkj@berkeley.edu',
  '33-time National Champions with one of the most successful collegiate rugby programs in the US. Competes at Witter Rugby Field in Strawberry Canyon.',45882,'["Engineering", "Computer Science", "Business", "Biology"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 58, "lF": 45, "hC": 14, "lC": 7}, {"month": "Feb", "hF": 62, "lF": 47, "hC": 17, "lC": 8}, {"month": "Mar", "hF": 65, "lF": 49, "hC": 18, "lC": 9}, {"month": "Apr", "hF": 68, "lF": 51, "hC": 20, "lC": 11}, {"month": "May", "hF": 72, "lF": 54, "hC": 22, "lC": 12}, {"month": "Jun", "hF": 75, "lF": 57, "hC": 24, "lC": 14}, {"month": "Jul", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Aug", "hF": 76, "lF": 59, "hC": 24, "lC": 15}, {"month": "Sep", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 73, "lF": 55, "hC": 23, "lC": 13}, {"month": "Nov", "hF": 65, "lF": 50, "hC": 18, "lC": 10}, {"month": "Dec", "hF": 58, "lF": 45, "hC": 14, "lC": 7}]',
  '["4 MLR Draft Picks", "2026 D1A National Champions", "Back-to-Back Champions (2025 & 2026)"]','["33-time National Champions", "PAC Rugby Conference Titles"]',
  'https://www.berkeley.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'united-states-naval-academy','United States Naval Academy','Annapolis, Maryland','Maryland','northeast',
  38.9827,-76.4951,823.5,259.4,
  'CRAA D1A','Rugby East','championship','Varsity',
  0,56,'Gavin Hickie','hickie@usna.edu',
  'Elite naval academy with strong rugby tradition. Navy rugby competes at the highest level with excellent facilities and coaching.',4465,'["Engineering", "Political Science", "Economics", "Mathematics"]',
  'Warm summers, cool winters.','[{"month": "Jan", "hF": 43, "lF": 29, "hC": 6, "lC": -2}, {"month": "Feb", "hF": 47, "lF": 32, "hC": 8, "lC": 0}, {"month": "Mar", "hF": 56, "lF": 39, "hC": 13, "lC": 4}, {"month": "Apr", "hF": 67, "lF": 48, "hC": 19, "lC": 9}, {"month": "May", "hF": 76, "lF": 58, "hC": 24, "lC": 14}, {"month": "Jun", "hF": 84, "lF": 67, "hC": 29, "lC": 19}, {"month": "Jul", "hF": 88, "lF": 72, "hC": 31, "lC": 22}, {"month": "Aug", "hF": 86, "lF": 70, "hC": 30, "lC": 21}, {"month": "Sep", "hF": 80, "lF": 63, "hC": 27, "lC": 17}, {"month": "Oct", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Nov", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "Dec", "hF": 48, "lF": 33, "hC": 9, "lC": 1}]',
  '["2026 D1A Finalists"]','["Rugby East Conference Championships", "Multiple Elite Competition appearances"]',
  'https://www.usna.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'life-university','Life University','Marietta, Georgia','Georgia','southeast',
  33.9526,-84.52,701,394.3,
  'CRAA D1A','Rugby East','championship','Varsity',
  8,44,'Blake Bradford','francis.bradford@life.edu',
  'Life University Running Eagles are 2018 & 2019 back-to-back National Champions with one of the strongest rugby programs in collegiate rugby.',997,'["Chiropractic", "Biology", "Psychology", "Exercise Physiology"]',
  'Warm summers, cool winters.','[{"month": "Jan", "hF": 51, "lF": 31, "hC": 11, "lC": -1}, {"month": "Feb", "hF": 56, "lF": 35, "hC": 13, "lC": 2}, {"month": "Mar", "hF": 64, "lF": 42, "hC": 18, "lC": 6}, {"month": "Apr", "hF": 72, "lF": 49, "hC": 22, "lC": 9}, {"month": "May", "hF": 80, "lF": 58, "hC": 27, "lC": 14}, {"month": "Jun", "hF": 86, "lF": 66, "hC": 30, "lC": 19}, {"month": "Jul", "hF": 88, "lF": 70, "hC": 31, "lC": 21}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Oct", "hF": 73, "lF": 50, "hC": 23, "lC": 10}, {"month": "Nov", "hF": 63, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 53, "lF": 33, "hC": 12, "lC": 1}]',
  '["8 MLR Draft Picks", "2026 D1A Semifinalists", "Rugby Scholarships Available"]','["2018 & 2019 National Champions", "Multiple Rugby East Championships"]',
  'https://www.life.edu','https://images.unsplash.com/photo-1606800052259-a9b0a9c8c3b0?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'lindenwood-university','Lindenwood University','St. Charles, Missouri','Missouri','midwest',
  38.788,-90.505,585.1,295.3,
  'CRAA D1A','Midwest','championship','Varsity',
  17,96,'Josh Macy','jmacy@lindenwood.edu',
  'Lindenwood University features strong rugby programs with excellent facilities and coaching, competing at the highest collegiate level.',6992,'["Business", "Education", "Communications", "Criminal Justice"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 39, "lF": 22, "hC": 4, "lC": -6}, {"month": "Feb", "hF": 45, "lF": 27, "hC": 7, "lC": -3}, {"month": "Mar", "hF": 56, "lF": 37, "hC": 13, "lC": 3}, {"month": "Apr", "hF": 68, "lF": 48, "hC": 20, "lC": 9}, {"month": "May", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Jun", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Jul", "hF": 89, "lF": 71, "hC": 32, "lC": 22}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Oct", "hF": 69, "lF": 49, "hC": 21, "lC": 9}, {"month": "Nov", "hF": 55, "lF": 38, "hC": 13, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 26, "hC": 6, "lC": -3}]',
  '["17 MLR Draft Picks", "Rugby Scholarships Available"]','["Multiple Midwest Conference Championships", "National Tournament appearances"]',
  'https://www.lindenwood.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'saint-mary-s-college-of-california','Saint Mary''s College of California','Moraga, California','California','west',
  37.8448,-122.118,39.8,257,
  'CRAA D1A','California','championship','Club',
  5,0,'Tim O''Brien','',
  'No. 1 Men''s Rugby Team with national championship history and outstanding rugby facilities in the beautiful Bay Area hills.',2775,'["Business", "Liberal Arts", "Education", "Psychology"]',
  'Warm summers, mild winters.','[{"month": "Jan", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "Feb", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Mar", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Apr", "hF": 72, "lF": 50, "hC": 22, "lC": 10}, {"month": "May", "hF": 75, "lF": 53, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 79, "lF": 57, "hC": 26, "lC": 14}, {"month": "Jul", "hF": 82, "lF": 59, "hC": 28, "lC": 15}, {"month": "Aug", "hF": 83, "lF": 60, "hC": 28, "lC": 16}, {"month": "Sep", "hF": 82, "lF": 58, "hC": 28, "lC": 14}, {"month": "Oct", "hF": 77, "lF": 54, "hC": 25, "lC": 12}, {"month": "Nov", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Dec", "hF": 62, "lF": 42, "hC": 17, "lC": 6}]',
  '["5 MLR Draft Picks", "2026 D1A Semifinalists", "2024 D1A National Champions"]','["2014 National Champions", "Multiple California Conference Championships"]',
  'https://www.stmarys-ca.edu','https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'united-states-military-academy-army','United States Military Academy (Army)','West Point, New York','New York','northeast',
  41.3915,-73.9626,853.5,197.1,
  'CRAA D1A','Rugby East','championship','Varsity',
  2,67,'Matt Sherman','matthew.sherman@westpoint.edu',
  '2022 D1A National Champions with world-class rugby facilities and strong military tradition.',4508,'["Engineering", "Military Leadership", "International Affairs", "Economics"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 35, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 39, "lF": 23, "hC": 4, "lC": -5}, {"month": "Mar", "hF": 48, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 74, "lF": 56, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 51, "lF": 35, "hC": 11, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 26, "hC": 4, "lC": -3}]',
  '["2 MLR Draft Picks"]','["2022 D1A National Champions", "Multiple Rugby East Championships"]',
  'https://www.westpoint.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-california-los-angeles-ucla','University of California, Los Angeles (UCLA)','Los Angeles, California','California','west',
  34.0522,-118.2437,85.5,357.2,
  'NCR D1','Independent','playoff','Club',
  4,54,'Harry Bennett','hbennett@recreation.ucla.edu',
  'UCLA moved from CRAA D1A to NCR D1 for the 2026–27 season and immediately enters the NCR conversation as a contender. The Bruins play on one of the best rugby fields in the country at Wallis Annenberg Stadium, with live scoreboards and video replay, and have produced four MLR draft picks.',48651,'["Engineering", "Life Sciences", "Social Sciences", "Psychology"]',
  'Warm summers, mild winters.','[{"month": "Jan", "hF": 68, "lF": 48, "hC": 20, "lC": 9}, {"month": "Feb", "hF": 69, "lF": 50, "hC": 21, "lC": 10}, {"month": "Mar", "hF": 72, "lF": 53, "hC": 22, "lC": 12}, {"month": "Apr", "hF": 75, "lF": 56, "hC": 24, "lC": 13}, {"month": "May", "hF": 77, "lF": 60, "hC": 25, "lC": 16}, {"month": "Jun", "hF": 81, "lF": 64, "hC": 27, "lC": 18}, {"month": "Jul", "hF": 85, "lF": 68, "hC": 29, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 68, "hC": 29, "lC": 20}, {"month": "Sep", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Oct", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Nov", "hF": 73, "lF": 54, "hC": 23, "lC": 12}, {"month": "Dec", "hF": 68, "lF": 48, "hC": 20, "lC": 9}]',
  '["4 MLR Draft Picks"]','["PAC Rugby Conference Championships", "National Tournament appearances"]',
  'https://www.ucla.edu','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'brown-university','Brown University','Providence, Rhode Island','Rhode Island','northeast',
  41.8268,-71.4025,892.3,177.3,
  'NCR D1','Liberty','championship','Club',
  1,56,'David Laflamme','david_laflamme@brown.edu',
  'Brown University features top-tier rugby programs with excellent facilities and coaching. The men''s team won the 2022 Division 1 National Championship.',11700,'["Economics", "Computer Science", "International Relations", "Biology"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 40, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "May", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Jun", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 65, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 64, "lF": 47, "hC": 18, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 37, "hC": 12, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '[]','["2022 D1 National Champions", "Multiple Ivy Rugby Conference titles"]',
  'https://www.brown.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'mount-st-mary-s-university','Mount St. Mary''s University','Emmitsburg, Maryland','Maryland','northeast',
  39.6409,-77.3278,806.6,247.7,
  'CRAA D1A','Rugby East','competitive','Club',
  0,93,'Jay Myles','myles@msmary.edu',
  'Mount St. Mary''s University features strong rugby programs with the men''s team winning the 2016 NSCRO National Championship.',2240,'["Business", "Liberal Arts", "Natural Sciences", "Education"]',
  'Warm summers, cool winters.','[{"month": "Jan", "hF": 40, "lF": 26, "hC": 4, "lC": -3}, {"month": "Feb", "hF": 44, "lF": 28, "hC": 7, "lC": -2}, {"month": "Mar", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Apr", "hF": 64, "lF": 45, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Jun", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 69, "hC": 31, "lC": 21}, {"month": "Aug", "hF": 85, "lF": 67, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 78, "lF": 59, "hC": 26, "lC": 15}, {"month": "Oct", "hF": 67, "lF": 47, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 56, "lF": 37, "hC": 13, "lC": 3}, {"month": "Dec", "hF": 44, "lF": 30, "hC": 7, "lC": -1}]',
  '[]','["2016 NSCRO National Champions", "DI-AA Chesapeake Conference titles"]',
  'https://www.msmary.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'brigham-young-university','Brigham Young University','Provo, Utah','Utah','west',
  40.2518,-111.6493,227.1,243.3,
  'CRAA D1A','Rocky Mountain','playoff','Club',
  3,42,'Steve St. Pierre','steven_stpierre@byu.edu',
  'BYU has 5 National Championships (2015, 2014, 2013, 2012 & 2009) with one of the most successful collegiate rugby programs in the nation.',35074,'["Business", "Engineering", "Education", "Life Sciences"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 22, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 43, "lF": 27, "hC": 6, "lC": -3}, {"month": "Mar", "hF": 53, "lF": 35, "hC": 12, "lC": 2}, {"month": "Apr", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "May", "hF": 72, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 82, "lF": 60, "hC": 28, "lC": 16}, {"month": "Jul", "hF": 89, "lF": 67, "hC": 32, "lC": 19}, {"month": "Aug", "hF": 87, "lF": 65, "hC": 31, "lC": 18}, {"month": "Sep", "hF": 77, "lF": 55, "hC": 25, "lC": 13}, {"month": "Oct", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "Nov", "hF": 48, "lF": 32, "hC": 9, "lC": 0}, {"month": "Dec", "hF": 38, "lF": 24, "hC": 3, "lC": -4}]',
  '["3 MLR Draft Picks"]','["5 National Championships", "Multiple Rocky Mountain Conference titles"]',
  'https://www.byu.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-arizona','University of Arizona','Tucson, Arizona','Arizona','west',
  32.2319,-110.9501,210.5,423.7,
  'CRAA D1A','Independent','playoff','Club',
  4,50,'Sean Duffy','duffys@arizona.edu',
  'University of Arizona rugby competes at Division 1-A level with excellent facilities at William David Sitton Field and Rincon Vista Sports Complex.',56544,'["Business", "Engineering", "Social Sciences", "Communications"]',
  'Hot summers, mild winters.','[{"month": "Jan", "hF": 66, "lF": 40, "hC": 19, "lC": 4}, {"month": "Feb", "hF": 70, "lF": 43, "hC": 21, "lC": 6}, {"month": "Mar", "hF": 76, "lF": 48, "hC": 24, "lC": 9}, {"month": "Apr", "hF": 84, "lF": 55, "hC": 29, "lC": 13}, {"month": "May", "hF": 94, "lF": 64, "hC": 34, "lC": 18}, {"month": "Jun", "hF": 103, "lF": 73, "hC": 39, "lC": 23}, {"month": "Jul", "hF": 106, "lF": 79, "hC": 41, "lC": 26}, {"month": "Aug", "hF": 104, "lF": 77, "hC": 40, "lC": 25}, {"month": "Sep", "hF": 99, "lF": 71, "hC": 37, "lC": 22}, {"month": "Oct", "hF": 87, "lF": 58, "hC": 31, "lC": 14}, {"month": "Nov", "hF": 75, "lF": 46, "hC": 24, "lC": 8}, {"month": "Dec", "hF": 66, "lF": 40, "hC": 19, "lC": 4}]',
  '["4 MLR Draft Picks"]','["PAC Rugby Conference Championships", "Division 1-A National Tournament appearances"]',
  'https://www.arizona.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'pennsylvania-state-university','Pennsylvania State University','University Park, Pennsylvania','Pennsylvania','northeast',
  40.7982,-77.8599,792.7,223.8,
  'CRAA D1A','Rugby East','playoff','Club',
  4,41,'Justin Hundley','JHundley@psu.edu',
  'Penn State Rugby, founded in 1962, is one of the most successful collegiate rugby programs in the United States with over 1,600 alumni network members.',49400,'["Engineering", "Business", "Liberal Arts", "Agriculture"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 35, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 39, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 60, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Sep", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 62, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 50, "lF": 34, "hC": 10, "lC": 1}, {"month": "Dec", "hF": 39, "lF": 26, "hC": 4, "lC": -3}]',
  '["4 MLR Draft Picks"]','["Multiple National Championships", "Big Ten Conference Titles", "National Tournament appearances"]',
  'https://www.psu.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'dartmouth-college','Dartmouth College','Hanover, New Hampshire','New Hampshire','northeast',
  43.7044,-72.2887,867.7,140,
  'NCR D1','Liberty','playoff','Club',
  0,0,'','',
  'Dartmouth features the premier Corey Ford Rugby Clubhouse, one of the crown jewels of college rugby facilities, with the men''s team winning the 2019 D1-AA Spring Championship.',6870,'["Economics", "Government", "Psychology", "Engineering"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 28, "lF": 8, "hC": -2, "lC": -13}, {"month": "Feb", "hF": 32, "lF": 11, "hC": 0, "lC": -12}, {"month": "Mar", "hF": 42, "lF": 21, "hC": 6, "lC": -6}, {"month": "Apr", "hF": 56, "lF": 33, "hC": 13, "lC": 1}, {"month": "May", "hF": 68, "lF": 44, "hC": 20, "lC": 7}, {"month": "Jun", "hF": 77, "lF": 53, "hC": 25, "lC": 12}, {"month": "Jul", "hF": 81, "lF": 58, "hC": 27, "lC": 14}, {"month": "Aug", "hF": 79, "lF": 56, "hC": 26, "lC": 13}, {"month": "Sep", "hF": 71, "lF": 47, "hC": 22, "lC": 8}, {"month": "Oct", "hF": 59, "lF": 36, "hC": 15, "lC": 2}, {"month": "Nov", "hF": 46, "lF": 26, "hC": 8, "lC": -3}, {"month": "Dec", "hF": 33, "lF": 14, "hC": 1, "lC": -10}]',
  '[]','["2019 D1-AA Spring Championship", "Ivy Rugby Conference titles"]',
  'https://www.dartmouth.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'california-polytechnic-state-university','California Polytechnic State University','San Luis Obispo, California','California','west',
  35.305,-120.6625,49.6,319.1,
  'CRAA D1A','California','playoff','Club',
  1,27,'Chris O''Brien','',
  'Cal Poly Rugby is one of the premiere rugby programs on the West Coast with excellent facilities and has brought home 18 National Championships across all club sports.',22186,'["Engineering", "Agriculture", "Architecture", "Business"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "Feb", "hF": 65, "lF": 45, "hC": 18, "lC": 7}, {"month": "Mar", "hF": 67, "lF": 47, "hC": 19, "lC": 8}, {"month": "Apr", "hF": 70, "lF": 49, "hC": 21, "lC": 9}, {"month": "May", "hF": 72, "lF": 53, "hC": 22, "lC": 12}, {"month": "Jun", "hF": 75, "lF": 57, "hC": 24, "lC": 14}, {"month": "Jul", "hF": 77, "lF": 59, "hC": 25, "lC": 15}, {"month": "Aug", "hF": 78, "lF": 60, "hC": 26, "lC": 16}, {"month": "Sep", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 74, "lF": 53, "hC": 23, "lC": 12}, {"month": "Nov", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Dec", "hF": 64, "lF": 43, "hC": 18, "lC": 6}]',
  '[]','["PAC Rugby Conference titles", "West Coast rugby excellence"]',
  'https://www.calpoly.edu','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'st-bonaventure-university','St. Bonaventure University','Allegany, New York','New York','northeast',
  42.0776,-78.4733,777.3,197.4,
  'NCR D1','ARC','championship','Varsity',
  4,71,'Tui Osbourne','atosborne@sbu.edu',
  'St. Bonaventure features one of the nation''s premier rugby programs, with the women''s team winning the 2023 national small-college NCR 15s championship.',3018,'["Business", "Journalism", "Education", "Liberal Arts"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 32, "lF": 17, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 35, "lF": 19, "hC": 2, "lC": -7}, {"month": "Mar", "hF": 44, "lF": 27, "hC": 7, "lC": -3}, {"month": "Apr", "hF": 57, "lF": 37, "hC": 14, "lC": 3}, {"month": "May", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Jun", "hF": 77, "lF": 57, "hC": 25, "lC": 14}, {"month": "Jul", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Aug", "hF": 78, "lF": 59, "hC": 26, "lC": 15}, {"month": "Sep", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Oct", "hF": 60, "lF": 41, "hC": 16, "lC": 5}, {"month": "Nov", "hF": 47, "lF": 32, "hC": 8, "lC": 0}, {"month": "Dec", "hF": 36, "lF": 23, "hC": 2, "lC": -5}]',
  '["4 MLR Draft Picks", "2025 NCR D1 National Champions"]','["2023 NCR 15s National Champions", "D1 promotion", "100+ rugby players"]',
  'https://www.sbu.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'arkansas-state-university','Arkansas State University','Jonesboro, Arkansas','Arkansas','south',
  35.8424,-90.6782,585.8,361.8,
  'CRAA D1A','Midwest','playoff','Club',
  4,33,'Dominic Shaw','dshaw@astate.edu',
  'Arkansas State Red Wolves rugby won USA Rugby 7s National Championships in 2012 and 2013, plus a D-1A 15''s National Championship appearance.',17926,'["Business", "Engineering", "Agriculture", "Education"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 49, "lF": 29, "hC": 9, "lC": -2}, {"month": "Feb", "hF": 55, "lF": 34, "hC": 13, "lC": 1}, {"month": "Mar", "hF": 65, "lF": 43, "hC": 18, "lC": 6}, {"month": "Apr", "hF": 75, "lF": 52, "hC": 24, "lC": 11}, {"month": "May", "hF": 83, "lF": 62, "hC": 28, "lC": 17}, {"month": "Jun", "hF": 90, "lF": 70, "hC": 32, "lC": 21}, {"month": "Jul", "hF": 93, "lF": 74, "hC": 34, "lC": 23}, {"month": "Aug", "hF": 92, "lF": 72, "hC": 33, "lC": 22}, {"month": "Sep", "hF": 86, "lF": 64, "hC": 30, "lC": 18}, {"month": "Oct", "hF": 76, "lF": 52, "hC": 24, "lC": 11}, {"month": "Nov", "hF": 63, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 52, "lF": 32, "hC": 11, "lC": 0}]',
  '["4 MLR Draft Picks"]','["2012, 2013 USA Rugby 7s National Champions", "D1A National Championship appearance"]',
  'https://www.astate.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'grand-canyon-university','Grand Canyon University','Phoenix, Arizona','Arizona','west',
  33.5118,-112.13,193.4,391.7,
  'CRAA D1A','Independent','playoff','Club',
  1,24,'Sean O''Leary','sean.oleary@gcu.edu',
  'GCU has both men''s and women''s rugby teams competing in D1A with men''s team advancing to CRAA Challenger Cup finals and modern athletic facilities.',25000,'["Business", "Education", "Nursing", "Liberal Arts"]',
  'Hot summers, mild winters.','[{"month": "Jan", "hF": 67, "lF": 45, "hC": 19, "lC": 7}, {"month": "Feb", "hF": 71, "lF": 49, "hC": 22, "lC": 9}, {"month": "Mar", "hF": 77, "lF": 54, "hC": 25, "lC": 12}, {"month": "Apr", "hF": 85, "lF": 61, "hC": 29, "lC": 16}, {"month": "May", "hF": 95, "lF": 70, "hC": 35, "lC": 21}, {"month": "Jun", "hF": 104, "lF": 79, "hC": 40, "lC": 26}, {"month": "Jul", "hF": 107, "lF": 84, "hC": 42, "lC": 29}, {"month": "Aug", "hF": 105, "lF": 83, "hC": 41, "lC": 28}, {"month": "Sep", "hF": 100, "lF": 77, "hC": 38, "lC": 25}, {"month": "Oct", "hF": 89, "lF": 65, "hC": 32, "lC": 18}, {"month": "Nov", "hF": 76, "lF": 53, "hC": 24, "lC": 12}, {"month": "Dec", "hF": 67, "lF": 44, "hC": 19, "lC": 7}]',
  '[]','["CRAA Challenger Cup finals", "Defeated Utah State 72-6 in semifinals"]',
  'https://www.gcu.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-mary-washington','University of Mary Washington','Fredericksburg, Virginia','Virginia','northeast',
  38.3018,-77.464,810.1,277.7,
  'CRAA D1A','Rugby East','playoff','Club',
  1,59,'Charbel Medlej','cmedlej@umw.edu',
  'Mary Washington features championship-level rugby with the women''s team winning the 2014 USA Rugby Division II National Championship and men''s team claiming 2017 USA Rugby D1AA Fall Championship.',3980,'["Liberal Arts", "Business", "Education", "Psychology"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 47, "lF": 27, "hC": 8, "lC": -3}, {"month": "Feb", "hF": 52, "lF": 30, "hC": 11, "lC": -1}, {"month": "Mar", "hF": 61, "lF": 38, "hC": 16, "lC": 3}, {"month": "Apr", "hF": 72, "lF": 47, "hC": 22, "lC": 8}, {"month": "May", "hF": 80, "lF": 57, "hC": 27, "lC": 14}, {"month": "Jun", "hF": 87, "lF": 66, "hC": 31, "lC": 19}, {"month": "Jul", "hF": 90, "lF": 71, "hC": 32, "lC": 22}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Oct", "hF": 72, "lF": 50, "hC": 22, "lC": 10}, {"month": "Nov", "hF": 62, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 51, "lF": 31, "hC": 11, "lC": -1}]',
  '[]','["2014 Women''s D2 National Champions", "2017 Men''s D1AA Fall Champions", "Leicester Tigers partnership"]',
  'https://www.umw.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'queens-university-of-charlotte','Queens University of Charlotte','Charlotte, North Carolina','North Carolina','south',
  35.2019,-80.8414,763.5,357.1,
  'NCR D1','ARC','championship','Varsity',
  3,49,'Frank McKinney','mckinneyf@queens.edu',
  'Queens University features strong rugby programs with excellent facilities at their 65-acre sports complex, currently transitioning to NCAA Division I athletics.',1900,'["Business", "Health Sciences", "Communications", "Education"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Feb", "hF": 57, "lF": 36, "hC": 14, "lC": 2}, {"month": "Mar", "hF": 66, "lF": 44, "hC": 19, "lC": 7}, {"month": "Apr", "hF": 75, "lF": 52, "hC": 24, "lC": 11}, {"month": "May", "hF": 82, "lF": 61, "hC": 28, "lC": 16}, {"month": "Jun", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Jul", "hF": 90, "lF": 73, "hC": 32, "lC": 23}, {"month": "Aug", "hF": 89, "lF": 72, "hC": 32, "lC": 22}, {"month": "Sep", "hF": 84, "lF": 66, "hC": 29, "lC": 19}, {"month": "Oct", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Nov", "hF": 66, "lF": 43, "hC": 19, "lC": 6}, {"month": "Dec", "hF": 56, "lF": 36, "hC": 13, "lC": 2}]',
  '["3 MLR Draft Picks", "2025 NCR D1 Finalists"]','["Regional championships", "NCAA D1 transition program"]',
  'https://www.queens.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-notre-dame','University of Notre Dame','Notre Dame, Indiana','Indiana','midwest',
  41.7001,-86.2379,651.7,224.1,
  'NCR D1','Big Ten','competitive','Club',
  0,0,'','',
  'Notre Dame features Stinson Rugby Field, one of the premier rugby facilities in America with World Rugby sanctioned artificial turf, home to the oldest collegiate rugby club in the Midwest.',8982,'["Engineering", "Business", "Liberal Arts", "Science"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 33, "lF": 18, "hC": 1, "lC": -8}, {"month": "Feb", "hF": 38, "lF": 22, "hC": 3, "lC": -6}, {"month": "Mar", "hF": 49, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "May", "hF": 72, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Jul", "hF": 84, "lF": 66, "hC": 29, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 76, "lF": 57, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 50, "lF": 35, "hC": 10, "lC": 2}, {"month": "Dec", "hF": 37, "lF": 24, "hC": 3, "lC": -4}]',
  '[]','["ESPN coverage", "Penn Mutual College Rugby 7s appearances", "Midwest rugby leadership"]',
  'https://www.nd.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'the-ohio-state-university','The Ohio State University','Columbus, Ohio','Ohio','midwest',
  40.0067,-83.0305,709.6,255.6,
  'CRAA D1A','Big Ten','playoff','Club',
  0,0,'','',
  'Ohio State rugby features two full-sized fields with lights and scoreboards, competing in the Big Ten Rugby Conference and producing multiple All-Americans and national team players.',67255,'["Engineering", "Business", "Arts and Sciences", "Medicine"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 41, "lF": 25, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 34, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 27, "hC": 5, "lC": -3}]',
  '["2025 Big Ten Champions"]','["Big Ten Rugby Conference", "Multiple All-Americans", "Eagle players produced"]',
  'https://www.osu.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'davenport-university','Davenport University','Grand Rapids, Michigan','Michigan','midwest',
  42.8884,-85.4861,661.1,196.2,
  'CRAA D1A','Midwest','playoff','Varsity',
  1,37,'Dustin Steedman','dustin.steedman@davenport.edu',
  'Davenport University Panthers rugby achieved back-to-back Division 1AA National Championships in 2010/11 and 2011/12, featuring excellent facilities and strong program tradition.',4069,'["Business Administration", "Accounting", "Nursing", "Marketing"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 32, "lF": 18, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Mar", "hF": 47, "lF": 30, "hC": 8, "lC": -1}, {"month": "Apr", "hF": 60, "lF": 40, "hC": 16, "lC": 4}, {"month": "May", "hF": 71, "lF": 50, "hC": 22, "lC": 10}, {"month": "Jun", "hF": 80, "lF": 60, "hC": 27, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Sep", "hF": 75, "lF": 55, "hC": 24, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 49, "lF": 34, "hC": 9, "lC": 1}, {"month": "Dec", "hF": 36, "lF": 24, "hC": 2, "lC": -4}]',
  '["Rugby Scholarships Available"]','["2010/11 D1AA National Champions", "2011/12 D1AA National Champions"]',
  'https://www.davenport.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'marian-university','Marian University','Indianapolis, Indiana','Indiana','midwest',
  39.8014,-86.1928,656.8,266.6,
  'NCR D1','Big Rivers','playoff','Varsity',
  0,0,'','',
  'Marian University Knights rugby program competes at the varsity level with excellent facilities and strong recruiting focus, part of their comprehensive 25+ sport athletic program.',4245,'["Nursing", "Business", "Education", "Osteopathic Medicine"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 36, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 41, "lF": 24, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "May", "hF": 74, "lF": 53, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 57, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Nov", "hF": 53, "lF": 35, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 25, "hC": 4, "lC": -4}]',
  '[]','["New varsity program", "NAIA competition", "Strong recruiting"]',
  'https://www.marian.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-michigan','University of Michigan','Ann Arbor, Michigan','Michigan','midwest',
  42.278,-83.7382,691.1,206.4,
  'NCR D1','Big Ten','competitive','Club',
  0,0,'','',
  'Michigan Wolverines rugby competes in the Big Ten Conference at D1A level with excellent facilities at Mitchell Field, welcoming players of all experience levels.',52000,'["Engineering", "Business", "Liberal Arts", "Medicine"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 32, "lF": 18, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Mar", "hF": 47, "lF": 30, "hC": 8, "lC": -1}, {"month": "Apr", "hF": 60, "lF": 40, "hC": 16, "lC": 4}, {"month": "May", "hF": 72, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 81, "lF": 61, "hC": 27, "lC": 16}, {"month": "Jul", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Aug", "hF": 82, "lF": 63, "hC": 28, "lC": 17}, {"month": "Sep", "hF": 75, "lF": 55, "hC": 24, "lC": 13}, {"month": "Oct", "hF": 62, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 48, "lF": 33, "hC": 9, "lC": 1}, {"month": "Dec", "hF": 36, "lF": 23, "hC": 2, "lC": -5}]',
  '[]','["Big Ten Conference rugby", "D1A competition", "Long rugby tradition"]',
  'https://www.umich.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'indiana-university','Indiana University','Bloomington, Indiana','Indiana','midwest',
  39.1758,-86.512,652.8,281.2,
  'NCR D1','Big Ten','competitive','Club',
  2,73,'Luke Gross','coachgrossusa@gmail.com',
  'Indiana Hoosiers rugby features a championship program with 7x Big Ten 15''s Championships, competing in NCR with excellent facilities and strong tradition.',48424,'["Business", "Communications", "Liberal Arts", "Public Affairs"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 42, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 53, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 65, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 68, "hC": 31, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 66, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 79, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 67, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 26, "hC": 5, "lC": -3}]',
  '["2 MLR Draft Picks"]','["7x Big Ten 15''s Champions", "NCR competition", "Strong rugby tradition"]',
  'https://www.indiana.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-st-thomas-minnesota','University of St. Thomas (Minnesota)','Saint Paul, Minnesota','Minnesota','midwest',
  44.9423,-93.1871,534.8,159,
  'CRAA D1A','Midwest','playoff','Club',
  0,0,'','',
  'St. Thomas Tommies rugby competes as a Division I club sport with excellent athletic facilities at the Anderson Athletic and Recreation Center in the Twin Cities metro area.',9347,'["Business", "Engineering", "Education", "Liberal Arts"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 25, "lF": 9, "hC": -4, "lC": -13}, {"month": "Feb", "hF": 30, "lF": 14, "hC": -1, "lC": -10}, {"month": "Mar", "hF": 42, "lF": 26, "hC": 6, "lC": -3}, {"month": "Apr", "hF": 58, "lF": 38, "hC": 14, "lC": 3}, {"month": "May", "hF": 70, "lF": 50, "hC": 21, "lC": 10}, {"month": "Jun", "hF": 79, "lF": 60, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 65, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 81, "lF": 63, "hC": 27, "lC": 17}, {"month": "Sep", "hF": 72, "lF": 53, "hC": 22, "lC": 12}, {"month": "Oct", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "Nov", "hF": 42, "lF": 28, "hC": 6, "lC": -2}, {"month": "Dec", "hF": 28, "lF": 15, "hC": -2, "lC": -9}]',
  '[]','["Division I club sport", "Twin Cities rugby", "Strong recruiting"]',
  'https://www.stthomas.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'wheeling-university','Wheeling University','Wheeling, West Virginia','West Virginia','east',
  40.064,-80.6907,748.6,248.4,
  'NCR D1','ARC','playoff','Varsity',
  0,27,'Michael Geibel','',
  'Wheeling Cardinals rugby is a premier varsity program competing at Division 1-A level in Rugby East, providing scholarships and featuring the 2024 National Champions in 7s rugby.',1500,'["Business", "Kinesiology", "Nursing", "Education"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 38, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 43, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "May", "hF": 73, "lF": 52, "hC": 23, "lC": 11}, {"month": "Jun", "hF": 81, "lF": 61, "hC": 27, "lC": 16}, {"month": "Jul", "hF": 85, "lF": 65, "hC": 29, "lC": 18}, {"month": "Aug", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 77, "lF": 57, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '["Rugby Scholarships Available"]','["2024 National Champions 7s", "Rugby East D1A", "Unbeaten 2024 season"]',
  'https://wheeling.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'southern-nazarene-university','Southern Nazarene University','Bethany, Oklahoma','Oklahoma','south',
  35.5175,-97.6114,461.3,371.6,
  'NCR D1','Big Rivers','competitive','Varsity',
  0,0,'','',
  'Southern Nazarene Crimson Storm rugby features one of the nation''s best men''s and women''s programs with dedicated SNU Rugby Pitch facilities in the Oklahoma City metro area.',2500,'["Business", "Education", "Ministry", "Nursing"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 49, "lF": 28, "hC": 9, "lC": -2}, {"month": "Feb", "hF": 55, "lF": 33, "hC": 13, "lC": 1}, {"month": "Mar", "hF": 64, "lF": 42, "hC": 18, "lC": 6}, {"month": "Apr", "hF": 73, "lF": 51, "hC": 23, "lC": 11}, {"month": "May", "hF": 81, "lF": 60, "hC": 27, "lC": 16}, {"month": "Jun", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Jul", "hF": 93, "lF": 73, "hC": 34, "lC": 23}, {"month": "Aug", "hF": 92, "lF": 72, "hC": 33, "lC": 22}, {"month": "Sep", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Oct", "hF": 74, "lF": 52, "hC": 23, "lC": 11}, {"month": "Nov", "hF": 61, "lF": 40, "hC": 16, "lC": 4}, {"month": "Dec", "hF": 51, "lF": 31, "hC": 11, "lC": -1}]',
  '[]','["Nationally ranked program", "Strong men''s and women''s teams", "D1 competition"]',
  'https://www.snu.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'mckendree-university','McKendree University','Lebanon, Illinois','Illinois','midwest',
  38.6037,-89.7276,598.7,298.6,
  'CRAA D1A','Midwest','competitive','Varsity',
  0,45,'Cameron Wyper','',
  'McKendree University is a small private school 25 miles east of St. Louis where rugby is a fully funded varsity sport — one of the few in the country. Head Coach Cameron Wyper, a former Scotland 7s international, has built a roster with strong international representation from Ireland, the UK, and Australia. With genuine rugby scholarships and a small-school feel, McKendree is a popular pathway for overseas players entering American college rugby.',2300,'["Nursing", "Business", "Education", "Computer Science"]',
  'Warm summers, cold winters with snow.','[{"month": "Jan", "hF": 39, "lF": 22, "hC": 4, "lC": -6}, {"month": "Feb", "hF": 45, "lF": 27, "hC": 7, "lC": -3}, {"month": "Mar", "hF": 56, "lF": 37, "hC": 13, "lC": 3}, {"month": "Apr", "hF": 68, "lF": 48, "hC": 20, "lC": 9}, {"month": "May", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Jun", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Jul", "hF": 89, "lF": 71, "hC": 32, "lC": 22}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Oct", "hF": 69, "lF": 49, "hC": 21, "lC": 9}, {"month": "Nov", "hF": 55, "lF": 38, "hC": 13, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 26, "hC": 6, "lC": -3}]',
  '["Rugby Scholarships Available"]','[]',
  'https://www.mckendree.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'santa-clara-university','Santa Clara University','Santa Clara, California','California','west',
  37.3496,-121.939,39.8,268.6,
  'CRAA D1A','California','playoff','Club',
  0,40,'','',
  'Santa Clara University combines a top-tier private education in the heart of Silicon Valley with a rapidly rising rugby program. The Broncos capped the 2025-26 season by winning the D1A Challenger Cup, announcing themselves as one of the fastest-improving programs on the West Coast. Mild Bay Area weather means rugby all year round.',5800,'["Business", "Engineering", "Computer Science", "Communication"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 59, "lF": 42, "hC": 15, "lC": 6}, {"month": "Feb", "hF": 62, "lF": 44, "hC": 17, "lC": 7}, {"month": "Mar", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Apr", "hF": 70, "lF": 48, "hC": 21, "lC": 9}, {"month": "May", "hF": 74, "lF": 51, "hC": 23, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 55, "hC": 26, "lC": 13}, {"month": "Jul", "hF": 81, "lF": 57, "hC": 27, "lC": 14}, {"month": "Aug", "hF": 81, "lF": 57, "hC": 27, "lC": 14}, {"month": "Sep", "hF": 80, "lF": 56, "hC": 27, "lC": 13}, {"month": "Oct", "hF": 74, "lF": 51, "hC": 23, "lC": 11}, {"month": "Nov", "hF": 65, "lF": 45, "hC": 18, "lC": 7}, {"month": "Dec", "hF": 58, "lF": 41, "hC": 14, "lC": 5}]',
  '["2026 Challenger Cup Champions"]','[]',
  'https://www.scu.edu','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-san-diego','University of San Diego','San Diego, California','California','west',
  32.7717,-117.1874,98,389.7,
  'CRAA D1A','California','playoff','Club',
  0,38,'','',
  'The University of San Diego made the jump to D1A and immediately reached the national playoffs, validating one of the most successful divisional moves in recent college rugby. A private university on a stunning Spanish Renaissance campus overlooking the Pacific, USD offers arguably the best year-round rugby climate in the country.',5700,'["Business", "Engineering", "Biology", "Political Science"]',
  'Warm, dry and sunny virtually all year.','[{"month": "Jan", "hF": 65, "lF": 50, "hC": 18, "lC": 10}, {"month": "Feb", "hF": 65, "lF": 51, "hC": 18, "lC": 11}, {"month": "Mar", "hF": 66, "lF": 53, "hC": 19, "lC": 12}, {"month": "Apr", "hF": 68, "lF": 56, "hC": 20, "lC": 13}, {"month": "May", "hF": 69, "lF": 59, "hC": 21, "lC": 15}, {"month": "Jun", "hF": 72, "lF": 62, "hC": 22, "lC": 17}, {"month": "Jul", "hF": 76, "lF": 66, "hC": 24, "lC": 19}, {"month": "Aug", "hF": 78, "lF": 67, "hC": 26, "lC": 19}, {"month": "Sep", "hF": 77, "lF": 65, "hC": 25, "lC": 18}, {"month": "Oct", "hF": 74, "lF": 60, "hC": 23, "lC": 16}, {"month": "Nov", "hF": 70, "lF": 54, "hC": 21, "lC": 12}, {"month": "Dec", "hF": 65, "lF": 49, "hC": 18, "lC": 9}]',
  '[]','[]',
  'https://www.sandiego.edu','https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-utah','University of Utah','Salt Lake City, Utah','Utah','west',
  40.7649,-111.8421,225.8,231.4,
  'CRAA D1A','Rocky Mountain','playoff','Club',
  0,42,'','',
  'The University of Utah competes in D1A and entered the 2026 postseason as a Challenger Cup #1 seed. A major public research university at the foot of the Wasatch Mountains, Utah offers big-school resources, a large student body, and world-class skiing an hour from campus — a genuine draw for international student-athletes.',26000,'["Business", "Engineering", "Health Sciences", "Communication"]',
  'Hot, dry summers and cold, snowy winters.','[{"month": "Jan", "hF": 38, "lF": 23, "hC": 3, "lC": -5}, {"month": "Feb", "hF": 44, "lF": 27, "hC": 7, "lC": -3}, {"month": "Mar", "hF": 54, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 62, "lF": 40, "hC": 17, "lC": 4}, {"month": "May", "hF": 72, "lF": 48, "hC": 22, "lC": 9}, {"month": "Jun", "hF": 84, "lF": 57, "hC": 29, "lC": 14}, {"month": "Jul", "hF": 93, "lF": 65, "hC": 34, "lC": 18}, {"month": "Aug", "hF": 91, "lF": 63, "hC": 33, "lC": 17}, {"month": "Sep", "hF": 80, "lF": 53, "hC": 27, "lC": 12}, {"month": "Oct", "hF": 65, "lF": 41, "hC": 18, "lC": 5}, {"month": "Nov", "hF": 50, "lF": 31, "hC": 10, "lC": -1}, {"month": "Dec", "hF": 39, "lF": 24, "hC": 4, "lC": -4}]',
  '[]','[]',
  'https://www.utah.edu','https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'walsh-university','Walsh University','North Canton, Ohio','Ohio','midwest',
  40.8767,-81.3865,734.2,232.2,
  'NCR D1','ARC','playoff','Varsity',
  2,50,'','',
  'When Notre Dame College closed its doors in 2024, its championship-winning rugby program — the 2023 NCR D1 national champions — transferred to Walsh University in nearby North Canton. Walsh inherited that culture and much of its roster, immediately becoming a top NCR D1 contender in the ARC. Rugby is a varsity sport at Walsh with scholarship support, making it one of the most direct pathways into high-level American college rugby.',1900,'["Nursing", "Business", "Education", "Exercise Science"]',
  'Warm summers, cold winters with lake-effect snow.','[{"month": "Jan", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 41, "lF": 25, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 34, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 27, "hC": 5, "lC": -3}]',
  '["2 MLR Draft Picks", "Rugby Scholarships Available", "2023 NCR D1 Champions (as Notre Dame College)"]','[]',
  'https://www.walsh.edu','https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'siena-college','Siena College','Loudonville, New York','New York','northeast',
  42.7184,-73.754,850,167.2,
  'NCR D1','Liberty','playoff','Club',
  0,40,'Greg Matthew','gmatthew@siena.edu',
  'Siena College is a private Franciscan liberal arts school just outside Albany, New York, and a consistent NCR D1 playoff program in the Liberty Conference. The Saints made deep playoff runs in recent seasons and offer a close-knit campus community with competitive rugby in the Northeast corridor.',3497,'["Business", "Biology", "Psychology", "Finance"]',
  'Warm summers, cold snowy winters.','[{"month": "Jan", "hF": 32, "lF": 17, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 35, "lF": 19, "hC": 2, "lC": -7}, {"month": "Mar", "hF": 44, "lF": 27, "hC": 7, "lC": -3}, {"month": "Apr", "hF": 57, "lF": 37, "hC": 14, "lC": 3}, {"month": "May", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Jun", "hF": 77, "lF": 57, "hC": 25, "lC": 14}, {"month": "Jul", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Aug", "hF": 78, "lF": 59, "hC": 26, "lC": 15}, {"month": "Sep", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Oct", "hF": 60, "lF": 41, "hC": 16, "lC": 5}, {"month": "Nov", "hF": 47, "lF": 32, "hC": 8, "lC": 0}, {"month": "Dec", "hF": 36, "lF": 23, "hC": 2, "lC": -5}]',
  '[]','[]',
  'https://www.siena.edu','https://images.unsplash.com/photo-1567168539593-59673ababaae?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'kutztown-university','Kutztown University','Kutztown, Pennsylvania','Pennsylvania','northeast',
  40.5107,-75.7846,828.2,223.1,
  'NCR D1','ARC','playoff','Club',
  7,48,'Gregg Jones','gjones@kutztown.edu',
  'Kutztown University is one of the proven producers of professional rugby talent in the American college game, with seven MLR draft picks to its name. A public university in eastern Pennsylvania competing in the ARC, Kutztown pairs affordable public-school tuition with a hard-nosed rugby program that consistently develops players for the next level.',6431,'["Education", "Business", "Criminal Justice", "Psychology"]',
  'Warm summers, cold winters with snow.','[{"month": "Jan", "hF": 35, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 39, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 60, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Sep", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 62, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 50, "lF": 34, "hC": 10, "lC": 1}, {"month": "Dec", "hF": 39, "lF": 26, "hC": 4, "lC": -3}]',
  '["7 MLR Draft Picks"]','[]',
  'https://www.kutztown.edu','https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'belmont-abbey-college','Belmont Abbey College','Belmont, North Carolina','North Carolina','southeast',
  35.2482,-81.0403,759.8,356.6,
  'NCR D1','ARC','competitive','Club',
  0,53,'Genaro Fessia','genarofessia@bac.edu',
  'Belmont Abbey College is a small Catholic liberal arts school just west of Charlotte with one of the fastest-rising programs in NCR D1. Under Head Coach Genaro Fessia, an Argentine international, the Crusaders climbed the national rankings and now compete in the tough ARC. Small classes, southern weather, and serious rugby.',1473,'["Business", "Sport Management", "Biology", "Theology"]',
  'Hot summers, mild winters.','[{"month": "Jan", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Feb", "hF": 57, "lF": 36, "hC": 14, "lC": 2}, {"month": "Mar", "hF": 66, "lF": 44, "hC": 19, "lC": 7}, {"month": "Apr", "hF": 75, "lF": 52, "hC": 24, "lC": 11}, {"month": "May", "hF": 82, "lF": 61, "hC": 28, "lC": 16}, {"month": "Jun", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Jul", "hF": 90, "lF": 73, "hC": 32, "lC": 23}, {"month": "Aug", "hF": 89, "lF": 72, "hC": 32, "lC": 22}, {"month": "Sep", "hF": 84, "lF": 66, "hC": 29, "lC": 19}, {"month": "Oct", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Nov", "hF": 66, "lF": 43, "hC": 19, "lC": 6}, {"month": "Dec", "hF": 56, "lF": 36, "hC": 13, "lC": 2}]',
  '[]','[]',
  'https://www.belmontabbeycollege.edu','https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'thomas-more-university','Thomas More University','Crestview Hills, Kentucky','Kentucky','midwest',
  39.0284,-84.5877,686.1,280.9,
  'NCR D1','Big Rivers','competitive','Club',
  3,29,'John Fox','foxj@thomasmore.edu',
  'Thomas More University sits just across the river from Cincinnati and competes in NCR D1''s Big Rivers Conference. The Saints have sent three players to the MLR draft and offer a small-school environment with easy access to a major city — a solid fit for players who want game time and development in a competitive conference.',1834,'["Business", "Nursing", "Biology", "Education"]',
  'Hot summers, cold winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 42, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 53, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 65, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 68, "hC": 31, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 66, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 79, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 67, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 26, "hC": 5, "lC": -3}]',
  '["3 MLR Draft Picks"]','[]',
  'https://www.thomasmore.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'iona-university','Iona University','New Rochelle, New York','New York','northeast',
  40.9223,-73.7857,858.8,206.7,
  'NCR D1','Liberty','competitive','Club',
  2,38,'Connor Buckley','cbuckley@iona.edu',
  'Iona University competes in NCR D1''s Liberty Conference from New Rochelle, just north of New York City. With two MLR draft picks and a location that puts Manhattan a short train ride away, Iona offers competitive Northeast rugby with unmatched access to the biggest city in America.',3134,'["Business", "Finance", "Communication", "Criminal Justice"]',
  'Hot summers, cold winters.','[{"month": "Jan", "hF": 35, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 39, "lF": 23, "hC": 4, "lC": -5}, {"month": "Mar", "hF": 48, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 74, "lF": 56, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 51, "lF": 35, "hC": 11, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 26, "hC": 4, "lC": -3}]',
  '["2 MLR Draft Picks"]','[]',
  'https://www.iona.edu','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'fairfield-university','Fairfield University','Fairfield, Connecticut','Connecticut','northeast',
  41.1601,-73.2544,866.2,199.4,
  'NCR D1','Liberty','competitive','Club',
  1,69,'Austin Ryan','aryan3@fairfield.edu',
  'Fairfield University is a private Jesuit school on the Connecticut coast, an hour from New York City, competing in NCR D1''s Liberty Conference. One of the biggest improvers in recent NCR seasons, the Stags run one of the larger club rosters in the division and pair strong academics with a rising rugby culture.',4968,'["Business", "Nursing", "Finance", "Marketing"]',
  'Warm summers, cold winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 40, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "May", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Jun", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 65, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 64, "lF": 47, "hC": 18, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 37, "hC": 12, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '[]','[]',
  'https://www.fairfield.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'western-washington-university','Western Washington University','Bellingham, Washington','Washington','west',
  48.7343,-122.4867,100.7,20.6,
  'CRAA D1A','Independent','competitive','Club',
  0,0,'','',
  'Western Washington University in Bellingham is the Pacific Northwest''s D1A program for 2026–27, stepping into the space left by Central Washington''s discontinued program. A fast-growing club with a strong regional player base, a spectacular campus between the Cascades and the Salish Sea, and a chance to be part of a program on the rise.',14700,'["Business", "Environmental Science", "Education", "Computer Science"]',
  'Mild summers, cool wet winters.','[{"month": "Jan", "hF": 47, "lF": 36, "hC": 8, "lC": 2}, {"month": "Feb", "hF": 50, "lF": 37, "hC": 10, "lC": 3}, {"month": "Mar", "hF": 54, "lF": 39, "hC": 12, "lC": 4}, {"month": "Apr", "hF": 59, "lF": 42, "hC": 15, "lC": 6}, {"month": "May", "hF": 65, "lF": 47, "hC": 18, "lC": 8}, {"month": "Jun", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Jul", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Aug", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Sep", "hF": 69, "lF": 50, "hC": 21, "lC": 10}, {"month": "Oct", "hF": 59, "lF": 44, "hC": 15, "lC": 7}, {"month": "Nov", "hF": 51, "lF": 39, "hC": 11, "lC": 4}, {"month": "Dec", "hF": 46, "lF": 35, "hC": 8, "lC": 2}]',
  '["New to D1A for 2026–27"]','[]',
  'https://www.wwu.edu','https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80','mens')
on conflict (slug) do nothing;

-- ── 2026-27 season updates (safe to re-run) ──
update colleges set affiliation='NCR D1', tier='playoff',
  description='UCLA moved from CRAA D1A to NCR D1 for the 2026–27 season and immediately enters the NCR conversation as a contender. The Bruins play on one of the best rugby fields in the country at Wallis Annenberg Stadium, with live scoreboards and video replay, and have produced four MLR draft picks.'
  where slug='university-of-california-los-angeles-ucla';
delete from colleges where slug='american-international-college';
