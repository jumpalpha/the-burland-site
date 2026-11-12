// Burland Basecamp: podcast episodes, the 150-mile area map, and ready-made reunion days.
// Edit this file to update /basecamp.
//
// PUBLISH AN EPISODE
//   1. Download the NotebookLM Audio Overview.
//   2. Run: scripts/compress-episode.sh <downloaded file> <episode number>
//      (writes a small mono MP3 to public/basecamp/audio/ep01.mp3 and prints its length).
//   3. Set that episode's audio: "/basecamp/audio/ep01.mp3", status: "live", date, and length.
//   NotebookLM source packs live in basecamp/notebooklm/ (not published to the site).
//
// DRIVE TIMES below are unconfirmed estimates from St. Anthony. They stay hidden on the page
// until SHOW_DRIVE is set to true. Confirmed drive times for the main spots are in content.ts.

export const SHOW_DRIVE = true;

export type EpisodeStatus = "live" | "soon";
export interface Episode { n: number; title: string; blurb: string; date: string; length: string; audio: string; status: EpisodeStatus; links: string[] }

// Newest first.
export const EPISODES: Episode[] = [
  {
    n: 1,
    title: "Welcome to Basecamp: a reunion week in Eastern Idaho",
    blurb: "The big picture: what's within a day's drive of The Burland, and how to split a reunion week between Yellowstone days and easy close-to-home days.",
    date: "November 2026",
    length: "22 min",
    audio: "/basecamp/audio/ep01.mp3",
    status: "live",
    links: ["yellowstone-west","sand-dunes","mesa-falls"],
  },
  {
    n: 2,
    title: "Yellowstone in one day, with grandkids",
    blurb: "Leaving early, which geysers are worth the walk, bathroom stops, and getting everyone home for dinner.",
    date: "November 2026",
    length: "17 min",
    audio: "/basecamp/audio/ep02.mp3",
    status: "live",
    links: ["yellowstone-west","old-faithful","grand-prismatic"],
  },
  {
    n: 3,
    title: "Henry's Fork and the Snake: fishing for beginners and experts",
    blurb: "Where a first-timer can catch something, where the serious fly fishers go, and floating the South Fork.",
    date: "November 2026",
    length: "19 min",
    audio: "/basecamp/audio/ep03.mp3",
    status: "live",
    links: ["harriman","box-canyon","south-fork"],
  },
];

export const CATS = {
  parks: { label: "National parks", color: "#2B3A2E" },
  water: { label: "Rivers & fishing", color: "#2F6F8F" },
  adventure: { label: "Adventure", color: "#A8813C" },
  family: { label: "Kids & rainy day", color: "#8C3B2E" },
  lava: { label: "Lava country", color: "#5B4A3F" },
  towns: { label: "Towns", color: "#6E7F5C" },
  hunting: { label: "Hunting", color: "#7A5C2E" },
} as const;
export type Cat = keyof typeof CATS;

export const SEASONS = { summer: "Summer", winter: "Winter", year: "Year-round" } as const;
export type Season = keyof typeof SEASONS;

export interface Place {
  id: string;
  name: string;
  cat: Cat;
  season: Season;
  lat: number;
  lng: number;
  drive: string; // unconfirmed estimate
  miles: number; // unconfirmed road-mile estimate, used for "closest first" ordering
  gem?: boolean; // "Local favorite"
  area?: string; // slug of the matching /area/ page, if there is one
  blurb: string;
}

