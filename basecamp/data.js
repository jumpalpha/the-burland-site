/* =========================================================
   Burland Basecamp: page data. EDIT THIS FILE to update the page.

   EPISODES: newest first. To publish an episode:
     1. Download the NotebookLM Audio Overview.
     2. Run: scripts/compress-episode.sh <downloaded file> <episode number>
        (makes a small mono MP3, e.g. basecamp/audio/ep01.mp3).
     3. Set audio: "basecamp/audio/ep01.mp3" and status: "live".
   NotebookLM source packs live in basecamp/notebooklm/.
   status "soon" shows the episode as "Coming soon" with no player.

   ATTRACTIONS: drive / miles are ESTIMATES from St. Anthony.
     check: true  = not yet confirmed by Orion (shown normally; this
                    flag is only a to-do marker for us).
     cat:     parks | water | adventure | family | lava | towns | hunting
     season:  summer | winter | year
     gem:     true = "Local favorite" (the things out-of-towners miss)
   ========================================================= */

window.BASECAMP_EPISODES = [
  {
    n: 1,
    title: "Welcome to Basecamp: a reunion week in Eastern Idaho",
    blurb: "The big picture: what's within a day's drive of The Burland, and how to split a reunion week between Yellowstone days and easy close-to-home days.",
    date: "",
    length: "",
    audio: "",
    status: "soon",
    links: ["yellowstone-west", "sand-dunes", "mesa-falls"]
  },
  {
    n: 2,
    title: "Yellowstone in one day, with grandkids",
    blurb: "Leaving early, which geysers are worth the walk, bathroom stops, and getting everyone home for dinner.",
    date: "",
    length: "",
    audio: "",
    status: "soon",
    links: ["yellowstone-west", "old-faithful", "grand-prismatic"]
  },
  {
    n: 3,
    title: "Henry's Fork and the Snake: fishing for beginners and experts",
    blurb: "Where a first-timer can catch something, where the serious fly fishers go, and floating the South Fork.",
    date: "",
    length: "",
    audio: "",
    status: "soon",
    links: ["harriman", "box-canyon", "south-fork"]
  }
];

