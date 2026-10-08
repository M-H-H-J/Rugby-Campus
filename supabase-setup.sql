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
  10,60,'Jack Clark','clarkj@berkeley.edu',
  '33-time National Champions with one of the most successful collegiate rugby programs in the US. Competes at Witter Rugby Field in Strawberry Canyon.',45882,'["Engineering", "Computer Science", "Business", "Biology"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 58, "lF": 45, "hC": 14, "lC": 7}, {"month": "Feb", "hF": 62, "lF": 47, "hC": 17, "lC": 8}, {"month": "Mar", "hF": 65, "lF": 49, "hC": 18, "lC": 9}, {"month": "Apr", "hF": 68, "lF": 51, "hC": 20, "lC": 11}, {"month": "May", "hF": 72, "lF": 54, "hC": 22, "lC": 12}, {"month": "Jun", "hF": 75, "lF": 57, "hC": 24, "lC": 14}, {"month": "Jul", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Aug", "hF": 76, "lF": 59, "hC": 24, "lC": 15}, {"month": "Sep", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 73, "lF": 55, "hC": 23, "lC": 13}, {"month": "Nov", "hF": 65, "lF": 50, "hC": 18, "lC": 10}, {"month": "Dec", "hF": 58, "lF": 45, "hC": 14, "lC": 7}]',
  '["2026 D1A National Champions","Back-to-Back Champions (2025 & 2026)","10 drafted into MLR · 5 played"]','["33-time National Champions", "PAC Rugby Conference Titles"]',
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
  17,44,'Blake Bradford','francis.bradford@life.edu',
  'Life University Running Eagles are 2018 & 2019 back-to-back National Champions with one of the strongest rugby programs in collegiate rugby.',997,'["Chiropractic", "Biology", "Psychology", "Exercise Physiology"]',
  'Warm summers, cool winters.','[{"month": "Jan", "hF": 51, "lF": 31, "hC": 11, "lC": -1}, {"month": "Feb", "hF": 56, "lF": 35, "hC": 13, "lC": 2}, {"month": "Mar", "hF": 64, "lF": 42, "hC": 18, "lC": 6}, {"month": "Apr", "hF": 72, "lF": 49, "hC": 22, "lC": 9}, {"month": "May", "hF": 80, "lF": 58, "hC": 27, "lC": 14}, {"month": "Jun", "hF": 86, "lF": 66, "hC": 30, "lC": 19}, {"month": "Jul", "hF": 88, "lF": 70, "hC": 31, "lC": 21}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Oct", "hF": 73, "lF": 50, "hC": 23, "lC": 10}, {"month": "Nov", "hF": 63, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 53, "lF": 33, "hC": 12, "lC": 1}]',
  '["2026 D1A Semifinalists","Rugby Scholarships Available","17 drafted into MLR · 13 played"]','["2018 & 2019 National Champions", "Multiple Rugby East Championships"]',
  'https://www.life.edu','https://images.unsplash.com/photo-1606800052259-a9b0a9c8c3b0?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'lindenwood-university','Lindenwood University','St. Charles, Missouri','Missouri','midwest',
  38.788,-90.505,585.1,295.3,
  'CRAA D1A','Midwest','championship','Varsity',
  23,96,'Josh Macy','jmacy@lindenwood.edu',
  'Lindenwood University features strong rugby programs with excellent facilities and coaching, competing at the highest collegiate level.',6992,'["Business", "Education", "Communications", "Criminal Justice"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 39, "lF": 22, "hC": 4, "lC": -6}, {"month": "Feb", "hF": 45, "lF": 27, "hC": 7, "lC": -3}, {"month": "Mar", "hF": 56, "lF": 37, "hC": 13, "lC": 3}, {"month": "Apr", "hF": 68, "lF": 48, "hC": 20, "lC": 9}, {"month": "May", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Jun", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Jul", "hF": 89, "lF": 71, "hC": 32, "lC": 22}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Oct", "hF": 69, "lF": 49, "hC": 21, "lC": 9}, {"month": "Nov", "hF": 55, "lF": 38, "hC": 13, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 26, "hC": 6, "lC": -3}]',
  '["Rugby Scholarships Available","23 drafted into MLR · 16 played"]','["Multiple Midwest Conference Championships", "National Tournament appearances"]',
  'https://www.lindenwood.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'saint-mary-s-college-of-california','Saint Mary''s College of California','Moraga, California','California','west',
  37.8448,-122.118,39.8,257,
  'CRAA D1A','California','championship','Club',
  14,0,'Tim O''Brien','',
  'No. 1 Men''s Rugby Team with national championship history and outstanding rugby facilities in the beautiful Bay Area hills.',2775,'["Business", "Liberal Arts", "Education", "Psychology"]',
  'Warm summers, mild winters.','[{"month": "Jan", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "Feb", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Mar", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Apr", "hF": 72, "lF": 50, "hC": 22, "lC": 10}, {"month": "May", "hF": 75, "lF": 53, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 79, "lF": 57, "hC": 26, "lC": 14}, {"month": "Jul", "hF": 82, "lF": 59, "hC": 28, "lC": 15}, {"month": "Aug", "hF": 83, "lF": 60, "hC": 28, "lC": 16}, {"month": "Sep", "hF": 82, "lF": 58, "hC": 28, "lC": 14}, {"month": "Oct", "hF": 77, "lF": 54, "hC": 25, "lC": 12}, {"month": "Nov", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Dec", "hF": 62, "lF": 42, "hC": 17, "lC": 6}]',
  '["2026 D1A Semifinalists","2024 D1A National Champions","14 drafted into MLR · 9 played"]','["2014 National Champions", "Multiple California Conference Championships"]',
  'https://www.stmarys-ca.edu','https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'united-states-military-academy-army','United States Military Academy (Army)','West Point, New York','New York','northeast',
  41.3915,-73.9626,853.5,197.1,
  'CRAA D1A','Rugby East','championship','Varsity',
  2,67,'Matt Sherman','matthew.sherman@westpoint.edu',
  '2022 D1A National Champions with world-class rugby facilities and strong military tradition.',4508,'["Engineering", "Military Leadership", "International Affairs", "Economics"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 35, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 39, "lF": 23, "hC": 4, "lC": -5}, {"month": "Mar", "hF": 48, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 74, "lF": 56, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 51, "lF": 35, "hC": 11, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 26, "hC": 4, "lC": -3}]',
  '["2 drafted into MLR · 2 played"]','["2022 D1A National Champions", "Multiple Rugby East Championships"]',
  'https://www.westpoint.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-california-los-angeles-ucla','University of California, Los Angeles (UCLA)','Los Angeles, California','California','west',
  34.0522,-118.2437,85.5,357.2,
  'NCR D1','Independent','playoff','Club',
  6,54,'Harry Bennett','hbennett@recreation.ucla.edu',
  'UCLA moved from CRAA D1A to NCR D1 for the 2026–27 season and immediately enters the NCR conversation as a contender. The Bruins play on one of the best rugby fields in the country at Wallis Annenberg Stadium, with live scoreboards and video replay, and have had six players drafted in the MLR College Draft (2020–26), three of them confirmed to have played an MLR match.',48651,'["Engineering", "Life Sciences", "Social Sciences", "Psychology"]',
  'Warm summers, mild winters.','[{"month": "Jan", "hF": 68, "lF": 48, "hC": 20, "lC": 9}, {"month": "Feb", "hF": 69, "lF": 50, "hC": 21, "lC": 10}, {"month": "Mar", "hF": 72, "lF": 53, "hC": 22, "lC": 12}, {"month": "Apr", "hF": 75, "lF": 56, "hC": 24, "lC": 13}, {"month": "May", "hF": 77, "lF": 60, "hC": 25, "lC": 16}, {"month": "Jun", "hF": 81, "lF": 64, "hC": 27, "lC": 18}, {"month": "Jul", "hF": 85, "lF": 68, "hC": 29, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 68, "hC": 29, "lC": 20}, {"month": "Sep", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Oct", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Nov", "hF": 73, "lF": 54, "hC": 23, "lC": 12}, {"month": "Dec", "hF": 68, "lF": 48, "hC": 20, "lC": 9}]',
  '["6 drafted into MLR · 3 played"]','["PAC Rugby Conference Championships", "National Tournament appearances"]',
  'https://www.ucla.edu','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'brown-university','Brown University','Providence, Rhode Island','Rhode Island','northeast',
  41.8268,-71.4025,892.3,177.3,
  'NCR D1','Liberty','championship','Club',
  2,56,'David Laflamme','david_laflamme@brown.edu',
  'Brown University features top-tier rugby programs with excellent facilities and coaching. The men''s team won the 2022 Division 1 National Championship.',11700,'["Economics", "Computer Science", "International Relations", "Biology"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 40, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "May", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Jun", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 65, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 64, "lF": 47, "hC": 18, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 37, "hC": 12, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '["2 drafted into MLR · 1 played"]','["2022 D1 National Champions", "Multiple Ivy Rugby Conference titles"]',
  'https://www.brown.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'mount-st-mary-s-university','Mount St. Mary''s University','Emmitsburg, Maryland','Maryland','northeast',
  39.6409,-77.3278,806.6,247.7,
  'CRAA D1A','Rugby East','competitive','Club',
  2,93,'Jay Myles','myles@msmary.edu',
  'Mount St. Mary''s University features strong rugby programs with the men''s team winning the 2016 NSCRO National Championship.',2240,'["Business", "Liberal Arts", "Natural Sciences", "Education"]',
  'Warm summers, cool winters.','[{"month": "Jan", "hF": 40, "lF": 26, "hC": 4, "lC": -3}, {"month": "Feb", "hF": 44, "lF": 28, "hC": 7, "lC": -2}, {"month": "Mar", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Apr", "hF": 64, "lF": 45, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Jun", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 69, "hC": 31, "lC": 21}, {"month": "Aug", "hF": 85, "lF": 67, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 78, "lF": 59, "hC": 26, "lC": 15}, {"month": "Oct", "hF": 67, "lF": 47, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 56, "lF": 37, "hC": 13, "lC": 3}, {"month": "Dec", "hF": 44, "lF": 30, "hC": 7, "lC": -1}]',
  '["2 drafted into MLR · none confirmed played"]','["2016 NSCRO National Champions", "DI-AA Chesapeake Conference titles"]',
  'https://www.msmary.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'brigham-young-university','Brigham Young University','Provo, Utah','Utah','west',
  40.2518,-111.6493,227.1,243.3,
  'CRAA D1A','Rocky Mountain','playoff','Club',
  5,42,'Steve St. Pierre','steven_stpierre@byu.edu',
  'BYU has 5 National Championships (2015, 2014, 2013, 2012 & 2009) with one of the most successful collegiate rugby programs in the nation.',35074,'["Business", "Engineering", "Education", "Life Sciences"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 22, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 43, "lF": 27, "hC": 6, "lC": -3}, {"month": "Mar", "hF": 53, "lF": 35, "hC": 12, "lC": 2}, {"month": "Apr", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "May", "hF": 72, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 82, "lF": 60, "hC": 28, "lC": 16}, {"month": "Jul", "hF": 89, "lF": 67, "hC": 32, "lC": 19}, {"month": "Aug", "hF": 87, "lF": 65, "hC": 31, "lC": 18}, {"month": "Sep", "hF": 77, "lF": 55, "hC": 25, "lC": 13}, {"month": "Oct", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "Nov", "hF": 48, "lF": 32, "hC": 9, "lC": 0}, {"month": "Dec", "hF": 38, "lF": 24, "hC": 3, "lC": -4}]',
  '["5 drafted into MLR · 2 played"]','["5 National Championships", "Multiple Rocky Mountain Conference titles"]',
  'https://www.byu.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-arizona','University of Arizona','Tucson, Arizona','Arizona','west',
  32.2319,-110.9501,210.5,423.7,
  'CRAA D1A','Independent','playoff','Club',
  6,50,'Sean Duffy','duffys@arizona.edu',
  'University of Arizona rugby competes at Division 1-A level with excellent facilities at William David Sitton Field and Rincon Vista Sports Complex.',56544,'["Business", "Engineering", "Social Sciences", "Communications"]',
  'Hot summers, mild winters.','[{"month": "Jan", "hF": 66, "lF": 40, "hC": 19, "lC": 4}, {"month": "Feb", "hF": 70, "lF": 43, "hC": 21, "lC": 6}, {"month": "Mar", "hF": 76, "lF": 48, "hC": 24, "lC": 9}, {"month": "Apr", "hF": 84, "lF": 55, "hC": 29, "lC": 13}, {"month": "May", "hF": 94, "lF": 64, "hC": 34, "lC": 18}, {"month": "Jun", "hF": 103, "lF": 73, "hC": 39, "lC": 23}, {"month": "Jul", "hF": 106, "lF": 79, "hC": 41, "lC": 26}, {"month": "Aug", "hF": 104, "lF": 77, "hC": 40, "lC": 25}, {"month": "Sep", "hF": 99, "lF": 71, "hC": 37, "lC": 22}, {"month": "Oct", "hF": 87, "lF": 58, "hC": 31, "lC": 14}, {"month": "Nov", "hF": 75, "lF": 46, "hC": 24, "lC": 8}, {"month": "Dec", "hF": 66, "lF": 40, "hC": 19, "lC": 4}]',
  '["6 drafted into MLR · 4 played"]','["PAC Rugby Conference Championships", "Division 1-A National Tournament appearances"]',
  'https://www.arizona.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'pennsylvania-state-university','Pennsylvania State University','University Park, Pennsylvania','Pennsylvania','northeast',
  40.7982,-77.8599,792.7,223.8,
  'CRAA D1A','Rugby East','playoff','Club',
  7,41,'Justin Hundley','JHundley@psu.edu',
  'Penn State Rugby, founded in 1962, is one of the most successful collegiate rugby programs in the United States with over 1,600 alumni network members.',49400,'["Engineering", "Business", "Liberal Arts", "Agriculture"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 35, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 39, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 60, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Sep", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 62, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 50, "lF": 34, "hC": 10, "lC": 1}, {"month": "Dec", "hF": 39, "lF": 26, "hC": 4, "lC": -3}]',
  '["7 drafted into MLR · 4 played"]','["Multiple National Championships", "Big Ten Conference Titles", "National Tournament appearances"]',
  'https://www.psu.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'dartmouth-college','Dartmouth College','Hanover, New Hampshire','New Hampshire','northeast',
  43.7044,-72.2887,867.7,140,
  'NCR D1','Liberty','playoff','Club',
  4,0,'','',
  'Dartmouth features the premier Corey Ford Rugby Clubhouse, one of the crown jewels of college rugby facilities, with the men''s team winning the 2019 D1-AA Spring Championship.',6870,'["Economics", "Government", "Psychology", "Engineering"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 28, "lF": 8, "hC": -2, "lC": -13}, {"month": "Feb", "hF": 32, "lF": 11, "hC": 0, "lC": -12}, {"month": "Mar", "hF": 42, "lF": 21, "hC": 6, "lC": -6}, {"month": "Apr", "hF": 56, "lF": 33, "hC": 13, "lC": 1}, {"month": "May", "hF": 68, "lF": 44, "hC": 20, "lC": 7}, {"month": "Jun", "hF": 77, "lF": 53, "hC": 25, "lC": 12}, {"month": "Jul", "hF": 81, "lF": 58, "hC": 27, "lC": 14}, {"month": "Aug", "hF": 79, "lF": 56, "hC": 26, "lC": 13}, {"month": "Sep", "hF": 71, "lF": 47, "hC": 22, "lC": 8}, {"month": "Oct", "hF": 59, "lF": 36, "hC": 15, "lC": 2}, {"month": "Nov", "hF": 46, "lF": 26, "hC": 8, "lC": -3}, {"month": "Dec", "hF": 33, "lF": 14, "hC": 1, "lC": -10}]',
  '["4 drafted into MLR · 3 played"]','["2019 D1-AA Spring Championship", "Ivy Rugby Conference titles"]',
  'https://www.dartmouth.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'california-polytechnic-state-university','California Polytechnic State University','San Luis Obispo, California','California','west',
  35.305,-120.6625,49.6,319.1,
  'CRAA D1A','California','playoff','Club',
  2,27,'Chris O''Brien','',
  'Cal Poly Rugby is one of the premiere rugby programs on the West Coast with excellent facilities and has brought home 18 National Championships across all club sports.',22186,'["Engineering", "Agriculture", "Architecture", "Business"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "Feb", "hF": 65, "lF": 45, "hC": 18, "lC": 7}, {"month": "Mar", "hF": 67, "lF": 47, "hC": 19, "lC": 8}, {"month": "Apr", "hF": 70, "lF": 49, "hC": 21, "lC": 9}, {"month": "May", "hF": 72, "lF": 53, "hC": 22, "lC": 12}, {"month": "Jun", "hF": 75, "lF": 57, "hC": 24, "lC": 14}, {"month": "Jul", "hF": 77, "lF": 59, "hC": 25, "lC": 15}, {"month": "Aug", "hF": 78, "lF": 60, "hC": 26, "lC": 16}, {"month": "Sep", "hF": 77, "lF": 58, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 74, "lF": 53, "hC": 23, "lC": 12}, {"month": "Nov", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Dec", "hF": 64, "lF": 43, "hC": 18, "lC": 6}]',
  '["2 drafted into MLR · 1 played"]','["PAC Rugby Conference titles", "West Coast rugby excellence"]',
  'https://www.calpoly.edu','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'st-bonaventure-university','St. Bonaventure University','Allegany, New York','New York','northeast',
  42.0776,-78.4733,777.3,197.4,
  'NCR D1','ARC','championship','Varsity',
  5,71,'Tui Osbourne','atosborne@sbu.edu',
  'St. Bonaventure features one of the nation''s premier rugby programs, with the women''s team winning the 2023 national small-college NCR 15s championship.',3018,'["Business", "Journalism", "Education", "Liberal Arts"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 32, "lF": 17, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 35, "lF": 19, "hC": 2, "lC": -7}, {"month": "Mar", "hF": 44, "lF": 27, "hC": 7, "lC": -3}, {"month": "Apr", "hF": 57, "lF": 37, "hC": 14, "lC": 3}, {"month": "May", "hF": 69, "lF": 47, "hC": 21, "lC": 8}, {"month": "Jun", "hF": 77, "lF": 57, "hC": 25, "lC": 14}, {"month": "Jul", "hF": 80, "lF": 61, "hC": 27, "lC": 16}, {"month": "Aug", "hF": 78, "lF": 59, "hC": 26, "lC": 15}, {"month": "Sep", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Oct", "hF": 60, "lF": 41, "hC": 16, "lC": 5}, {"month": "Nov", "hF": 47, "lF": 32, "hC": 8, "lC": 0}, {"month": "Dec", "hF": 36, "lF": 23, "hC": 2, "lC": -5}]',
  '["2025 NCR D1 National Champions","5 drafted into MLR · 2 played"]','["2023 NCR 15s National Champions", "D1 promotion", "100+ rugby players"]',
  'https://www.sbu.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'arkansas-state-university','Arkansas State University','Jonesboro, Arkansas','Arkansas','south',
  35.8424,-90.6782,585.8,361.8,
  'CRAA D1A','Midwest','playoff','Club',
  6,33,'Dominic Shaw','dshaw@astate.edu',
  'Arkansas State Red Wolves rugby won USA Rugby 7s National Championships in 2012 and 2013, plus a D-1A 15''s National Championship appearance.',17926,'["Business", "Engineering", "Agriculture", "Education"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 49, "lF": 29, "hC": 9, "lC": -2}, {"month": "Feb", "hF": 55, "lF": 34, "hC": 13, "lC": 1}, {"month": "Mar", "hF": 65, "lF": 43, "hC": 18, "lC": 6}, {"month": "Apr", "hF": 75, "lF": 52, "hC": 24, "lC": 11}, {"month": "May", "hF": 83, "lF": 62, "hC": 28, "lC": 17}, {"month": "Jun", "hF": 90, "lF": 70, "hC": 32, "lC": 21}, {"month": "Jul", "hF": 93, "lF": 74, "hC": 34, "lC": 23}, {"month": "Aug", "hF": 92, "lF": 72, "hC": 33, "lC": 22}, {"month": "Sep", "hF": 86, "lF": 64, "hC": 30, "lC": 18}, {"month": "Oct", "hF": 76, "lF": 52, "hC": 24, "lC": 11}, {"month": "Nov", "hF": 63, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 52, "lF": 32, "hC": 11, "lC": 0}]',
  '["6 drafted into MLR · 3 played"]','["2012, 2013 USA Rugby 7s National Champions", "D1A National Championship appearance"]',
  'https://www.astate.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'grand-canyon-university','Grand Canyon University','Phoenix, Arizona','Arizona','west',
  33.5118,-112.13,193.4,391.7,
  'CRAA D1A','Independent','playoff','Club',
  1,24,'Sean O''Leary','sean.oleary@gcu.edu',
  'GCU has both men''s and women''s rugby teams competing in D1A with men''s team advancing to CRAA Challenger Cup finals and modern athletic facilities.',25000,'["Business", "Education", "Nursing", "Liberal Arts"]',
  'Hot summers, mild winters.','[{"month": "Jan", "hF": 67, "lF": 45, "hC": 19, "lC": 7}, {"month": "Feb", "hF": 71, "lF": 49, "hC": 22, "lC": 9}, {"month": "Mar", "hF": 77, "lF": 54, "hC": 25, "lC": 12}, {"month": "Apr", "hF": 85, "lF": 61, "hC": 29, "lC": 16}, {"month": "May", "hF": 95, "lF": 70, "hC": 35, "lC": 21}, {"month": "Jun", "hF": 104, "lF": 79, "hC": 40, "lC": 26}, {"month": "Jul", "hF": 107, "lF": 84, "hC": 42, "lC": 29}, {"month": "Aug", "hF": 105, "lF": 83, "hC": 41, "lC": 28}, {"month": "Sep", "hF": 100, "lF": 77, "hC": 38, "lC": 25}, {"month": "Oct", "hF": 89, "lF": 65, "hC": 32, "lC": 18}, {"month": "Nov", "hF": 76, "lF": 53, "hC": 24, "lC": 12}, {"month": "Dec", "hF": 67, "lF": 44, "hC": 19, "lC": 7}]',
  '["1 drafted into MLR · 1 played"]','["CRAA Challenger Cup finals", "Defeated Utah State 72-6 in semifinals"]',
  'https://www.gcu.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-mary-washington','University of Mary Washington','Fredericksburg, Virginia','Virginia','northeast',
  38.3018,-77.464,810.1,277.7,
  'CRAA D1A','Rugby East','playoff','Club',
  3,59,'Charbel Medlej','cmedlej@umw.edu',
  'Mary Washington features championship-level rugby with the women''s team winning the 2014 USA Rugby Division II National Championship and men''s team claiming 2017 USA Rugby D1AA Fall Championship.',3980,'["Liberal Arts", "Business", "Education", "Psychology"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 47, "lF": 27, "hC": 8, "lC": -3}, {"month": "Feb", "hF": 52, "lF": 30, "hC": 11, "lC": -1}, {"month": "Mar", "hF": 61, "lF": 38, "hC": 16, "lC": 3}, {"month": "Apr", "hF": 72, "lF": 47, "hC": 22, "lC": 8}, {"month": "May", "hF": 80, "lF": 57, "hC": 27, "lC": 14}, {"month": "Jun", "hF": 87, "lF": 66, "hC": 31, "lC": 19}, {"month": "Jul", "hF": 90, "lF": 71, "hC": 32, "lC": 22}, {"month": "Aug", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Sep", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Oct", "hF": 72, "lF": 50, "hC": 22, "lC": 10}, {"month": "Nov", "hF": 62, "lF": 40, "hC": 17, "lC": 4}, {"month": "Dec", "hF": 51, "lF": 31, "hC": 11, "lC": -1}]',
  '["3 drafted into MLR · 1 played"]','["2014 Women''s D2 National Champions", "2017 Men''s D1AA Fall Champions", "Leicester Tigers partnership"]',
  'https://www.umw.edu','https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'queens-university-of-charlotte','Queens University of Charlotte','Charlotte, North Carolina','North Carolina','south',
  35.2019,-80.8414,763.5,357.1,
  'NCR D1','ARC','championship','Varsity',
  4,49,'Frank McKinney','mckinneyf@queens.edu',
  'Queens University features strong rugby programs with excellent facilities at their 65-acre sports complex, currently transitioning to NCAA Division I athletics.',1900,'["Business", "Health Sciences", "Communications", "Education"]',
  'Hot summers, cool winters.','[{"month": "Jan", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Feb", "hF": 57, "lF": 36, "hC": 14, "lC": 2}, {"month": "Mar", "hF": 66, "lF": 44, "hC": 19, "lC": 7}, {"month": "Apr", "hF": 75, "lF": 52, "hC": 24, "lC": 11}, {"month": "May", "hF": 82, "lF": 61, "hC": 28, "lC": 16}, {"month": "Jun", "hF": 88, "lF": 69, "hC": 31, "lC": 21}, {"month": "Jul", "hF": 90, "lF": 73, "hC": 32, "lC": 23}, {"month": "Aug", "hF": 89, "lF": 72, "hC": 32, "lC": 22}, {"month": "Sep", "hF": 84, "lF": 66, "hC": 29, "lC": 19}, {"month": "Oct", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Nov", "hF": 66, "lF": 43, "hC": 19, "lC": 6}, {"month": "Dec", "hF": 56, "lF": 36, "hC": 13, "lC": 2}]',
  '["2025 NCR D1 Finalists","4 drafted into MLR · none confirmed played"]','["Regional championships", "NCAA D1 transition program"]',
  'https://www.queens.edu','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-notre-dame','University of Notre Dame','Notre Dame, Indiana','Indiana','midwest',
  41.7001,-86.2379,651.7,224.1,
  'NCR D1','Big Ten','competitive','Club',
  1,0,'','',
  'Notre Dame features Stinson Rugby Field, one of the premier rugby facilities in America with World Rugby sanctioned artificial turf, home to the oldest collegiate rugby club in the Midwest.',8982,'["Engineering", "Business", "Liberal Arts", "Science"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 33, "lF": 18, "hC": 1, "lC": -8}, {"month": "Feb", "hF": 38, "lF": 22, "hC": 3, "lC": -6}, {"month": "Mar", "hF": 49, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 62, "lF": 42, "hC": 17, "lC": 6}, {"month": "May", "hF": 72, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Jul", "hF": 84, "lF": 66, "hC": 29, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 76, "lF": 57, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 50, "lF": 35, "hC": 10, "lC": 2}, {"month": "Dec", "hF": 37, "lF": 24, "hC": 3, "lC": -4}]',
  '["1 drafted into MLR · 1 played"]','["ESPN coverage", "Penn Mutual College Rugby 7s appearances", "Midwest rugby leadership"]',
  'https://www.nd.edu','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'the-ohio-state-university','The Ohio State University','Columbus, Ohio','Ohio','midwest',
  40.0067,-83.0305,709.6,255.6,
  'CRAA D1A','Big Ten','playoff','Club',
  2,0,'','',
  'Ohio State rugby features two full-sized fields with lights and scoreboards, competing in the Big Ten Rugby Conference and producing multiple All-Americans and national team players.',67255,'["Engineering", "Business", "Arts and Sciences", "Medicine"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 41, "lF": 25, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 34, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 27, "hC": 5, "lC": -3}]',
  '["2025 Big Ten Champions","2 drafted into MLR · 1 played"]','["Big Ten Rugby Conference", "Multiple All-Americans", "Eagle players produced"]',
  'https://www.osu.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'davenport-university','Davenport University','Grand Rapids, Michigan','Michigan','midwest',
  42.8884,-85.4861,661.1,196.2,
  'CRAA D1A','Midwest','playoff','Varsity',
  1,37,'Dustin Steedman','dustin.steedman@davenport.edu',
  'Davenport University Panthers rugby achieved back-to-back Division 1AA National Championships in 2010/11 and 2011/12, featuring excellent facilities and strong program tradition.',4069,'["Business Administration", "Accounting", "Nursing", "Marketing"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 32, "lF": 18, "hC": 0, "lC": -8}, {"month": "Feb", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Mar", "hF": 47, "lF": 30, "hC": 8, "lC": -1}, {"month": "Apr", "hF": 60, "lF": 40, "hC": 16, "lC": 4}, {"month": "May", "hF": 71, "lF": 50, "hC": 22, "lC": 10}, {"month": "Jun", "hF": 80, "lF": 60, "hC": 27, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 82, "lF": 62, "hC": 28, "lC": 17}, {"month": "Sep", "hF": 75, "lF": 55, "hC": 24, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 49, "lF": 34, "hC": 9, "lC": 1}, {"month": "Dec", "hF": 36, "lF": 24, "hC": 2, "lC": -4}]',
  '["Rugby Scholarships Available","1 drafted into MLR · none confirmed played"]','["2010/11 D1AA National Champions", "2011/12 D1AA National Champions"]',
  'https://www.davenport.edu','https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'marian-university','Marian University','Indianapolis, Indiana','Indiana','midwest',
  39.8014,-86.1928,656.8,266.6,
  'NCR D1','Big Rivers','playoff','Varsity',
  1,0,'','',
  'Marian University Knights rugby program competes at the varsity level with excellent facilities and strong recruiting focus, part of their comprehensive 25+ sport athletic program.',4245,'["Nursing", "Business", "Education", "Osteopathic Medicine"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 36, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 41, "lF": 24, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "May", "hF": 74, "lF": 53, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 57, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Nov", "hF": 53, "lF": 35, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 25, "hC": 4, "lC": -4}]',
  '["1 drafted into MLR · 1 played"]','["New varsity program", "NAIA competition", "Strong recruiting"]',
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
  3,73,'Luke Gross','coachgrossusa@gmail.com',
  'Indiana Hoosiers rugby features a championship program with 7x Big Ten 15''s Championships, competing in NCR with excellent facilities and strong tradition.',48424,'["Business", "Communications", "Liberal Arts", "Public Affairs"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 42, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 53, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 65, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 68, "hC": 31, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 66, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 79, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 67, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 26, "hC": 5, "lC": -3}]',
  '["3 drafted into MLR · 2 played"]','["7x Big Ten 15''s Champions", "NCR competition", "Strong rugby tradition"]',
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
  1,27,'Michael Geibel','',
  'Wheeling Cardinals rugby is a premier varsity program competing at Division 1-A level in Rugby East, providing scholarships and featuring the 2024 National Champions in 7s rugby.',1500,'["Business", "Kinesiology", "Nursing", "Education"]',
  'Warm summers, cold, snowy winters.','[{"month": "Jan", "hF": 38, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 43, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 33, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 43, "hC": 18, "lC": 6}, {"month": "May", "hF": 73, "lF": 52, "hC": 23, "lC": 11}, {"month": "Jun", "hF": 81, "lF": 61, "hC": 27, "lC": 16}, {"month": "Jul", "hF": 85, "lF": 65, "hC": 29, "lC": 18}, {"month": "Aug", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 77, "lF": 57, "hC": 25, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 45, "hC": 19, "lC": 7}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '["1 drafted into MLR · none confirmed played"]','["2024 National Champions 7s", "Rugby East D1A", "Unbeaten 2024 season"]',
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
  3,40,'','',
  'Santa Clara University combines a top-tier private education in the heart of Silicon Valley with a rapidly rising rugby program. The Broncos capped the 2025-26 season by winning the D1A Challenger Cup, announcing themselves as one of the fastest-improving programs on the West Coast. Mild Bay Area weather means rugby all year round.',5800,'["Business", "Engineering", "Computer Science", "Communication"]',
  'Mild summers, mild winters.','[{"month": "Jan", "hF": 59, "lF": 42, "hC": 15, "lC": 6}, {"month": "Feb", "hF": 62, "lF": 44, "hC": 17, "lC": 7}, {"month": "Mar", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Apr", "hF": 70, "lF": 48, "hC": 21, "lC": 9}, {"month": "May", "hF": 74, "lF": 51, "hC": 23, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 55, "hC": 26, "lC": 13}, {"month": "Jul", "hF": 81, "lF": 57, "hC": 27, "lC": 14}, {"month": "Aug", "hF": 81, "lF": 57, "hC": 27, "lC": 14}, {"month": "Sep", "hF": 80, "lF": 56, "hC": 27, "lC": 13}, {"month": "Oct", "hF": 74, "lF": 51, "hC": 23, "lC": 11}, {"month": "Nov", "hF": 65, "lF": 45, "hC": 18, "lC": 7}, {"month": "Dec", "hF": 58, "lF": 41, "hC": 14, "lC": 5}]',
  '["2026 Challenger Cup Champions","3 drafted into MLR · 1 played"]','[]',
  'https://www.scu.edu','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-san-diego','University of San Diego','San Diego, California','California','west',
  32.7717,-117.1874,98,389.7,
  'CRAA D1A','California','playoff','Club',
  2,38,'','',
  'The University of San Diego made the jump to D1A and immediately reached the national playoffs, validating one of the most successful divisional moves in recent college rugby. A private university on a stunning Spanish Renaissance campus overlooking the Pacific, USD offers arguably the best year-round rugby climate in the country.',5700,'["Business", "Engineering", "Biology", "Political Science"]',
  'Warm, dry and sunny virtually all year.','[{"month": "Jan", "hF": 65, "lF": 50, "hC": 18, "lC": 10}, {"month": "Feb", "hF": 65, "lF": 51, "hC": 18, "lC": 11}, {"month": "Mar", "hF": 66, "lF": 53, "hC": 19, "lC": 12}, {"month": "Apr", "hF": 68, "lF": 56, "hC": 20, "lC": 13}, {"month": "May", "hF": 69, "lF": 59, "hC": 21, "lC": 15}, {"month": "Jun", "hF": 72, "lF": 62, "hC": 22, "lC": 17}, {"month": "Jul", "hF": 76, "lF": 66, "hC": 24, "lC": 19}, {"month": "Aug", "hF": 78, "lF": 67, "hC": 26, "lC": 19}, {"month": "Sep", "hF": 77, "lF": 65, "hC": 25, "lC": 18}, {"month": "Oct", "hF": 74, "lF": 60, "hC": 23, "lC": 16}, {"month": "Nov", "hF": 70, "lF": 54, "hC": 21, "lC": 12}, {"month": "Dec", "hF": 65, "lF": 49, "hC": 18, "lC": 9}]',
  '["2 drafted into MLR · 1 played"]','[]',
  'https://www.sandiego.edu','https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'university-of-utah','University of Utah','Salt Lake City, Utah','Utah','west',
  40.7649,-111.8421,225.8,231.4,
  'CRAA D1A','Rocky Mountain','playoff','Club',
  1,42,'','',
  'The University of Utah competes in D1A and entered the 2026 postseason as a Challenger Cup #1 seed. A major public research university at the foot of the Wasatch Mountains, Utah offers big-school resources, a large student body, and world-class skiing an hour from campus — a genuine draw for international student-athletes.',26000,'["Business", "Engineering", "Health Sciences", "Communication"]',
  'Hot, dry summers and cold, snowy winters.','[{"month": "Jan", "hF": 38, "lF": 23, "hC": 3, "lC": -5}, {"month": "Feb", "hF": 44, "lF": 27, "hC": 7, "lC": -3}, {"month": "Mar", "hF": 54, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 62, "lF": 40, "hC": 17, "lC": 4}, {"month": "May", "hF": 72, "lF": 48, "hC": 22, "lC": 9}, {"month": "Jun", "hF": 84, "lF": 57, "hC": 29, "lC": 14}, {"month": "Jul", "hF": 93, "lF": 65, "hC": 34, "lC": 18}, {"month": "Aug", "hF": 91, "lF": 63, "hC": 33, "lC": 17}, {"month": "Sep", "hF": 80, "lF": 53, "hC": 27, "lC": 12}, {"month": "Oct", "hF": 65, "lF": 41, "hC": 18, "lC": 5}, {"month": "Nov", "hF": 50, "lF": 31, "hC": 10, "lC": -1}, {"month": "Dec", "hF": 39, "lF": 24, "hC": 4, "lC": -4}]',
  '["1 drafted into MLR · 1 played"]','[]',
  'https://www.utah.edu','https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'walsh-university','Walsh University','North Canton, Ohio','Ohio','midwest',
  40.8767,-81.3865,734.2,232.2,
  'NCR D1','ARC','playoff','Varsity',
  6,50,'','',
  'When Notre Dame College closed its doors in 2024, its championship-winning rugby program — the 2023 NCR D1 national champions — transferred to Walsh University in nearby North Canton. Walsh inherited that culture and much of its roster, immediately becoming a top NCR D1 contender in the ARC. Rugby is a varsity sport at Walsh with scholarship support, making it one of the most direct pathways into high-level American college rugby.',1900,'["Nursing", "Business", "Education", "Exercise Science"]',
  'Warm summers, cold winters with lake-effect snow.','[{"month": "Jan", "hF": 36, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 41, "lF": 25, "hC": 5, "lC": -4}, {"month": "Mar", "hF": 52, "lF": 34, "hC": 11, "lC": 1}, {"month": "Apr", "hF": 64, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 74, "lF": 54, "hC": 23, "lC": 12}, {"month": "Jun", "hF": 83, "lF": 63, "hC": 28, "lC": 17}, {"month": "Jul", "hF": 86, "lF": 67, "hC": 30, "lC": 19}, {"month": "Aug", "hF": 84, "lF": 65, "hC": 29, "lC": 18}, {"month": "Sep", "hF": 78, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 66, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 27, "hC": 5, "lC": -3}]',
  '["Rugby Scholarships Available","2023 NCR D1 Champions (as Notre Dame College)","6 drafted into MLR (3 as Notre Dame College) · 3 played"]','[]',
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
  'Kutztown University is one of the proven producers of professional rugby talent in the American college game, with seven players drafted in the MLR College Draft (2020–26), five of them confirmed to have played an MLR match. A public university in eastern Pennsylvania competing in the ARC, Kutztown pairs affordable public-school tuition with a hard-nosed rugby program that consistently develops players for the next level.',6431,'["Education", "Business", "Criminal Justice", "Psychology"]',
  'Warm summers, cold winters with snow.','[{"month": "Jan", "hF": 35, "lF": 21, "hC": 2, "lC": -6}, {"month": "Feb", "hF": 39, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 51, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 60, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Aug", "hF": 81, "lF": 62, "hC": 27, "lC": 17}, {"month": "Sep", "hF": 74, "lF": 55, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 62, "lF": 43, "hC": 17, "lC": 6}, {"month": "Nov", "hF": 50, "lF": 34, "hC": 10, "lC": 1}, {"month": "Dec", "hF": 39, "lF": 26, "hC": 4, "lC": -3}]',
  '["7 drafted into MLR · 5 played"]','[]',
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
  'Thomas More University sits just across the river from Cincinnati and competes in NCR D1''s Big Rivers Conference. Three players have been drafted in the MLR College Draft (2020–26), two of them confirmed to have played an MLR match. The Saints offer a small-school environment with easy access to a major city — a solid fit for players who want game time and development in a competitive conference.',1834,'["Business", "Nursing", "Biology", "Education"]',
  'Hot summers, cold winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 42, "lF": 25, "hC": 6, "lC": -4}, {"month": "Mar", "hF": 53, "lF": 34, "hC": 12, "lC": 1}, {"month": "Apr", "hF": 65, "lF": 44, "hC": 18, "lC": 7}, {"month": "May", "hF": 75, "lF": 54, "hC": 24, "lC": 12}, {"month": "Jun", "hF": 84, "lF": 64, "hC": 29, "lC": 18}, {"month": "Jul", "hF": 87, "lF": 68, "hC": 31, "lC": 20}, {"month": "Aug", "hF": 85, "lF": 66, "hC": 29, "lC": 19}, {"month": "Sep", "hF": 79, "lF": 58, "hC": 26, "lC": 14}, {"month": "Oct", "hF": 67, "lF": 46, "hC": 19, "lC": 8}, {"month": "Nov", "hF": 54, "lF": 36, "hC": 12, "lC": 2}, {"month": "Dec", "hF": 41, "lF": 26, "hC": 5, "lC": -3}]',
  '["3 drafted into MLR · 2 played"]','[]',
  'https://www.thomasmore.edu','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'iona-university','Iona University','New Rochelle, New York','New York','northeast',
  40.9223,-73.7857,858.8,206.7,
  'NCR D1','Liberty','competitive','Club',
  2,38,'Connor Buckley','cbuckley@iona.edu',
  'Iona University competes in NCR D1''s Liberty Conference from New Rochelle, just north of New York City. With two players drafted in the MLR College Draft (2020–26), both confirmed to have played an MLR match, and a location that puts Manhattan a short train ride away, Iona offers competitive Northeast rugby with unmatched access to the biggest city in America.',3134,'["Business", "Finance", "Communication", "Criminal Justice"]',
  'Hot summers, cold winters.','[{"month": "Jan", "hF": 35, "lF": 20, "hC": 2, "lC": -7}, {"month": "Feb", "hF": 39, "lF": 23, "hC": 4, "lC": -5}, {"month": "Mar", "hF": 48, "lF": 31, "hC": 9, "lC": -1}, {"month": "Apr", "hF": 61, "lF": 42, "hC": 16, "lC": 6}, {"month": "May", "hF": 71, "lF": 52, "hC": 22, "lC": 11}, {"month": "Jun", "hF": 79, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 64, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 74, "lF": 56, "hC": 23, "lC": 13}, {"month": "Oct", "hF": 63, "lF": 45, "hC": 17, "lC": 7}, {"month": "Nov", "hF": 51, "lF": 35, "hC": 11, "lC": 2}, {"month": "Dec", "hF": 40, "lF": 26, "hC": 4, "lC": -3}]',
  '["2 drafted into MLR · 2 played"]','[]',
  'https://www.iona.edu','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80','mens')
