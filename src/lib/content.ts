// Site copy and data. Local facts are sourced in burland-local-facts.md (side-session notes) and SOURCES below.

export interface Photo { src: string; alt: string; w: number; h: number; group: "Ballroom" | "Kitchen & dining" | "Lounges" | "Suites" | "Games & media" | "Restoration" | "Area" }

const L = (src: string, alt: string, group: Photo["group"], w = 1600, h = 1067): Photo => ({ src, alt, group, w, h });

export const PHOTOS: Photo[] = [
  L("img-ballroom-chandeliers", "Ballroom with crystal chandeliers and long dinner tables", "Ballroom"),
  L("img-ballroom-tables", "Ballroom tables set with linens beside the stacked-wood wall", "Ballroom"),
  L("img-ballroom-wide", "Wide view of the ballroom ready for a celebration", "Ballroom"),
  L("img-ballroom-dinner-setup", "Ballroom set for a family dinner", "Ballroom"),
  L("img-wood-stack-wall", "Stacked firewood feature wall in the ballroom", "Ballroom"),
  L("img-ballroom-bench", "Rustic bench along the ballroom wall", "Ballroom"),
  L("img-table-centerpiece", "Table centerpiece from the decor collection", "Ballroom", 1200, 1600),
  L("img-kitchen-island", "Large kitchen island ready for group cooking", "Kitchen & dining"),
  L("img-kitchen-steel", "Stainless steel prep kitchen", "Kitchen & dining"),
  L("img-coffee-bar", "Coffee bar station", "Kitchen & dining"),
  L("img-dining-area", "Dining area with seating for a crowd", "Kitchen & dining", 1600, 1088),
  L("img-lounge-upper", "Upstairs lounge with sectionals overlooking the ballroom", "Lounges"),
  L("img-lounge-barn-doors", "Lounge with sliding barn doors", "Lounges"),
  L("img-suite-living-room", "Family suite living room", "Suites"),
  L("img-suite-kitchenette", "Suite kitchenette", "Suites"),
  L("img-suite-bedroom", "Suite bedroom", "Suites"),
  L("img-suite-two-beds", "Suite with two beds", "Suites"),
  L("img-suite-bath", "Suite bathroom", "Suites"),
  L("img-game-room", "Game room for kids and teens", "Games & media"),
  L("img-game-room-air-hockey", "Air hockey table in the game room", "Games & media"),
  L("img-game-room-pingpong", "Ping-pong table in the game room", "Games & media"),
  L("img-arcade-corner", "Arcade corner", "Games & media"),
  L("img-media-room", "Media room for movie night", "Games & media"),
  L("img-restoration-roof", "Roof work during the restoration", "Restoration", 1400, 1050),
  L("img-restoration-facade", "The 1912 brick facade during restoration", "Restoration", 1400, 1867),
  L("img-restoration-hall-balcony", "Hall and balcony during restoration", "Restoration", 1400, 1050),
  L("img-restoration-hall", "The main hall mid-restoration", "Restoration", 1400, 1050),
  L("img-restoration-room", "A room mid-restoration", "Restoration", 1400, 1867),
  L("img-area-river", "A river winding through Eastern Idaho", "Area", 1200, 2133),
  L("img-area-waterfall", "Waterfall in the Eastern Idaho backcountry", "Area", 1200, 2133),
];

export const photo = (src: string) => {
  const p = PHOTOS.find((x) => x.src === src);
  if (!p) throw new Error("unknown photo " + src);
  return p;
};

export interface Attraction {
  slug: string;
  name: string;
  short: string;
  drive: string;
  driveMinutes: number;
  season: string;
  img?: string;
  summary: string;
  body: string[];
  tips: string[];
  sources: string[];
  goodFor: string[];
}

