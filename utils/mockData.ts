export interface PhotoRank {
  index: number;
  score: number;
  review: string;
  action: string;
}

export interface ReportData {
  id: string;
  profileType: 'instagram' | 'dating' | 'linkedin' | 'whatsapp';
  overallScore: number;
  firstImpression: string[];
  attractiveness: number;
  trustworthiness: number;
  bioQuality: number;
  visualConsistency: number;
  roast: string;
  originalBio: string;
  bioRewrite: string;
  redFlags: string[];
  greenFlags: string[];
  photoRanking: PhotoRank[];
  glowUpPlan: string[];
  screenshotUrl: string;
  isUnlocked: boolean;
}

const INSTAGRAM_TEMPLATES = [
  {
    overallScore: 68,
    firstImpression: [
      "Trying way too hard to look like an influencer",
      "Feed is 90% mirror selfies and gym checks",
      "Gives 'I respond to DMs after 3 business days' energy"
    ],
    attractiveness: 75,
    trustworthiness: 55,
    bioQuality: 40,
    visualConsistency: 80,
    roast: "Bro, your feed looks like a Pinterest board for 'generic urban teenager'. You've got the obligatory sunset photo, the blurry night-out shot where everyone looks like a cryptid, and the gym selfie that scream 'validate my biceps please'. Your follower-to-following ratio is fighting for its life, and your highlights cover covers are doing the absolute most to look aesthetic while saying absolutely nothing.",
    originalBio: "Just a local guy doing local things. 📍 Delhi. DM for collabs.",
    bioRewrite: "🏋️‍♂️ 70% gym, 30% trying to find where I parked my car.\n🍕 Professional pizza critic & sunset watcher.\n📬 Hit me up for bad puns and questionable advice.",
    redFlags: [
      "Using the '📍' emoji for a city everyone already knows you live in",
      "No group photos where you actually look happy",
      "Follower ratio is exactly 1.1:1"
    ],
    greenFlags: [
      "High resolution images (you didn't take these on a toaster)",
      "Vibrant colors in the highlight reels",
      "You actually look like you bathe regularly"
    ],
    photoRanking: [
      { index: 1, score: 85, review: "The outdoor golden hour shot. Good lighting, solid angles.", action: "Make this your primary profile photo." },
      { index: 2, score: 62, review: "The blurry bathroom mirror selfie. Flashes in the mirror are so 2018.", action: "Crop out the bathroom sink or replace with an active shot." },
      { index: 3, score: 70, review: "The group picture at the cafe. You look okay but your friend is outshining you.", action: "Blur the background slightly so you remain the focus." }
    ],
    glowUpPlan: [
      "Purge the mirror selfies. Get a friend to take candid portraits in natural light.",
      "Fix your highlights grid. Make them match a consistent, warm-toned color scheme.",
      "Rewrite that dry bio. 'DM for collabs' works only if you have 10k+ followers, otherwise it's just comedy."
    ]
  },
  {
    overallScore: 82,
    firstImpression: [
      "Actually quite aesthetic, feels genuine",
      "Color grading is on point",
      "Low-key gatekeeping your camera presets"
    ],
    attractiveness: 84,
    attractiveness_label: "Attractive",
    trustworthiness: 80,
    bioQuality: 70,
    visualConsistency: 92,
    roast: "Okay, we get it, you know how to use Lightroom. Every post is color-coded to look like a Wes Anderson film. It's beautiful, sure, but it also feels slightly clinical, like a boutique hotel website. Are you a human or an Instagram theme curation algorithm? Show us a photo where you're eating a messy taco and looking a bit goofy.",
    originalBio: "visuals & coffee • ☕️🍰 • cofe & chill",
    bioRewrite: "☕️ Drinking overpriced lattes for the visual aesthetic.\n📸 Pretending to know how to adjust camera aperture.\n🎨 Curation index: 100/100.",
    redFlags: [
      "Zero photos of you smiling with teeth",
      "Every caption is a single lowercase word or a cryptic emoji",
      "Too many pictures of coffee cups and zero pictures of your actual personality"
    ],
    greenFlags: [
      "Incredible visual palette and layout composition",
      "Very high aesthetic appeal, profile feels premium",
      "Nice highlights organization"
    ],
    photoRanking: [
      { index: 1, score: 90, review: "The portrait looking sideways at a bookstore. Feels very cinematic.", action: "Keep this prominent. Perfect color grading." },
      { index: 2, score: 78, review: "Flatlay of coffee and a book. Looks like a stock photo.", action: "Put a bit of yourself in these frames. Let your hands or outfit show." }
    ],
    glowUpPlan: [
      "Inject some personality. Add a reel or post showing your funny side, not just static models.",
      "Capitalize letters in your bio, it shows you don't fear grammar rules.",
      "Do a photo dump of candid, unedited snaps. It builds trust and makes you approachable."
    ]
  }
];

