// Text carried over from the original guide-reunion.html and guide-wedding.html pages.
export interface Guide { slug: string; title: string; lede: string; sections: { h: string; items: string[] }[]; timeline: string[] }

export const REUNION_GUIDE: Guide = {
  slug: "guide-reunion",
  title: "Family Reunion Planning Guide",
  lede: "A simple, step-by-step plan for a reunion your family will talk about for generations.",
  sections: [
    { h: "Start 9 to 12 months out", items: [
      "Pick a core planning team of 3 to 5 people and give each one a job: dates, money, food, activities, communication.",
      "Send a short poll with 3 candidate weekends. Summer fills first, so lock the date before you lock the schedule.",
      "Check the Burland availability calendar before you poll, so every option on the poll is actually open.",
      "Send a request through the booking planner to hold your date. We confirm by hand and add it to the calendar.",
    ] },
    { h: "Set the budget and how it is shared", items: [
      "Decide whether the cost is split per family, per head, or covered by a reunion fund. The cost splitter tool does the math.",
      "Count kids and adults separately. Many families charge little or nothing for young children.",
      "Collect money early and keep a simple shared spreadsheet that everyone can see.",
      "Budget a cushion of about 10 percent for surprises.",
    ] },
    { h: "Head count and sleeping", items: [
      "Ask each family for a head count and the number of nights they plan to stay.",
      "The Burland sleeps 40+ on site, so most families can stay under one roof. Plan beds by household, not by person.",
      "Put grandparents and light sleepers on the quietest floor and keep the kids together near the gaming area.",
      "Ask guests to bring their own pillows and towels if you want to keep costs low.",
    ] },
    { h: "Food plan", items: [
      "The full kitchen is yours. Choose one: potluck, assigned meals by family, or a hired caterer.",
      "Assign each family one meal, so everyone cooks once and relaxes the rest of the weekend. The meal planner tool builds the schedule.",
      "Collect food allergies and dietary needs on your sign-up sheet.",
      "Plan a big Saturday dinner in the ballroom and a simple, early Sunday brunch.",
      "Make a shopping list per meal and decide who buys what before anyone arrives.",
    ] },
    { h: "Activities for every age", items: [
      "Build in one big group outing, such as a day trip to Yellowstone.",
      "Offer optional activities: the St. Anthony Sand Dunes, floating the river, bowling, hiking, and the waterfalls.",
      "Keep free time. The best reunion moments are usually unplanned.",
      "Plan an evening activity that works for all ages: a talent show, family trivia, old photo slideshow, or storytelling.",
      "Give older kids and teens a role, such as photographer, game leader, or cook helper.",
    ] },
    { h: "Make it memorable", items: [
      "Print a family tree poster and let everyone add to it.",
      "Ask each family to bring 5 photos for a slideshow or a wall display.",
      "Record short interviews with the oldest family members.",
      "Take one big group photo in the ballroom early, before everyone is tired.",
      "Give each household a small keepsake, such as a printed recipe card or a family photo.",
    ] },
  ],
  timeline: [
    "9 to 12 months: date, team, budget, hold the venue.",
    "6 months: send the save-the-date and open sign-ups.",
    "3 months: final head count, meal assignments, activity plan.",
    "1 month: confirm travel, shopping lists, and the weekend schedule.",
    "1 week: send a reminder with address, arrival times, and what to bring.",
    "After: send the photos and a thank you, and set the date for next time.",
  ],
};

export const WEDDING_GUIDE: Guide = {
  slug: "guide-wedding",
  title: "Wedding Planning Guide",
  lede: "A clear, calm plan for the day you have been waiting for.",
  sections: [
    { h: "Start 12 to 18 months out", items: [
      "Agree on a guest count range and a total budget first. Everything else follows from those two numbers.",
      "Check the availability calendar and send a request through the booking planner to hold your date. We confirm by hand.",
      "Visit in person if you can. Ask for a site visit through the contact page.",
      "Choose a rough season and day of the week. Weekdays and shoulder seasons can lower costs.",
    ] },
    { h: "Budget", items: [
      "Split the budget into big buckets: venue, food, photography, flowers and decor, music, attire, and a cushion.",
      "Set aside about 10 percent for the unexpected.",
      "See the pricing page for venue rates and payment policies.",
      "Decide early who is contributing and how, so there are no surprises later.",
    ] },
    { h: "Guest list and lodging", items: [
      "Build an A list and a B list. Send invitations in waves.",
      "The Burland has on-site sleeping, so your closest family and the wedding party can stay together.",
      "Offer a short list of nearby lodging for other guests.",
      "Track RSVPs and dietary needs in one shared sheet.",
    ] },
    { h: "Using the space", items: [
      "The ballroom suits a ceremony and reception in the same room, or a ceremony in one room and dinner in another.",
      "Walk the building with your photographer and pick two or three photo spots in advance.",
      "Plan your flow: arrival, ceremony, photos, dinner, toasts, dancing, send-off.",
      "Ask about setup and cleanup times so your vendors know when they can arrive and leave.",
      "Check alcohol, decor, and music rules with us before you buy anything.",
    ] },
    { h: "Food and drink", items: [
      "Choose a caterer or plan a family-style meal. A full kitchen is available.",
      "Book your caterer as early as possible, since good ones fill up.",
      "Plan a cake or dessert table, a coffee and water station, and a late-night snack.",
      "Confirm allergies with your caterer in writing.",
    ] },
    { h: "Vendors and details", items: [
      "Book photography, music, and flowers right after the date is confirmed.",
      "Create a one-page day-of timeline and share it with every vendor.",
      "Name one trusted person as the day-of point of contact, so you are not answering questions.",
      "Pack an emergency kit: safety pins, tape, stain remover, snacks, pain reliever, phone chargers.",
    ] },
  ],
  timeline: [
    "12 to 18 months: budget, guest count, date held.",
    "9 to 12 months: photographer, caterer, music.",
    "6 months: invitations designed, lodging plan, attire.",
    "3 months: send invitations, finalize menu and decor.",
    "1 month: final head count, seating, day-of timeline.",
    "1 week: confirm every vendor and walk through the venue.",
  ],
};