on conflict (slug) do nothing;
insert into colleges (slug,name,location,state,region,lat,lng,map_x,map_y,affiliation,conference,tier,program_type,draft_picks,player_count,coach_name,coach_email,description,enrollment,popular_majors,weather_summary,monthly_temps,badges,achievements,website,image_url,gender) values (
  'fairfield-university','Fairfield University','Fairfield, Connecticut','Connecticut','northeast',
  41.1601,-73.2544,866.2,199.4,
  'NCR D1','Liberty','competitive','Club',
  1,69,'Austin Ryan','aryan3@fairfield.edu',
  'Fairfield University is a private Jesuit school on the Connecticut coast, an hour from New York City, competing in NCR D1''s Liberty Conference. One of the biggest improvers in recent NCR seasons, the Stags run one of the larger club rosters in the division and pair strong academics with a rising rugby culture.',4968,'["Business", "Nursing", "Finance", "Marketing"]',
  'Warm summers, cold winters.','[{"month": "Jan", "hF": 37, "lF": 21, "hC": 3, "lC": -6}, {"month": "Feb", "hF": 40, "lF": 24, "hC": 4, "lC": -4}, {"month": "Mar", "hF": 49, "lF": 32, "hC": 9, "lC": 0}, {"month": "Apr", "hF": 59, "lF": 41, "hC": 15, "lC": 5}, {"month": "May", "hF": 69, "lF": 51, "hC": 21, "lC": 11}, {"month": "Jun", "hF": 78, "lF": 61, "hC": 26, "lC": 16}, {"month": "Jul", "hF": 83, "lF": 66, "hC": 28, "lC": 19}, {"month": "Aug", "hF": 82, "lF": 65, "hC": 28, "lC": 18}, {"month": "Sep", "hF": 75, "lF": 58, "hC": 24, "lC": 14}, {"month": "Oct", "hF": 64, "lF": 47, "hC": 18, "lC": 8}, {"month": "Nov", "hF": 53, "lF": 37, "hC": 12, "lC": 3}, {"month": "Dec", "hF": 42, "lF": 27, "hC": 6, "lC": -3}]',
  '["1 drafted into MLR · none confirmed played"]','[]',
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
  description='UCLA moved from CRAA D1A to NCR D1 for the 2026–27 season and immediately enters the NCR conversation as a contender. The Bruins play on one of the best rugby fields in the country at Wallis Annenberg Stadium, with live scoreboards and video replay, and have had six players drafted in the MLR College Draft (2020–26), three of them confirmed to have played an MLR match.'
  where slug='university-of-california-los-angeles-ucla';
delete from colleges where slug='american-international-college';

-- ── MLR draft numbers (corrected 2026-10-02; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged. ──
-- Drafted = picked in the official MLR College Draft 2020-26. It does NOT mean he played. Played counts live in the site code, not in this table.
update colleges set draft_picks=6, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["6 drafted into MLR · 3 played"]'::jsonb where slug='arkansas-state-university';
update colleges set draft_picks=5, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["5 drafted into MLR · 2 played"]'::jsonb where slug='brigham-young-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 1 played"]'::jsonb where slug='brown-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 1 played"]'::jsonb where slug='california-polytechnic-state-university';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · none confirmed played"]'::jsonb where slug='california-state-university-long-beach';
update colleges set draft_picks=4, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["4 drafted into MLR · 3 played"]'::jsonb where slug='dartmouth-college';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · none confirmed played"]'::jsonb where slug='davenport-university';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · none confirmed played"]'::jsonb where slug='fairfield-university';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · 1 played"]'::jsonb where slug='grand-canyon-university';
update colleges set draft_picks=3, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["3 drafted into MLR · 2 played"]'::jsonb where slug='indiana-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 2 played"]'::jsonb where slug='iona-university';
update colleges set draft_picks=7, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["7 drafted into MLR · 5 played"]'::jsonb where slug='kutztown-university';
update colleges set draft_picks=17, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["17 drafted into MLR · 13 played"]'::jsonb where slug='life-university';
update colleges set draft_picks=23, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["23 drafted into MLR · 16 played"]'::jsonb where slug='lindenwood-university';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · 1 played"]'::jsonb where slug='marian-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · none confirmed played"]'::jsonb where slug='mount-st-mary-s-university';
update colleges set draft_picks=7, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["7 drafted into MLR · 4 played"]'::jsonb where slug='pennsylvania-state-university';
update colleges set draft_picks=4, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["4 drafted into MLR · none confirmed played"]'::jsonb where slug='queens-university-of-charlotte';
update colleges set draft_picks=14, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["14 drafted into MLR · 9 played"]'::jsonb where slug='saint-mary-s-college-of-california';
update colleges set draft_picks=3, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["3 drafted into MLR · 1 played"]'::jsonb where slug='santa-clara-university';
update colleges set draft_picks=5, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["5 drafted into MLR · 2 played"]'::jsonb where slug='st-bonaventure-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 1 played"]'::jsonb where slug='the-ohio-state-university';
update colleges set draft_picks=3, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["3 drafted into MLR · 2 played"]'::jsonb where slug='thomas-more-university';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 2 played"]'::jsonb where slug='united-states-military-academy-army';
update colleges set draft_picks=6, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["6 drafted into MLR · 4 played"]'::jsonb where slug='university-of-arizona';
update colleges set draft_picks=10, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["10 drafted into MLR · 5 played"]'::jsonb where slug='university-of-california-berkeley';
update colleges set draft_picks=6, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["6 drafted into MLR · 3 played"]'::jsonb where slug='university-of-california-los-angeles-ucla';
update colleges set draft_picks=3, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["3 drafted into MLR · 1 played"]'::jsonb where slug='university-of-mary-washington';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · 1 played"]'::jsonb where slug='university-of-notre-dame';
update colleges set draft_picks=2, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["2 drafted into MLR · 1 played"]'::jsonb where slug='university-of-san-diego';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · 1 played"]'::jsonb where slug='university-of-utah';
update colleges set draft_picks=6, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["6 drafted into MLR (3 as Notre Dame College) · 3 played"]'::jsonb where slug='walsh-university';
update colleges set draft_picks=1, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '["1 drafted into MLR · none confirmed played"]'::jsonb where slug='wheeling-university';