// Drive times are estimates from sourced road distances. [CONFIRM IN GOOGLE MAPS] before launch.
export const ATTRACTIONS: Attraction[] = [
  {
    slug: "st-anthony-sand-dunes",
    name: "St. Anthony Sand Dunes",
    short: "Sand Dunes",
    drive: "About 15 minutes",
    driveMinutes: 15,
    season: "Best late spring through fall. Big dunes close January 1 to April 1 for wintering wildlife.",
    img: "img-area-river",
    summary: "About 10,600 acres of white quartz sand, with some dunes rising around 400 feet, just 8 miles west of town.",
    body: [
      "Ask anyone in St. Anthony what to do with a free afternoon and you'll hear about the dunes. The Bureau of Land Management manages about 10,600 acres of clear, shifting quartz sand here, and some of the dunes climb to roughly 400 feet. That is a lot of hill for a sled, a sandboard, or a pair of tired legs.",
      "The sand has an interesting backstory. Geologists trace it to river sediment from the Henry's Fork and the bed of an ancient Ice Age lake, carried by the wind until it piled up against the Juniper Buttes, a cluster of old volcanic hills.",
      "Riders come from all over for the OHV riding, and families come for the hiking, horseback riding, wildlife watching, and swimming at Egin Lakes. If your crew is bringing machines, every OHV needs a whip flag mounted at least 8 feet off the ground, and motorized travel stays on open sand or marked routes.",
    ],
    tips: [
      "Winter closure: the big dunes west of Egin Lakes Campground close January 1 through sunrise April 1, and the surrounding areas close until May 1. It protects winter range for elk, mule deer, and moose.",
      "BLM charges a day-use fee. Check the current amount before you go.",
      "Egin Lakes Campground has 48 sites if part of your group wants to camp a night.",
      "Bring water, sunscreen, and closed-toe shoes. Midday sand gets hot in July and August.",
    ],
    sources: ["https://www.blm.gov/visit/st-anthony-sand-dunes", "https://science.nasa.gov/earth/earth-observatory/st-anthony-sand-dunes-idaho-46100/"],
    goodFor: ["Kids", "Teens", "ATV and UTV riders", "Photographers"],
  },
  {
    slug: "yellowstone",
    name: "Yellowstone National Park",
    short: "Yellowstone",
    drive: "A little over an hour to the West Entrance",
    driveMinutes: 70,
    season: "West Entrance roads are open to cars roughly mid-April through early November. Check NPS for exact dates.",
    summary: "Take US-20 north through Ashton and Island Park, over Targhee Pass, and you're at Yellowstone's West Entrance.",
    body: [
      "The drive is half the fun. US-20 runs north from St. Anthony through Ashton and Island Park and crosses Targhee Pass into West Yellowstone, Montana. It's roughly 60 miles of pine forest, river views, and the occasional moose by the road.",
      "From the West Entrance, the geyser basins around Old Faithful are within reach for a full day trip, so most families leave after an early breakfast and roll back into The Burland in time for a late dinner together.",
    ],
    tips: [
      "Leave early in July and August. Entrance lines build by mid-morning.",
      "Pack lunches from the Burland kitchen. Food inside the park is limited and spread out.",
      "Give wildlife plenty of room. Bison are bigger and faster than they look.",
    ],
    sources: ["https://en.wikipedia.org/wiki/U.S._Route_20_in_Idaho", "https://www.nps.gov/yell/planyourvisit/hours.htm"],
    goodFor: ["Everyone", "Grandparents (lots of boardwalks)", "Wildlife fans"],
  },
  {
    slug: "mesa-falls",
    name: "Upper and Lower Mesa Falls",
    short: "Mesa Falls",
    drive: "About 40 minutes",
    driveMinutes: 40,
    season: "Visitor center open roughly mid-May to early October. Winter visits are by snowmobile or skis.",
    img: "img-area-waterfall",
    summary: "Upper Mesa Falls drops about 114 feet across a roughly 200-foot-wide ledge. Lower Mesa Falls adds another 65.",
    body: [
      "Mesa Falls is one of the few big falls on the Henry's Fork that was never dammed, so you get the full roar. Upper Mesa Falls tumbles about 114 feet and stretches roughly 200 feet across. A short boardwalk takes you right to the viewing decks, which makes it an easy outing for grandparents and little ones.",
      "The falls sit along the Mesa Falls Scenic Byway, which runs nearly 30 miles from Ashton through the Caribou-Targhee National Forest. Stop at Big Falls Inn, an early-1900s lodge that the Forest Service now runs as a visitor center, then pull over at the Lower Mesa Falls overlook on the way back.",
    ],
    tips: [
      "Pair it with Harriman State Park for a full day.",
      "Mornings have the best light on Upper Mesa Falls and smaller crowds.",
    ],
    sources: ["https://visitidaho.org/things-to-do/road-trips/mesa-falls-scenic-byway/", "https://en.wikipedia.org/wiki/Big_Falls_Inn"],
    goodFor: ["Everyone", "Grandparents", "Photographers"],
  },
  {
    slug: "henrys-fork",
    name: "Henry's Fork of the Snake River",
    short: "Henry's Fork",
    drive: "Right through town",
    driveMinutes: 2,
    season: "Fishing and floating are best late spring through early fall.",
    img: "img-area-river",
    summary: "One of the West's famous trout rivers runs right through St. Anthony.",
    body: [
      "The Henry's Fork flows right through St. Anthony, and anglers know it as serious trout water. Upstream, the river winds about 8 miles through the Railroad Ranch section of Harriman State Park, which draws fly fishers from around the world and is considered some of the most challenging dry-fly water in the country.",
      "Closer to home, the paved Henry's Fork Greenway follows the river near Bridge Street, and in summer locals cool off at the Sand Bar, a sandy swimming spot just east of Keefer Park. Lower stretches of the river near town are friendly for beginner paddlers and lazy floats.",
    ],
    tips: [
      "Grab an Idaho fishing license online before you arrive.",
      "Ask a local outfitter about shuttles if you want to float a section of the river.",
    ],
    sources: ["https://www.eastidahonews.com/2019/02/we-are-east-idaho-st-anthony/", "https://visitidaho.org/?p=44864"],
    goodFor: ["Anglers", "Swimmers", "Paddlers", "Evening walks"],
  },
  {
    slug: "harriman-state-park",
    name: "Harriman State Park",
    short: "Harriman",
    drive: "About 50 minutes",
    driveMinutes: 50,
    season: "Year-round. Summer hiking and fishing, winter cross-country skiing.",
    summary: "The old Harriman family Railroad Ranch, inside an 11,000-acre wildlife refuge.",
    body: [
      "The Harriman family's Railroad Ranch was donated to Idaho in 1965 and helped launch the state park system. Today it sits within an 11,000-acre wildlife refuge with trumpeter swans, moose, and elk, plus the historic ranch buildings and miles of easy trails.",
    ],
    tips: ["The Island Park Community Trail runs about 23 miles between Harriman and Henry's Lake State Park if your group likes to bike."],
    sources: ["https://en.wikipedia.org/wiki/Harriman_State_Park_(Idaho)"],
    goodFor: ["Wildlife fans", "Bikers", "Easy hikes"],
  },
  {
    slug: "ashton-tetonia-trail",
    name: "Ashton-Tetonia Trail",
    short: "Rail Trail",
    drive: "About 20 minutes to the Ashton trailhead",
    driveMinutes: 20,
    season: "Spring through fall.",
    summary: "A 29.6-mile rail trail across historic trestles over Fall River, Conant Creek, and Bitch Creek.",
    body: [
      "This trail follows an old Union Pacific rail grade about 29.6 miles from Ashton to Tetonia. The grade is gentle, the views of the Tetons are big, and the old trestles over Fall River, Conant Creek, and Bitch Creek are the highlights.",
    ],
    tips: ["Do a short out-and-back from Ashton with younger kids."],
    sources: ["https://www.traillink.com/trail/ashton-tetonia-trail/"],
    goodFor: ["Bikers", "Walkers", "Teens"],
  },
  {
    slug: "yellowstone-bear-world",
    name: "Yellowstone Bear World",
    short: "Bear World",
    drive: "About 25 minutes",
    driveMinutes: 25,
    season: "Roughly mid-May to mid-October.",
    summary: "A drive-through wildlife park just south of Rexburg. Bears out the window, guaranteed.",
    body: ["Yellowstone Bear World is a drive-through wildlife park about 5 miles south of Rexburg off US-20. It's a reliable hit with little kids and a great rainy-afternoon backup plan."],
    tips: ["Check their site for bottle-feeding times with the cubs."],
    sources: ["https://visitidaho.org/things-to-do/wildlife-parks-zoos/yellowstone-bear-world/"],
    goodFor: ["Little kids", "Rainy days"],
  },
  {
    slug: "winter",
    name: "Winter in Fremont County",
    short: "Winter Fun",
    drive: "Varies",
    driveMinutes: 45,
    season: "December through March.",
    summary: "Island Park's hundreds of miles of groomed snowmobile trail, Kelly Canyon skiing, and snowy Mesa Falls.",
    body: [
      "Winter is when The Burland feels coziest, and off-season rates make it a smart time for a family getaway. Island Park has one of Idaho's largest groomed snowmobile trail networks, with hundreds of miles of trail. Kelly Canyon, near Ririe, has about 26 runs for skiers and snowboarders, and Mesa Falls turns into a frozen wonder you can reach by snowmobile or skis.",
      "In town, the Henry's Fork Greenway doubles as a cross-country ski trail when the snow is good.",
    ],
    tips: ["Off-season weeknights start at $800, with no minimum stay."],
    sources: ["https://www.fremontcountyid.gov/193/Snowmobiling", "https://en.wikipedia.org/wiki/Kelly_Canyon"],
    goodFor: ["Snowmobilers", "Skiers", "Cozy weekends"],
  },
];