export const PLACES: Place[] = [
  { id: "yellowstone-west", name: "Yellowstone: West Entrance & West Yellowstone", cat: "parks", season: "year", lat: 44.6621, lng: -111.1043, drive: "1 hr 11 min", miles: 69, area: "yellowstone",
    blurb: "The closest full-service gateway to the park. Gas, food, and the start of the geyser basins. Most park roads are open to cars mid-April through October; winter travel inside is by guided snowmobile or snowcoach." },
  { id: "old-faithful", name: "Old Faithful & Upper Geyser Basin", cat: "parks", season: "summer", lat: 44.4605, lng: -110.8281, drive: "2 hr 15 min", miles: 100,
    blurb: "Eruptions roughly every 60 to 110 minutes, with flat boardwalks that work for strollers and grandparents." },
  { id: "grand-prismatic", name: "Grand Prismatic Spring", cat: "parks", season: "summer", lat: 44.5251, lng: -110.8382, drive: "2 hr", miles: 95,
    blurb: "The rainbow hot spring. Walk the Fairy Falls overlook trail for the view from above. Parking fills by mid-morning." },
  { id: "cave-falls", name: "Cave Falls (Yellowstone's quiet corner)", cat: "parks", season: "summer", lat: 44.1438, lng: -111.0175, drive: "1 hr", miles: 40, gem: true,
    blurb: "A wide waterfall in Yellowstone's Bechler corner, reached from Ashton with no entrance-station crowds. The last stretch is gravel." },
  { id: "grand-teton", name: "Grand Teton National Park (Jenny Lake)", cat: "parks", season: "summer", lat: 43.7504, lng: -110.7271, drive: "1 hr 55 min", miles: 90,
    blurb: "Jagged peaks, the Jenny Lake shuttle boat, and easy lakeshore walks. Go over Teton Pass through Driggs and Victor." },
  { id: "harriman", name: "Harriman State Park (Henry's Fork)", cat: "water", season: "year", lat: 44.3367, lng: -111.4689, drive: "34 min", miles: 33, area: "harriman-state-park",
    blurb: "Historic ranch on the Henry's Fork's famous Railroad Ranch water. Trumpeter swans, moose, easy trails, and fly fishing." },
  { id: "box-canyon", name: "Box Canyon & Last Chance (Henry's Fork)", cat: "water", season: "summer", lat: 44.425, lng: -111.397, drive: "40 min", miles: 36, area: "henrys-fork",
    blurb: "Some of the most famous fly fishing water in North America. Local fly shops in Last Chance rent gear and run guided trips." },
  { id: "island-park-res", name: "Island Park Reservoir", cat: "water", season: "year", lat: 44.42, lng: -111.54, drive: "52 min", miles: 47,
    blurb: "Boating, kayaking, and trout fishing in summer. Ice fishing in winter." },
  { id: "henrys-lake", name: "Henry's Lake State Park", cat: "water", season: "summer", lat: 44.62, lng: -111.37, drive: "59 min", miles: 56,
    blurb: "A big, high mountain lake known for trophy trout, with a campground and boat launch." },
  { id: "warm-river", name: "Warm River", cat: "water", season: "summer", lat: 44.12, lng: -111.31, drive: "27 min", miles: 24, gem: true,
    blurb: "A slow, clear river for tubing, picnics, and the Warm River fish-feeding spot. An easy stop after Mesa Falls." },
  { id: "south-fork", name: "South Fork of the Snake (Swan Valley)", cat: "water", season: "summer", lat: 43.456, lng: -111.33, drive: "1 hr 2 min", miles: 58,
    blurb: "Float the canyon, watch for bald eagles, and fish for cutthroat trout. Outfitters in Swan Valley rent rafts and run guided floats." },
  { id: "hunting", name: "Hunting in the Caribou-Targhee", cat: "hunting", season: "year", lat: 44.24, lng: -111.4, drive: "30 min+", miles: 25,
    blurb: "Elk, deer, moose, and upland birds across the national forest around Island Park and Ashton. Licenses, tags, and seasons come from Idaho Fish and Game." },
  { id: "sand-dunes", name: "St. Anthony Sand Dunes", cat: "adventure", season: "summer", lat: 43.9925, lng: -111.8155, drive: "12 min", miles: 8, gem: true, area: "st-anthony-sand-dunes",
    blurb: "Miles of white dunes for ATVs, sandboarding, and kids who just want to run. Egin Lakes beside the dunes is good for a cool-off." },
  { id: "mesa-falls", name: "Upper & Lower Mesa Falls", cat: "adventure", season: "summer", lat: 44.1872, lng: -111.329, drive: "35 min", miles: 30, gem: true, area: "mesa-falls",
    blurb: "A 114-foot waterfall with an accessible boardwalk, on the Mesa Falls Scenic Byway. Pair it with Warm River." },
  { id: "ashton-tetonia", name: "Ashton–Tetonia Rail Trail", cat: "adventure", season: "summer", lat: 44.0717, lng: -111.448, drive: "25 min", miles: 24, area: "ashton-tetonia-trail",
    blurb: "A rail-to-trail through farm country with old trestle bridges and Teton views. Good for bikes of all sizes." },
  { id: "grand-targhee", name: "Grand Targhee Resort", cat: "adventure", season: "year", lat: 43.7878, lng: -110.9581, drive: "1 hr 6 min", miles: 53,
    blurb: "Deep powder in winter, and lift-served hiking and mountain biking in summer, on the quiet side of the Tetons." },
  { id: "jackson-hole-resort", name: "Jackson Hole Mountain Resort", cat: "adventure", season: "year", lat: 43.5875, lng: -110.8279, drive: "1 hr 36 min", miles: 78,
    blurb: "World-famous skiing, and the aerial tram to the top in summer for a big view." },
  { id: "kelly-canyon", name: "Kelly Canyon Ski Area", cat: "adventure", season: "winter", lat: 43.6458, lng: -111.6149, drive: "45 min", miles: 35, gem: true,
    blurb: "A small, affordable local hill with night skiing. A good place for a first ski day." },
  { id: "snowmobile", name: "Snowmobile trails, Island Park & West Yellowstone", cat: "adventure", season: "winter", lat: 44.5, lng: -111.34, drive: "1 hr+", miles: 55,
    blurb: "Hundreds of miles of groomed trails. Rentals and guided Yellowstone snowmobile and snowcoach tours run out of Island Park and West Yellowstone." },
  { id: "bear-world", name: "Yellowstone Bear World", cat: "family", season: "summer", lat: 43.757, lng: -111.893, drive: "22 min", miles: 20, area: "yellowstone-bear-world",
    blurb: "Drive-through wildlife park with bears, elk, and bison, plus bear-cub feedings and kid rides." },
  { id: "grizzly-wolf", name: "Grizzly & Wolf Discovery Center", cat: "family", season: "year", lat: 44.656, lng: -111.099, drive: "1 hr 11 min", miles: 69,
    blurb: "Up-close grizzlies and wolves in West Yellowstone. A guaranteed animal sighting if the park doesn't deliver." },
  { id: "porter-park", name: "Porter Park & carousel, Rexburg", cat: "family", season: "summer", lat: 43.823, lng: -111.79, drive: "15 min", miles: 12,
    blurb: "A big shady park with a restored antique carousel. An easy hour for little kids." },
  { id: "teton-flood", name: "Teton Flood Museum, Rexburg", cat: "family", season: "year", lat: 43.826, lng: -111.788, drive: "15 min", miles: 12,
    blurb: "The story of the 1976 Teton Dam collapse that flooded this valley. A good rainy-day stop with real local history." },
  { id: "idaho-falls-zoo", name: "Idaho Falls Zoo at Tautphaus Park", cat: "family", season: "summer", lat: 43.473, lng: -112.023, drive: "41 min", miles: 41,
    blurb: "A walkable zoo that's just the right size for small kids, inside a big city park." },
  { id: "museum-idaho", name: "Museum of Idaho", cat: "family", season: "year", lat: 43.492, lng: -112.037, drive: "38 min", miles: 39,
    blurb: "Rotating national exhibits plus Idaho history and science. A solid rainy-day plan for all ages." },
  { id: "green-canyon", name: "Green Canyon Hot Springs", cat: "family", season: "year", lat: 43.896, lng: -111.312, drive: "28 min", miles: 23, gem: true,
    blurb: "A family-run hot pool in a quiet canyon. Great after a cold winter day or a long hike." },
  { id: "heise", name: "Heise Hot Springs", cat: "family", season: "year", lat: 43.6487, lng: -111.6857, drive: "39 min", miles: 32,
    blurb: "Hot pools, a summer waterslide, and golf by the Snake River." },
  { id: "menan-buttes", name: "Menan Buttes", cat: "lava", season: "summer", lat: 43.775, lng: -111.97, drive: "27 min", miles: 24, gem: true,
    blurb: "Volcanic cones rising out of the farmland. A short, steep hike to the crater rim with a view of the whole valley." },
  { id: "hells-half-acre", name: "Hell's Half Acre Lava Field", cat: "lava", season: "summer", lat: 43.496, lng: -112.443, drive: "1 hr 7 min", miles: 63,
    blurb: "A lava flow right off I-15 with a short paved trail. A quick taste of lava country." },
  { id: "ebr1", name: "EBR-I Atomic Museum", cat: "lava", season: "summer", lat: 43.513, lng: -112.817, drive: "1 hr 36 min", miles: 97,
    blurb: "The first place electricity was made from nuclear power, in 1951. Free, and right on the way to Craters of the Moon." },
  { id: "craters", name: "Craters of the Moon", cat: "lava", season: "summer", lat: 43.4166, lng: -113.5166, drive: "1 hr 56 min", miles: 117,
    blurb: "Lava flows, cinder cones, and lava tube caves you can walk into. Bring flashlights, closed-toe shoes, and water." },
  { id: "earthquake-lake", name: "Earthquake Lake & Hebgen Lake", cat: "lava", season: "summer", lat: 44.832, lng: -111.428, drive: "1 hr 28 min", miles: 85,
    blurb: "Where a 1959 earthquake dropped a mountain into the Madison River and made a new lake. Visitor center and drowned forest." },
  { id: "rexburg", name: "Rexburg & the Rexburg temples", cat: "towns", season: "year", lat: 43.817, lng: -111.784, drive: "15 min", miles: 14,
    blurb: "Groceries, restaurants, and BYU–Idaho. Both Rexburg temples are 10 to 15 minutes from The Burland." },
  { id: "idaho-falls", name: "Idaho Falls & the River Walk", cat: "towns", season: "year", lat: 43.4955, lng: -112.045, drive: "38 min", miles: 39,
    blurb: "The falls on the Snake River, a paved greenbelt walk, the Idaho Falls temple, the regional airport, and plenty of places to eat." },
  { id: "jackson", name: "Jackson, Wyoming", cat: "towns", season: "year", lat: 43.4799, lng: -110.7624, drive: "1 hr 36 min", miles: 76,
    blurb: "The antler-arch town square, shops, and the National Elk Refuge, with sleigh rides out to the elk in winter." },
  { id: "driggs", name: "Driggs & Victor (Teton Valley)", cat: "towns", season: "year", lat: 43.723, lng: -111.111, drive: "49 min", miles: 44, gem: true,
    blurb: "A small-town stop on the Idaho side of the Tetons, on the way to Grand Targhee and Jackson." },
];