-- ── Walkthrough fixes 2026-10-06 (descriptions + program type; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged. ──
-- Rows that are not in the table yet (8 of the 48) just update nothing; the site uses the code version for those.
update colleges set program_type='Varsity' where slug='aquinas-college';
update colleges set program_type='Varsity' where slug='belmont-abbey-college';
update colleges set program_type='Varsity' where slug='indiana-institute-of-technology';
update colleges set program_type='Varsity' where slug='mount-st-mary-s-university';
update colleges set program_type='Varsity' where slug='thomas-more-university';
update colleges set program_type='Varsity' where slug='university-of-mary-washington';
update colleges set program_type='Varsity' where slug='university-of-rio-grande';
update colleges set program_type='Varsity' where slug='wingate-university';
update colleges set description='Aquinas added men''s rugby as a varsity sport in 2021, and head coach Lance Hohaia, a 2008 Rugby League World Cup winner with New Zealand, has led it since. In fall 2025 the Saints went 6–2 and finished third in the Big Rivers Conference. Aquinas is a small Catholic college in Grand Rapids, Michigan.' where slug='aquinas-college';
update colleges set description='Arkansas State went 4–1 in the Midwest Conference in 2025–26 and reached the D1A playoffs, losing 42–17 at Army in the first round. That was the Red Wolves'' fourth straight D1A postseason. Rugby is a club sport at the university in Jonesboro, Arkansas.' where slug='arkansas-state-university';
update colleges set description='Belmont Abbey reached the 2025 NCR Division 1 semifinals, beating Notre Dame 44–24 in the quarterfinals before losing 19–15 to Queens. Genaro Fessia became head coach in May 2024. The small Catholic college is in Belmont, North Carolina, just west of Charlotte, and plays in the ARC.' where slug='belmont-abbey-college';
update colleges set description='BYU lists five national titles: 2009, 2012, 2013, 2014 and 2015. In 2025–26 the team went 5–0 to win the Rocky Mountain Conference, beat Cal Poly in the first round of the D1A playoffs, and lost 96–12 at Cal in the quarterfinals. BYU is in Provo, Utah.' where slug='brigham-young-university';
update colleges set description='Brown won the 2022 Division 1 national title. In fall 2025 the team reached the NCR Division 1 quarterfinals, where it lost 51–7 to eventual champions St. Bonaventure. Brown is an Ivy League university in Providence, Rhode Island.' where slug='brown-university';
update colleges set description='Cal Poly went 6–2 in the southern half of the California Conference in 2025–26 and made the 2026 D1A playoffs as the West''s No. 5 seed. The Mustangs lost in the first round at BYU. The campus is in San Luis Obispo on California''s Central Coast.' where slug='california-polytechnic-state-university';
update colleges set description='Long Beach State topped the southern half of the California Conference on points in 2025–26 with a 6–4 record. Results included wins over UC Davis (71–5) and San Diego State (51–29) and a 36–28 loss to San Diego. The university is in Long Beach, California.' where slug='california-state-university-long-beach';
update colleges set description='Colorado State went 4–1 in the Rocky Mountain Conference in 2025–26 and reached the D1A playoffs as the West''s No. 7 seed, losing 69–10 at Saint Mary''s in the first round. Rugby is a sport club at the university in Fort Collins, Colorado.' where slug='colorado-state-university';
update colleges set description='Dartmouth won the 2019 D1-AA spring national title. In fall 2025 the team reached an NCR Division 1 play-in game and lost 38–33 to Wheeling. Dartmouth plays out of the Corey Ford Rugby Clubhouse in Hanover, New Hampshire.' where slug='dartmouth-college';
update colleges set description='Davenport won the 2026 D1A Challenger Cup, beating St. Thomas 30–23 and Utah 37–17. The Panthers also won back-to-back Division 1AA national titles in 2010–11 and 2011–12. Dom Bailey has been head coach since December 2024, and the university is in Grand Rapids, Michigan.' where slug='davenport-university';
update colleges set description='Fairfield went 5–3 in fall 2025 and finished fourth in the Liberty Conference, with wins including 55–31 over Fordham and 28–27 over Siena. The team runs through Fairfield''s club sports program. The Jesuit university is on the Connecticut coast, about an hour from New York City.' where slug='fairfield-university';
update colleges set description='Fordham plays NCR Division 1 in the Liberty Conference as a club team. Its fall 2025 league schedule included Syracuse, AIC, Fairfield and Siena. Fordham''s main campus is in the Bronx, New York City.' where slug='fordham-university';
update colleges set description='Grand Canyon went 7–4 in 2025–26 as a D1A independent and reached the 2026 playoffs, losing 41–35 at Arizona in the first round. Rugby runs through GCU Club Sports in Phoenix, Arizona.' where slug='grand-canyon-university';
update colleges set description='Indiana Tech added men''s rugby in 2024 under head coach Sam DiFilippo, and 2026–27 is its second varsity 15s season. In September 2026 the Warriors won their first Big Rivers Conference game, 22–7 over Thomas More at Shields Field. Indiana Tech is in Fort Wayne, Indiana.' where slug='indiana-institute-of-technology';
update colleges set description='Indiana went 3–0 to win the Big Ten West in fall 2025 and reached the Big Ten Cup final, losing 12–0 to Notre Dame. The Hoosiers then lost an NCR Division 1 opening-round game 36–29 to Walsh in Bloomington. Indiana also appears on CRAA''s D1A team list for 2026–27.' where slug='indiana-university';
update colleges set description='Iona plays NCR Division 1 in the Liberty Conference. In fall 2025 the Gaels earned their first Liberty win, 30–29 over Siena, after losses to AIC and Syracuse. The university is in New Rochelle, New York, about 20 miles north of Manhattan.' where slug='iona-university';
update colleges set description='Kutztown won the 2022 college 7s national title, beating Dartmouth 17–12 in the final. The team plays NCR Division 1 in the ARC, and the university lists it among its sport clubs. Kutztown is a public university in eastern Pennsylvania, between Allentown and Reading.' where slug='kutztown-university';
update colleges set description='Life won back-to-back D1A national titles in 2018 and 2019. In 2026 the Running Eagles won a 31–24 quarterfinal at Lindenwood and reached the semifinals, where they lost to Navy. Life plays in Rugby East from Marietta, Georgia, near Atlanta.' where slug='life-university';
update colleges set description='Lindenwood went 5–0 to win the Midwest Conference in 2025–26, then beat Penn State 31–10 in the 2026 D1A playoffs before losing a 31–24 quarterfinal to Life. Rugby is run by the university''s Student Life Sports department in St. Charles, Missouri, near St. Louis.' where slug='lindenwood-university';
update colleges set description='Marian won the 2025 Big Rivers Conference title, beating Thomas More in the final, and reached the NCR Division 1 quarterfinals for the first time, losing 30–28 to Walsh. In spring 2026 the Knights won the Big Rivers 7s, beating Rio Grande 33–12 in the final. Marian is a Catholic university in Indianapolis.' where slug='marian-university';
update colleges set description='McKendree plays CRAA D1A in the Midwest Conference. In 2025–26 the Bearcats finished 3–12, with wins including 36–5 at Michigan State and 36–14 over Ohio State, and three players were named all-conference. McKendree is a small private university in Lebanon, Illinois, about 25 miles east of St. Louis.' where slug='mckendree-university';
update colleges set description='Mount St. Mary''s won the 2016 NSCRO national title and joined Rugby East in CRAA D1A in fall 2022. The university made rugby a "Premier team sport" in 2018, with a full-time coach and scholarships. In 2026 the Mount went 7–6 and reached the D1A playoffs, losing in the first round at Life.' where slug='mount-st-mary-s-university';
update colleges set description='Penn State rugby was founded in 1962 and plays CRAA D1A in Rugby East. The team reached the 2026 D1A playoffs as the East''s No. 7 seed and lost 31–10 at Lindenwood in the first round. The main campus is in University Park, Pennsylvania.' where slug='pennsylvania-state-university';
update colleges set description='Queens reached the 2025 NCR Division 1 final, beating Wheeling 45–28 and Belmont Abbey 19–15 before losing 55–19 to St. Bonaventure. Tyree Reed was named head coach in April 2025. Queens is in Charlotte, North Carolina, and plays in the ARC.' where slug='queens-university-of-charlotte';
update colleges set description='Saint Mary''s has won four D1A national titles: 2014, 2015, 2017 and 2024. In 2026 the Gaels went 8–0 in the northern half of the California Conference, beat Colorado State and Arizona in the playoffs, and lost the semifinal 59–19 to Cal. The campus is in Moraga, in the San Francisco Bay Area.' where slug='saint-mary-s-college-of-california';
update colleges set description='Santa Clara reached the semifinals of the 2026 D1A Challenger Cup, losing 42–28 to Utah in Indianapolis. In 2025–26 the Broncos went 4–4 in the northern half of the California Conference. Rugby runs through the university''s club sports program in Silicon Valley.' where slug='santa-clara-university';
update colleges set description='Siena went 3–5 in the Liberty Conference in fall 2025, including a 45–17 win over Fordham and one-point losses to Fairfield (28–27) and Iona (30–29). Siena is a private Franciscan school in Loudonville, just outside Albany, New York.' where slug='siena-college';
update colleges set description='Southern Nazarene played as an NCR Division 1 independent in fall 2025 and started 3–0, with wins including 24–3 at Wayne State and 56–21 over Drury. The university fields men''s and women''s rugby at the SNU Rugby Pitch in Bethany, Oklahoma, in the Oklahoma City area.' where slug='southern-nazarene-university';
update colleges set description='St. Bonaventure won the 2025 NCR Division 1 national title, beating Queens 55–19 in the final in Houston. On the way the Bonnies beat Brown 51–7 and Walsh. The program was founded in 1975 and plays in the Atlantic Rugby Conference (ARC) in western New York.' where slug='st-bonaventure-university';
update colleges set description='Ohio State finished third in the Big Ten East in fall 2025 and beat Michigan State 73–19 in November. CRAA lists Ohio State in its Midwest Conference for 2026–27. The team plays in Columbus, Ohio.' where slug='the-ohio-state-university';
update colleges set description='Thomas More won the 2021 NCR Division 2 national title, then moved up to Division 1 and won the Big Rivers Conference in its first season there in 2022. In 2025 the Saints reached the Big Rivers final, losing to Marian. The campus is in Crestview Hills, Kentucky, across the river from Cincinnati.' where slug='thomas-more-university';
update colleges set description='Army won the 2022 D1A national title. In 2026 Army beat Arkansas State 42–17 in the first round of the playoffs, then lost 38–10 at Navy in the quarterfinals to finish 10–4. Matt Sherman is head coach.' where slug='united-states-military-academy-army';
update colleges set description='Navy reached the 2026 D1A final, beating Army 38–10 and Life on the way before losing 36–22 to Cal. Navy went 5–0 to top Rugby East in 2025–26. Gavin Hickie has led the program since 2017.' where slug='united-states-naval-academy';
update colleges set description='Arizona went 10–4 in 2025–26 as a D1A independent. In the 2026 playoffs the Wildcats beat Grand Canyon 41–35 at home, then lost 48–19 at Saint Mary''s in the quarterfinals. Home games are at William David Sitton Field in Tucson.' where slug='university-of-arizona';
update colleges set description='Cal won the 2026 D1A national title, beating Navy 36–22 in Indianapolis for a second straight championship, and went unbeaten all season. Jack Clark has been head coach since 1984. Home games are at Witter Rugby Field in Berkeley.' where slug='university-of-california-berkeley';
update colleges set description='UCLA played CRAA D1A in 2025–26, going 5–2 in the southern half of the California Conference, and has announced it is joining National Collegiate Rugby (NCR) from 2026–27. Home games are at Wallis Annenberg Stadium, and the team runs through UCLA Club Sports.' where slug='university-of-california-los-angeles-ucla';
update colleges set description='Colorado went 2–3 in the Rocky Mountain Conference in 2025–26, with wins including 32–17 over Air Force and 25–20 over Utah State. The university is in Boulder, Colorado.' where slug='university-of-colorado-boulder';
update colleges set description='Mary Washington''s men won the 2017 USA Rugby D1AA fall title. In 2026 the Eagles made the D1A playoffs and lost 40–11 at Navy in the first round. The university is in Fredericksburg, Virginia, about an hour south of Washington, D.C.' where slug='university-of-mary-washington';
update colleges set description='Michigan beat Ohio State 25–22 in October 2025, its first 15s win over the Buckeyes since 2013, and went 2–1 in the Big Ten East. The Wolverines lost the Big Ten Cup semifinal 38–10 at Indiana. Home games are at Mitchell Field in Ann Arbor.' where slug='university-of-michigan';
update colleges set description='Notre Dame won the 2025 Big Ten Universities Cup final 12–0 over Indiana at its home ground, Stinson Rugby Field. The team then reached the NCR Division 1 quarterfinals, losing 44–24 to Belmont Abbey. The campus is next to South Bend, Indiana.' where slug='university-of-notre-dame';
update colleges set description='Rio Grande made men''s rugby a varsity sport in 2021, and Brad Sandig has been head coach since 2024. In spring 2026 the RedStorm finished runner-up at the Big Rivers 7s championship. The university is in Rio Grande, a small town in southeast Ohio.' where slug='university-of-rio-grande';
update colleges set description='San Diego went 5–1 in the southern half of the California Conference in 2025–26, including a 36–28 win over Long Beach State. The Toreros made the 2026 D1A playoffs as the West''s No. 8 seed and lost in the first round at Cal.' where slug='university-of-san-diego';
update colleges set description='The University of St. Thomas is a private Catholic university in Saint Paul, Minnesota. Its men''s rugby team is a student club listed on the university''s TommieLink student-organisation site. Check with the club for its current league and schedule.' where slug='university-of-st-thomas-minnesota';
update colleges set description='Utah reached the final of the 2026 D1A Challenger Cup, beating Santa Clara 42–28 in the semifinals before losing 37–17 to Davenport. The Utes went 4–1 in the Rocky Mountain Conference in 2025–26. The university is in Salt Lake City.' where slug='university-of-utah';
update colleges set description='Walsh took over Notre Dame College''s rugby program, the 2023 NCR Division 1 champions, after that college closed in 2024. In fall 2025 Walsh beat Indiana 36–29 and Marian 30–28 to reach the NCR Division 1 semifinals, where it lost to St. Bonaventure. Walsh is a Catholic university in North Canton, Ohio, and plays in the ARC.' where slug='walsh-university';
update colleges set description='Western Washington won the 2025–26 CRAA D1AA national 15s title and moved up to D1A for 2026–27. Adam Roberts is head coach. The university is in Bellingham, Washington, near the Canadian border.' where slug='western-washington-university';
update colleges set description='Wheeling won the 2024 national 7s title. In fall 2025, its first season in the ARC, the Cardinals beat Dartmouth 38–33 in an NCR Division 1 play-in game, then lost 45–28 to Queens in the quarterfinals. Wheeling is a small Catholic university in Wheeling, West Virginia.' where slug='wheeling-university';
update colleges set description='Wingate made men''s rugby a varsity sport from 2025–26, moving up from club, and named Frank McKinney head coach. The Bulldogs won their first home game 20–17 over Coastal Carolina in September 2025. Wingate is in Wingate, North Carolina, about 30 miles southeast of Charlotte.' where slug='wingate-university';

-- ── Follow-up fixes 2026-10-06 (St. Thomas FL replaces St. Thomas MN; league labels; coaches; honours; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged, after the walkthrough block above. ──
-- 1. Remove the Minnesota row and add St. Thomas University (Florida) with the same id (26).
delete from colleges where slug='university-of-st-thomas-minnesota';
insert into colleges (id, slug, name, location, state, region, lat, lng, map_x, map_y, affiliation, conference, tier, program_type, draft_picks, player_count, coach_name, coach_email, description, enrollment, popular_majors, weather_summary, monthly_temps, badges, achievements, website, image_url, gender, rugby_program_url, assistant_coaches)
values (26, 'st-thomas-university-florida', 'St. Thomas University (Florida)', 'Miami Gardens, Florida', 'Florida', 'southeast', 25.9221, -80.2533, 808.3, 560.1, 'CRAA D1A', 'Independent', 'emerging', 'Varsity', 0, 0, 'Gavin McLeavy', 'gmcleavy@stu.edu', 'St. Thomas University added men''s rugby as a varsity sport in fall 2022 under founding head coach Gavin McLeavy, and won the 2025 CRAA D1AA national title, beating San Diego 38–32 in the final. Moving up to D1A as an independent in 2025–26, the Bobcats won at Queens and reached the semifinals of the 2026 D1A Challenger Cup, losing 30–23 to Davenport. The university is in Miami Gardens, Florida, about 11 miles north of downtown Miami.', 7652, '["Nursing","Business","Criminal Justice","Biology"]'::jsonb, 'Hot summers, warm winters.', '[{"month":"Jan","hF":77,"lF":59,"hC":25,"lC":15},{"month":"Feb","hF":79,"lF":61,"hC":26,"lC":16},{"month":"Mar","hF":81,"lF":64,"hC":27,"lC":18},{"month":"Apr","hF":84,"lF":68,"hC":29,"lC":20},{"month":"May","hF":87,"lF":72,"hC":31,"lC":22},{"month":"Jun","hF":90,"lF":76,"hC":32,"lC":24},{"month":"Jul","hF":91,"lF":76,"hC":33,"lC":25},{"month":"Aug","hF":91,"lF":77,"hC":33,"lC":25},{"month":"Sep","hF":90,"lF":76,"hC":32,"lC":24},{"month":"Oct","hF":86,"lF":73,"hC":30,"lC":23},{"month":"Nov","hF":82,"lF":66,"hC":28,"lC":19},{"month":"Dec","hF":78,"lF":62,"hC":26,"lC":17}]'::jsonb, '["2025 CRAA D1AA National Champions"]'::jsonb, '["2026 D1A Challenger Cup semifinalists"]'::jsonb, 'https://www.stu.edu', '/college-images/st-thomas-university-florida.jpg', 'mens', 'https://stubobcats.com/sports/mens-rugby', '[]'::jsonb)
on conflict (slug) do update set name=excluded.name, location=excluded.location, state=excluded.state, region=excluded.region, lat=excluded.lat, lng=excluded.lng, map_x=excluded.map_x, map_y=excluded.map_y, affiliation=excluded.affiliation, conference=excluded.conference, tier=excluded.tier, program_type=excluded.program_type, draft_picks=excluded.draft_picks, player_count=excluded.player_count, coach_name=excluded.coach_name, coach_email=excluded.coach_email, description=excluded.description, enrollment=excluded.enrollment, popular_majors=excluded.popular_majors, weather_summary=excluded.weather_summary, monthly_temps=excluded.monthly_temps, badges=excluded.badges, achievements=excluded.achievements, website=excluded.website, image_url=excluded.image_url, gender=excluded.gender, rugby_program_url=excluded.rugby_program_url, assistant_coaches=excluded.assistant_coaches;
-- 2. Labels, coaches, badges and honours (rows not in the table yet just update nothing).
update colleges set coach_name='', coach_email='', achievements='["2012, 2013 USA Rugby 7s National Champions","2012 D1A National Finalists"]'::jsonb where slug='arkansas-state-university';
update colleges set achievements='["5 National Championships","2025–26 Rocky Mountain Conference champions (5–0)"]'::jsonb where slug='brigham-young-university';
update colleges set achievements='["2022 and 2024 NCR D1 National Champions"]'::jsonb, description='Brown won NCR Division 1 national titles in 2022 and 2024. In fall 2025 the team reached the NCR Division 1 quarterfinals, where it lost 51–7 to eventual champions St. Bonaventure. Brown is an Ivy League university in Providence, Rhode Island.' where slug='brown-university';
update colleges set achievements='[]'::jsonb where slug='california-polytechnic-state-university';
update colleges set achievements='["2019 D1-AA Spring Championship"]'::jsonb where slug='dartmouth-college';
update colleges set coach_name='Dominique Bailey', coach_email='dominique.bailey@davenport.edu', achievements='["2010/11 D1AA National Champions","2011/12 D1AA National Champions","2026 D1A Challenger Cup champions"]'::jsonb, description='Davenport won the 2026 D1A Challenger Cup, beating St. Thomas (Florida) 30–23 and Utah 37–17. The Panthers also won back-to-back Division 1AA national titles in 2010–11 and 2011–12. Dom Bailey has been head coach since December 2024, and the university is in Grand Rapids, Michigan.' where slug='davenport-university';
update colleges set achievements='["2025 D1A Challenger Cup finalists"]'::jsonb where slug='grand-canyon-university';
update colleges set achievements='["7x Big Ten 15''s Champions"]'::jsonb where slug='indiana-university';
update colleges set affiliation='NCR D1AA', coach_name='Kyle Granby', coach_email='kgranby@iona.edu', description='Iona moved to the Liberty Conference''s Division 1AA for fall 2026 and opened with wins at Yale (39–21) and Babson (47–12). In fall 2025, in Liberty Division 1, the Gaels earned their first conference win, 30–29 over Siena. The university is in New Rochelle, New York, about 20 miles north of Manhattan.' where slug='iona-university';
update colleges set achievements='["4× D1A National Champions (2013, 2016, 2018, 2019)"]'::jsonb where slug='life-university';
update colleges set achievements='["2025–26 Midwest Conference champions (5–0)"]'::jsonb where slug='lindenwood-university';
update colleges set achievements='["2025 Big Rivers champions","2025 NCR D1 quarterfinalists","2026 Big Rivers 7s champions"]'::jsonb where slug='marian-university';
update colleges set achievements='["2016 NSCRO National Champions"]'::jsonb where slug='mount-st-mary-s-university';
update colleges set coach_name='Zac Mizell', coach_email='zvm5239@psu.edu', achievements='["2021 NCR D1 National Finalists","2018 D1A semifinalists"]'::jsonb where slug='pennsylvania-state-university';
update colleges set coach_name='Tyree Reed', coach_email='reedt2@queens.edu', achievements='[]'::jsonb where slug='queens-university-of-charlotte';
update colleges set achievements='["4× D1A National Champions (2014, 2015, 2017, 2024)"]'::jsonb where slug='saint-mary-s-college-of-california';
update colleges set coach_name='Jaco Visser', coach_email='' where slug='siena-college';
update colleges set conference='Independent', achievements='[]'::jsonb where slug='southern-nazarene-university';
update colleges set coach_name='Daniel Neighbour', coach_email='dneighbo@sbu.edu', achievements='["2021 NCR D1 National Champions","2023 NCR D1 National Finalists"]'::jsonb where slug='st-bonaventure-university';
update colleges set conference='Midwest', badges='["2024 Big Ten Universities champions","2 drafted into MLR · 1 played"]'::jsonb, achievements='[]'::jsonb where slug='the-ohio-state-university';
update colleges set achievements='["2022 D1A National Champions"]'::jsonb where slug='united-states-military-academy-army';
update colleges set achievements='["2023 D1A National Champions","2025–26 Rugby East champions (5–0)"]'::jsonb where slug='united-states-naval-academy';
update colleges set achievements='["2026 D1A quarterfinalists"]'::jsonb where slug='university-of-arizona';
update colleges set conference='Independent', achievements='["30 national 15s titles and 5 national 7s titles (as of 2026)","9 PAC Rugby 7s titles"]'::jsonb where slug='university-of-california-berkeley';
update colleges set affiliation='NCR D1', conference='Independent' where slug='university-of-california-los-angeles-ucla';
update colleges set coach_name='Andrew Spencer', coach_email='aspence8@umw.edu', achievements='["2017 Men''s D1AA Fall Champions","2025 D1A Challenger Cup champions"]'::jsonb where slug='university-of-mary-washington';
update colleges set achievements='[]'::jsonb where slug='university-of-michigan';
update colleges set achievements='["2025 Big Ten Universities champions","2025 NCR D1 quarterfinalists"]'::jsonb where slug='university-of-notre-dame';
update colleges set coach_name='Cam DiLoreto', coach_email='' where slug='university-of-utah';
update colleges set coach_name='Maxwell Hamilton', coach_email='mhamilton@wheeling.edu', achievements='["2024 CRC National 7s champions","Unbeaten 2024 7s season (20–0–1)"]'::jsonb where slug='wheeling-university';
update colleges set conference='Independent', coach_name='Frank McKinney', coach_email='' where slug='wingate-university';
update colleges set coach_name='Pete Malcolm', coach_email='' where slug='the-ohio-state-university';
update colleges set coach_name='Adam Roberts', coach_email='' where slug='western-washington-university';