const DATING_TEMPLATES = [
  {
    overallScore: 54,
    firstImpression: [
      "Fish holder energy, even if there's no fish",
      "Seems like you're hiding your hairline",
      "Profile feels like an application for a gym membership"
    ],
    attractiveness: 60,
    trustworthiness: 70,
    bioQuality: 35,
    visualConsistency: 50,
    roast: "Your first photo is you in dark sunglasses, your second is a group shot where we have to play Where's Waldo to find you, and your third is a car selfie. Are you looking for a date or are you running from the FBI? You're not ugly, but your photo selection is doing an outstanding job of making people swipe left in under two seconds.",
    originalBio: "Just looking for someone to go on adventures with. Hit me up if you want to know more.",
    bioRewrite: "👋 Looking for someone to join me in pretending we're going hiking when we're actually just going to get street food.\n🍕 Let's argue about whether pineapple belongs on pizza.\n🐕 My dog thinks I'm a 10/10, hoping you agree.",
    redFlags: [
      "Wearing sunglasses in the first three photos. We want to see your eyes, not your Oakley sponsorship",
      "Bio is the most generic dating prompt response of all time",
      "Car selfies. Unless you live in your Honda Civic, please stop"
    ],
    greenFlags: [
      "At least you didn't upload photos holding a dead fish",
      "Your dog is cute (and does 80% of the heavy lifting here)",
      "Height is listed (people love honesty)"
    ],
    photoRanking: [
      { index: 1, score: 72, review: "The picture with the dog. Cute, warm, makes you look friendly.", action: "Move this to the #1 spot immediately." },
      { index: 2, score: 45, review: "The gym locker room selfie. Sweaty and dark.", action: "Delete this. Keep gym progress photos for Instagram highlights, not dating apps." },
      { index: 3, score: 58, review: "The group picture at a wedding. You look nice in a suit.", action: "Crop the other people out slightly or place it further down the stack." }
    ],
    glowUpPlan: [
      "Make your first photo a clear, smiling portrait without sunglasses or hats. Let people see your face.",
      "Throw out the 'adventure' bio. Give specific, funny talking points to make starting a conversation easy.",
      "Replace the car selfie with a photo of you doing a hobby (cooking, painting, playing music, sports)."
    ]
  },
  {
    overallScore: 79,
    firstImpression: [
      "Good looking, but maybe a bit player-vibes",
      "Bio is clever but borderline cocky",
      "Probably gets matches but struggles to keep convo going"
    ],
    attractiveness: 85,
    trustworthiness: 65,
    bioQuality: 78,
    visualConsistency: 75,
    roast: "You look like the character in a rom-com who gets dumped in the first 15 minutes so the main character can find true love. The photos are good, but you look like you practice your 'smoldering look' in front of a mirror. Relax those shoulders, smile, and show us you won't ghost us after three dates.",
    originalBio: "I promise I'm nicer than my resting face looks. Let's get drinks.",
    bioRewrite: "🥂 Pros: Can cook a mean carbonara, good listener, tall.\n⚠️ Cons: Will steal your hoodies, takes too long to pick a movie.\n🎯 Let's find the best taco spot in town.",
    redFlags: [
      "RESTING FACE excuse. It's code for 'I don't smile because I think smiling makes me look weak'",
      "Drinks-only invite. Feels low effort",
      "Two mirror selfies in a row"
    ],
    greenFlags: [
      "Excellent jawline and style choices",
      "Clear, high-quality, non-pixelated photos",
      "You have a photo of you laughing naturally, which is highly magnetic"
    ],
    photoRanking: [
      { index: 1, score: 88, review: "The candid laughing shot. Super approachable and attractive.", action: "Make this the opening photo." },
      { index: 2, score: 80, review: "The dress shirt dinner shot. Looks neat and premium.", action: "Use this as the second photo." },
      { index: 3, score: 60, review: "The gym selfie. Good build, but mirror selfie is a bit basic.", action: "Replace with a photo of you outside or doing an activity." }
    ],
    glowUpPlan: [
      "Put the candid, smiling photo first. It boosts match rate by up to 40% compared to smoldering/serious poses.",
      "Add a prompt that invites a response. Give them something easy to comment on (e.g. 'unpopular opinion: ...')",
      "Ensure you have at least one photo with friends so you don't look like a lone wolf."
    ]
  }
];