export const PLANS = [
  {
    kicker: "Big day out",
    title: "Yellowstone in a day",
    steps: [
      ["Early", "Leave with packed lunches, through Island Park."],
      ["Next", "Enter at West Yellowstone."],
      ["Mid-morning", "Grand Prismatic Spring before the parking lot fills."],
      ["Midday", "Old Faithful, lunch, and the boardwalks."],
      ["Evening", "Dinner in West Yellowstone, then home."],
    ],
  },
  {
    kicker: "Close to home",
    title: "Dunes, falls & a river",
    steps: [
      ["Morning", "St. Anthony Sand Dunes while the sand is cool."],
      ["Noon", "Picnic at Warm River."],
      ["Afternoon", "Upper and Lower Mesa Falls."],
      ["Evening", "Back to The Burland for dinner and the game room."],
    ],
  },
  {
    kicker: "Little kids & grandparents",
    title: "Easy day, rain or shine",
    steps: [
      ["Morning", "Yellowstone Bear World drive-through."],
      ["Lunch", "Rexburg, then the Porter Park carousel."],
      ["Afternoon", "Teton Flood Museum if it rains, or Menan Buttes if it doesn't."],
      ["Evening", "Green Canyon Hot Springs, then movie night."],
    ],
  },
] as const;

// Rooms from the rental form. Bedroom descriptions are still to come from Orion.
export const ROOMS: { name: string; img?: string; text?: string }[] = [
  { name: "Aspen Ballroom", img: "img-ballroom-wide", text: "Dinners, dancing, programs, and the big family photo." },
  { name: "Game Room", img: "img-game-room", text: "Ping-pong, air hockey, and an arcade corner for kids and teens." },
  { name: "Movie / Play Room", img: "img-media-room", text: "A 20 by 60-foot open floor on the upper level, padded with gymnastics mats and stocked with activities. The place for cousins to burn energy, do cartwheels, or just sprawl out." },
  { name: "Kitchen", img: "img-kitchen-island", text: "A full kitchen built for cooking for a crowd." },
  { name: "Bear Den" },
  { name: "Loft" },
  { name: "Whitetail Room" },
  { name: "Buffalo Herd" },
  { name: "Wolf Den" },
  { name: "Moose Crossing" },
  { name: "Fishing Pond" },
];