export const DRIVE_TIMES = [
  { place: "Rexburg and both Rexburg temples", time: "About 15 minutes" },
  { place: "Ashton", time: "About 15 to 20 minutes" },
  { place: "Idaho Falls and Idaho Falls Regional Airport (IDA)", time: "About 40 to 45 minutes" },
  { place: "Mesa Falls", time: "About 40 minutes" },
  { place: "Yellowstone West Entrance", time: "A little over an hour" },
  { place: "Teton Valley (Driggs and Tetonia)", time: "About an hour" },
  { place: "Jackson Hole Airport (JAC)", time: "About 2 hours" },
];

export const TOWN_FACTS = [
  { k: "1890", v: "Around when C.H. Moon settled here and named the town after St. Anthony Falls in Minnesota." },
  { k: "1893", v: "Fremont County was created, and St. Anthony became the county seat." },
  { k: "1899", v: "The railroad reached town, and downtown boomed." },
  { k: "1912", v: "The Burland building went up in downtown St. Anthony." },
];

export const REVIEWS = [
  { text: "A family reunion group praised the size and setting. They had room for several families plus the kids, and got to pick huckleberries, hike, and swim nearby.", who: "Family reunion group" },
  { text: "A group of 17 said the space felt elegant and spacious, with plenty of kitchen room and comfortable beds. A wedding photographer in the group added that it's a beautifully lit space for formal events too.", who: "Group of 17" },
  { text: "A returning guest said their family loves staying at The Burland, calling St. Anthony the perfect small town with plenty to do for young kids.", who: "Returning guest" },
];