const LINKEDIN_TEMPLATES = [
  {
    overallScore: 60,
    firstImpression: [
      "Looks like a corporate hostage video",
      "Bio is a alphabet soup of buzzwords",
      "Profile picture is a crop from a wedding party"
    ],
    attractiveness: 65,
    trustworthiness: 75,
    bioQuality: 40,
    visualConsistency: 55,
    roast: "Your headline is 'Synergistic Catalyst & Agile Enthusiast'. Please, we're begging you, speak like a normal human. Your background image is the default blue grid, which says 'I forgot this exists'. Your profile photo has a hand over your shoulder that you clearly cropped out from a club night. Recruiters are swiping past you faster than Tinder users.",
    originalBio: "Highly motivated individual with a passion for driving customer success and delivering cross-functional synergies in fast-paced startup environments.",
    bioRewrite: "💡 Scaling SaaS products & building remote engineering teams.\n💻 Full-Stack Dev (React / Node / Go).\n🚀 Helped scale active users by 180% at my last startup. Let's build something together.",
    redFlags: [
      "Cropped profile photo showing a stray hand or shoulder of an ex-friend",
      "Using more than 5 corporate buzzwords (synergy, catalyst, pivot) in a single sentence",
      "Empty description section except for skills tags"
    ],
    greenFlags: [
      "Experience list is detailed and chronological",
      "You have active recommendations (people tolerate working with you)",
      "Open to work badge is NOT active (makes you look in-demand)"
    ],
    photoRanking: [
      { index: 1, score: 65, review: "Cropped wedding photo. Good expression, but clearly cropped.", action: "Replace with a dedicated headshot in neat casual attire." },
      { index: 2, score: 40, review: "Default background image.", action: "Replace with a customized graphic representing your industry or tech stack." }
    ],
    glowUpPlan: [
      "Get a clean, professional headshot with a solid/neutral background. Natural lighting works best.",
      "Simplify your headline. Tell us exactly what you build, write, or sell, and the results you bring.",
      "Make your summary sound human. Write in the first person ('I build...') instead of the third person."
    ]
  }
];

const WHATSAPP_TEMPLATES = [
  {
    overallScore: 65,
    firstImpression: [
      "Low resolution, probably screenshotted 5 times",
      "Cute but tells me nothing about you",
      "Vibe is 'I don't check WhatsApp often'"
    ],
    attractiveness: 70,
    trustworthiness: 78,
    bioQuality: 50,
    visualConsistency: 60,
    roast: "Your DP is a meme or a quote from an anime. Are you a 14-year-old edgelord or an adult who needs to answer text messages? If it's a photo of you, it's so zoomed out we can't tell if you're a human or a fire hydrant. Your status is 'Hey there! I am using WhatsApp', which is the equivalent of leaving the plastic wrap on a brand new TV.",
    originalBio: "Hey there! I am using WhatsApp.",
    bioRewrite: "🔋 Low battery. Text only if it's about food.\n☕️ Coffee: Active | Energy: Loading...\n✈️ Traveling soon. Expect delayed responses.",
    redFlags: [
      "Default status is still active. It shows zero customization",
      "DP is an anime character, cartoon, or black screen (implies you are in your feelings)",
      "Pixelated image from a screenshot of a screenshot"
    ],
    greenFlags: [
      "Your read receipts are on (you don't play mind games)",
      "Clean profile structure",
      "Simple, no-nonsense setup"
    ],
    photoRanking: [
      { index: 1, score: 70, review: "The anime DP or landscape shot.", action: "Replace with a clear portrait so friends and family can recognize you." }
    ],
    glowUpPlan: [
      "Put up a clear, cheerful profile photo. WhatsApp is for personal connections, let your face show.",
      "Update your status to something funny, personal, or functional (like 'Traveling' or 'Busy').",
      "Turn off the dark, moody quotes. It's time to shine."
    ]
  }
];

export function generateMockReport(
  type: 'instagram' | 'dating' | 'linkedin' | 'whatsapp',
  id?: string
): ReportData {
  const templates = 
    type === 'instagram' ? INSTAGRAM_TEMPLATES :
    type === 'dating' ? DATING_TEMPLATES :
    type === 'linkedin' ? LINKEDIN_TEMPLATES :
    WHATSAPP_TEMPLATES;

  // Pick template based on ID hash or just random
  const seed = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : Math.floor(Math.random() * 100);
  const template = templates[seed % templates.length];

  return {
    id: id || `rep_${Math.random().toString(36).substr(2, 9)}`,
    profileType: type,
    screenshotUrl: `/placeholder_${type}.png`,
    isUnlocked: false, // Default is locked teaser
    ...template
  };
}