window.BASECAMP_ATTRACTIONS = [
  /* ---------- National parks ---------- */
  { id: "yellowstone-west", name: "Yellowstone: West Entrance & West Yellowstone", cat: "parks", season: "year", lat: 44.6621, lng: -111.1043, drive: "1 hr 15 min", miles: 70, check: true,
    blurb: "The closest full-service gateway to the park. Gas, food, and the start of the geyser basins. Most park roads are open to cars mid-April through October; winter travel inside is by guided snowmobile or snowcoach." },
  { id: "old-faithful", name: "Old Faithful & Upper Geyser Basin", cat: "parks", season: "summer", lat: 44.4605, lng: -110.8281, drive: "2 hr 15 min", miles: 100, check: true,
    blurb: "Eruptions roughly every 60 to 110 minutes, with flat boardwalks that work for strollers and grandparents." },
  { id: "grand-prismatic", name: "Grand Prismatic Spring", cat: "parks", season: "summer", lat: 44.5251, lng: -110.8382, drive: "2 hr", miles: 95, check: true,
    blurb: "The rainbow hot spring. Walk the Fairy Falls overlook trail for the view from above. Parking fills by mid-morning." },
  { id: "cave-falls", name: "Cave Falls (Yellowstone's quiet corner)", cat: "parks", season: "summer", lat: 44.1438, lng: -111.0175, drive: "1 hr", miles: 40, check: true, gem: true,
    blurb: "A wide waterfall in Yellowstone's Bechler corner, reached from Ashton with no entrance-station crowds. The last stretch is gravel." },
  { id: "grand-teton", name: "Grand Teton National Park (Jenny Lake)", cat: "parks", season: "summer", lat: 43.7504, lng: -110.7271, drive: "2 hr 30 min", miles: 115, check: true,
    blurb: "Jagged peaks, the Jenny Lake shuttle boat, and easy lakeshore walks. Go over Teton Pass through Driggs and Victor." },

  /* ---------- Rivers, lakes & fishing ---------- */
  { id: "harriman", name: "Harriman State Park (Henry's Fork)", cat: "water", season: "year", lat: 44.3367, lng: -111.4689, drive: "55 min", miles: 45, check: true,
    blurb: "Historic ranch on the Henry's Fork's famous Railroad Ranch water. Trumpeter swans, moose, easy trails, and fly fishing." },
  { id: "box-canyon", name: "Box Canyon & Last Chance (Henry's Fork)", cat: "water", season: "summer", lat: 44.4250, lng: -111.3970, drive: "1 hr", miles: 55, check: true,
    blurb: "Some of the most famous fly fishing water in North America. Local fly shops in Last Chance rent gear and run guided trips." },
  { id: "island-park-res", name: "Island Park Reservoir", cat: "water", season: "year", lat: 44.4200, lng: -111.5400, drive: "1 hr", miles: 55, check: true,
    blurb: "Boating, kayaking, and trout fishing in summer. Ice fishing in winter." },
  { id: "henrys-lake", name: "Henry's Lake State Park", cat: "water", season: "summer", lat: 44.6200, lng: -111.3700, drive: "1 hr 20 min", miles: 75, check: true,
    blurb: "A big, high mountain lake known for trophy trout, with a campground and boat launch." },
  { id: "warm-river", name: "Warm River", cat: "water", season: "summer", lat: 44.1200, lng: -111.3100, drive: "40 min", miles: 30, check: true, gem: true,
    blurb: "A slow, clear river for tubing, picnics, and the Warm River fish-feeding spot. An easy stop after Mesa Falls." },
  { id: "south-fork", name: "South Fork of the Snake (Swan Valley)", cat: "water", season: "summer", lat: 43.4560, lng: -111.3300, drive: "1 hr 15 min", miles: 65, check: true,
    blurb: "Float the canyon, watch for bald eagles, and fish for cutthroat trout. Outfitters in Swan Valley rent rafts and run guided floats." },
  { id: "hunting", name: "Hunting in the Caribou-Targhee", cat: "hunting", season: "year", lat: 44.2400, lng: -111.4000, drive: "30 min+", miles: 25, check: true,
    blurb: "Elk, deer, moose, and upland birds across the national forest around Island Park and Ashton. Licenses, tags, and seasons come from Idaho Fish and Game." },

  /* ---------- Adventure ---------- */
  { id: "sand-dunes", name: "St. Anthony Sand Dunes", cat: "adventure", season: "summer", lat: 43.9925, lng: -111.8155, drive: "15 min", miles: 10, check: true, gem: true,
    blurb: "Miles of white dunes for ATVs, sandboarding, and kids who just want to run. Egin Lakes beside the dunes is good for a cool-off." },
  { id: "mesa-falls", name: "Upper & Lower Mesa Falls", cat: "adventure", season: "summer", lat: 44.1872, lng: -111.3290, drive: "45 min", miles: 35, check: true, gem: true,
    blurb: "A 114-foot waterfall with an accessible boardwalk, on the Mesa Falls Scenic Byway. Pair it with Warm River." },
  { id: "ashton-tetonia", name: "Ashton–Tetonia Rail Trail", cat: "adventure", season: "summer", lat: 44.0717, lng: -111.4480, drive: "20 min", miles: 15, check: true,
    blurb: "A rail-to-trail through farm country with old trestle bridges and Teton views. Good for bikes of all sizes." },
  { id: "grand-targhee", name: "Grand Targhee Resort", cat: "adventure", season: "year", lat: 43.7878, lng: -110.9581, drive: "1 hr 15 min", miles: 60, check: true,
    blurb: "Deep powder in winter, and lift-served hiking and mountain biking in summer, on the quiet side of the Tetons." },
  { id: "jackson-hole-resort", name: "Jackson Hole Mountain Resort", cat: "adventure", season: "year", lat: 43.5875, lng: -110.8279, drive: "2 hr 15 min", miles: 105, check: true,
    blurb: "World-famous skiing, and the aerial tram to the top in summer for a big view." },
  { id: "kelly-canyon", name: "Kelly Canyon Ski Area", cat: "adventure", season: "winter", lat: 43.6458, lng: -111.6149, drive: "50 min", miles: 40, check: true, gem: true,
    blurb: "A small, affordable local hill with night skiing. A good place for a first ski day." },
  { id: "snowmobile", name: "Snowmobile trails, Island Park & West Yellowstone", cat: "adventure", season: "winter", lat: 44.5000, lng: -111.3400, drive: "1 hr+", miles: 55, check: true,
    blurb: "Hundreds of miles of groomed trails. Rentals and guided Yellowstone snowmobile and snowcoach tours run out of Island Park and West Yellowstone." },

  /* ---------- Family & rainy day ---------- */
  { id: "bear-world", name: "Yellowstone Bear World", cat: "family", season: "summer", lat: 43.7570, lng: -111.8930, drive: "25 min", miles: 20, check: true,
    blurb: "Drive-through wildlife park with bears, elk, and bison, plus bear-cub feedings and kid rides." },
  { id: "grizzly-wolf", name: "Grizzly & Wolf Discovery Center", cat: "family", season: "year", lat: 44.6560, lng: -111.0990, drive: "1 hr 15 min", miles: 70, check: true,
    blurb: "Up-close grizzlies and wolves in West Yellowstone. A guaranteed animal sighting if the park doesn't deliver." },
  { id: "porter-park", name: "Porter Park & carousel, Rexburg", cat: "family", season: "summer", lat: 43.8230, lng: -111.7900, drive: "15 min", miles: 12, check: true,
    blurb: "A big shady park with a restored antique carousel. An easy hour for little kids." },
  { id: "teton-flood", name: "Teton Flood Museum, Rexburg", cat: "family", season: "year", lat: 43.8260, lng: -111.7880, drive: "15 min", miles: 12, check: true,
    blurb: "The story of the 1976 Teton Dam collapse that flooded this valley. A good rainy-day stop with real local history." },
  { id: "idaho-falls-zoo", name: "Idaho Falls Zoo at Tautphaus Park", cat: "family", season: "summer", lat: 43.4730, lng: -112.0230, drive: "55 min", miles: 50, check: true,
    blurb: "A walkable zoo that's just the right size for small kids, inside a big city park." },
  { id: "museum-idaho", name: "Museum of Idaho", cat: "family", season: "year", lat: 43.4920, lng: -112.0370, drive: "50 min", miles: 50, check: true,
    blurb: "Rotating national exhibits plus Idaho history and science. A solid rainy-day plan for all ages." },
  { id: "green-canyon", name: "Green Canyon Hot Springs", cat: "family", season: "year", lat: 43.8960, lng: -111.3120, drive: "40 min", miles: 35, check: true, gem: true,
    blurb: "A family-run hot pool in a quiet canyon. Great after a cold winter day or a long hike." },
  { id: "heise", name: "Heise Hot Springs", cat: "family", season: "year", lat: 43.6487, lng: -111.6857, drive: "45 min", miles: 40, check: true,
    blurb: "Hot pools, a summer waterslide, and golf by the Snake River." },

  /* ---------- Lava country ---------- */
  { id: "menan-buttes", name: "Menan Buttes", cat: "lava", season: "summer", lat: 43.7750, lng: -111.9700, drive: "30 min", miles: 25, check: true, gem: true,
    blurb: "Volcanic cones rising out of the farmland. A short, steep hike to the crater rim with a view of the whole valley." },
  { id: "hells-half-acre", name: "Hell's Half Acre Lava Field", cat: "lava", season: "summer", lat: 43.4960, lng: -112.4430, drive: "1 hr 15 min", miles: 70, check: true,
    blurb: "A lava flow right off I-15 with a short paved trail. A quick taste of lava country." },
  { id: "ebr1", name: "EBR-I Atomic Museum", cat: "lava", season: "summer", lat: 43.5130, lng: -112.8170, drive: "1 hr 45 min", miles: 95, check: true,
    blurb: "The first place electricity was made from nuclear power, in 1951. Free, and right on the way to Craters of the Moon." },
  { id: "craters", name: "Craters of the Moon", cat: "lava", season: "summer", lat: 43.4166, lng: -113.5166, drive: "2 hr 15 min", miles: 120, check: true,
    blurb: "Lava flows, cinder cones, and lava tube caves you can walk into. Bring flashlights, closed-toe shoes, and water." },
  { id: "earthquake-lake", name: "Earthquake Lake & Hebgen Lake", cat: "lava", season: "summer", lat: 44.8320, lng: -111.4280, drive: "1 hr 45 min", miles: 95, check: true,
    blurb: "Where a 1959 earthquake dropped a mountain into the Madison River and made a new lake. Visitor center and drowned forest." },

  /* ---------- Towns ---------- */
  { id: "rexburg", name: "Rexburg & the Rexburg temples", cat: "towns", season: "year", lat: 43.8170, lng: -111.7840, drive: "15 min", miles: 12, check: true,
    blurb: "Groceries, restaurants, and BYU–Idaho. Both Rexburg temples are 10 to 15 minutes from The Burland." },
  { id: "idaho-falls", name: "Idaho Falls & the River Walk", cat: "towns", season: "year", lat: 43.4955, lng: -112.0450, drive: "50 min", miles: 50, check: true,
    blurb: "The falls on the Snake River, a paved greenbelt walk, the Idaho Falls temple, the regional airport, and plenty of places to eat." },
  { id: "jackson", name: "Jackson, Wyoming", cat: "towns", season: "year", lat: 43.4799, lng: -110.7624, drive: "2 hr", miles: 95, check: true,
    blurb: "The antler-arch town square, shops, and the National Elk Refuge, with sleigh rides out to the elk in winter." },
  { id: "driggs", name: "Driggs & Victor (Teton Valley)", cat: "towns", season: "year", lat: 43.7230, lng: -111.1110, drive: "1 hr", miles: 50, check: true, gem: true,
    blurb: "A small-town stop on the Idaho side of the Tetons, on the way to Grand Targhee and Jackson." }
];