export const FAQS: { q: string; a: string; tag: "booking" | "stay" | "events" | "area" }[] = [
  { tag: "booking", q: "How does booking work?", a: "Pick your dates in our booking planner and you'll see an instant estimate. Send it to us and we'll confirm your date personally, usually within one business day. We then email a short rental details form and your agreement through SignNow. Your date is reserved once the agreement is signed and the payment due at signing is received. Nothing is booked automatically." },
  { tag: "booking", q: "What does it cost?", a: "Off-season (October through April) is $800 a night Monday through Thursday and $1,000 a night Friday through Sunday, with holiday nights at $1,300. Peak season (May through September) is $1,200 a weeknight and $1,500 a weekend night. Off-season weekdays can also be rented by the hour. We confirm every total in writing." },
  { tag: "booking", q: "Is there a minimum stay?", a: "Off-season weeknights have no minimum. Off-season weekends need 2 nights and holidays need 3. Every peak-season stay has a 2-night minimum." },
  { tag: "booking", q: "What are the payment terms?", a: "50% is due when you book and the rest is due 90 days before you arrive. There's also a $1,000 refundable security deposit. After your stay you get $750 back if there's no damage, since $250 covers cleaning." },
  { tag: "booking", q: "How far ahead should we book?", a: "Summer weekends go first, especially during Yellowstone season and around Pioneer Days in late July. Reach out 6 to 12 months ahead for peak dates." },
  { tag: "booking", q: "Can we tour The Burland first?", a: "Yes, and we encourage it. Request a visit through our contact page and we'll find a time that works." },
  { tag: "stay", q: "How many people can stay overnight?", a: "The Burland sleeps 40+ on site across private family suites, so most families fit under one roof." },
  { tag: "events", q: "How many guests can The Burland hold?", a: "Up to 130 guests in the building at one time, with seating for weddings of up to about 100. Overnight, it sleeps 40+." },
  { tag: "stay", q: "Can we cook our own food?", a: "Absolutely. The full kitchen is yours and it's set up for big-group cooking. Cook together, do a potluck, or bring a caterer. We don't provide catering." },
  { tag: "stay", q: "What are check-in and check-out times?", a: "Check-in begins at 3:00 p.m. and check-out is 11:00 a.m." },
  { tag: "stay", q: "Is it good for grandparents and little kids?", a: "Yes. The Burland is designed for all ages and the wedding spaces are ADA accessible. Kids get their own game room with ping-pong, air hockey, and an arcade corner. Tell us about any specific accessibility needs and we'll do our best to help." },
  { tag: "events", q: "How many guests can attend a wedding?", a: "Wedding seating is up to about 100 guests, and the building holds up to 130 at one time." },
  { tag: "events", q: "Are tables and chairs included?", a: "Yes. Tables and chairs come with every rental, no package needed. The decor packages add linens, centerpieces, and, with the Deluxe package, staff setup." },
  { tag: "events", q: "Can we bring our own vendors?", a: "Yes. We have a flexible vendor policy, so you can bring the caterer, photographer, and DJ you love." },
  { tag: "events", q: "Is alcohol allowed?", a: "Alcohol can be served with approval. There's a $200 alcohol fee, and the rules are covered in your rental agreement." },
  { tag: "events", q: "How close are the Rexburg temples?", a: "Both Rexburg temples are about 15 minutes away, so a temple sealing in the morning and a celebration at The Burland that afternoon is easy." },
  { tag: "area", q: "How far is Yellowstone?", a: "Yellowstone's West Entrance is a little over an hour's drive north on US-20, through Ashton and Island Park." },
  { tag: "area", q: "What is there to do nearby?", a: "Plenty. The St. Anthony Sand Dunes are about 15 minutes away, the Henry's Fork runs through town, and Mesa Falls, Harriman State Park, the Ashton-Tetonia Trail, and Yellowstone Bear World are all an easy drive." },
];

export const SAMPLE_WEEKEND = [
  { when: "Friday evening", title: "Arrive and settle in", text: "Families roll in after 3:00, claim their suites, and gather for a welcome dinner while the kids discover the game room." },
  { when: "Saturday morning", title: "Pick your adventure", text: "Head up US-20 for a Yellowstone day, or stay close with the sand dunes 15 minutes away and Mesa Falls under an hour away." },
  { when: "Saturday afternoon", title: "Dunes, river, or downtime", text: "Sled the dunes, cool off at the Sand Bar on the Henry's Fork, or nap. Nobody's judging." },
  { when: "Saturday evening", title: "The big dinner", text: "Everyone around the ballroom tables, then games, stories, and a slideshow of old photos while the teens take over the arcade." },
  { when: "Sunday morning", title: "Brunch, photos, goodbyes", text: "One more meal together, a family photo under the chandeliers, and the kind of goodbye that takes two hours." },
];
