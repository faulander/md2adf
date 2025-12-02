// Common emoji shortnames mapped to their Unicode representation
// This is a subset of common emojis - can be extended as needed
const emojiMap: Record<string, string> = {
  // Smileys & Emotion
  smile: '\u{1F604}',
  laughing: '\u{1F606}',
  blush: '\u{1F60A}',
  smiley: '\u{1F603}',
  relaxed: '\u{263A}',
  smirk: '\u{1F60F}',
  heart_eyes: '\u{1F60D}',
  kissing_heart: '\u{1F618}',
  kissing_closed_eyes: '\u{1F61A}',
  flushed: '\u{1F633}',
  relieved: '\u{1F60C}',
  satisfied: '\u{1F60C}',
  grin: '\u{1F601}',
  wink: '\u{1F609}',
  stuck_out_tongue_winking_eye: '\u{1F61C}',
  stuck_out_tongue_closed_eyes: '\u{1F61D}',
  grinning: '\u{1F600}',
  kissing: '\u{1F617}',
  kissing_smiling_eyes: '\u{1F619}',
  stuck_out_tongue: '\u{1F61B}',
  sleeping: '\u{1F634}',
  worried: '\u{1F61F}',
  frowning: '\u{1F626}',
  anguished: '\u{1F627}',
  open_mouth: '\u{1F62E}',
  grimacing: '\u{1F62C}',
  confused: '\u{1F615}',
  hushed: '\u{1F62F}',
  expressionless: '\u{1F611}',
  unamused: '\u{1F612}',
  sweat_smile: '\u{1F605}',
  sweat: '\u{1F613}',
  disappointed_relieved: '\u{1F625}',
  weary: '\u{1F629}',
  pensive: '\u{1F614}',
  disappointed: '\u{1F61E}',
  confounded: '\u{1F616}',
  fearful: '\u{1F628}',
  cold_sweat: '\u{1F630}',
  persevere: '\u{1F623}',
  cry: '\u{1F622}',
  sob: '\u{1F62D}',
  joy: '\u{1F602}',
  astonished: '\u{1F632}',
  scream: '\u{1F631}',
  tired_face: '\u{1F62B}',
  angry: '\u{1F620}',
  rage: '\u{1F621}',
  triumph: '\u{1F624}',
  sleepy: '\u{1F62A}',
  yum: '\u{1F60B}',
  mask: '\u{1F637}',
  sunglasses: '\u{1F60E}',
  dizzy_face: '\u{1F635}',
  imp: '\u{1F47F}',
  smiling_imp: '\u{1F608}',
  neutral_face: '\u{1F610}',
  no_mouth: '\u{1F636}',
  innocent: '\u{1F607}',
  alien: '\u{1F47D}',
  yellow_heart: '\u{1F49B}',
  blue_heart: '\u{1F499}',
  purple_heart: '\u{1F49C}',
  heart: '\u{2764}',
  green_heart: '\u{1F49A}',
  broken_heart: '\u{1F494}',
  heartbeat: '\u{1F493}',
  heartpulse: '\u{1F497}',
  two_hearts: '\u{1F495}',
  revolving_hearts: '\u{1F49E}',
  cupid: '\u{1F498}',
  sparkling_heart: '\u{1F496}',
  sparkles: '\u{2728}',
  star: '\u{2B50}',
  star2: '\u{1F31F}',
  dizzy: '\u{1F4AB}',
  boom: '\u{1F4A5}',
  collision: '\u{1F4A5}',
  anger: '\u{1F4A2}',
  exclamation: '\u{2757}',
  question: '\u{2753}',
  grey_exclamation: '\u{2755}',
  grey_question: '\u{2754}',
  zzz: '\u{1F4A4}',
  dash: '\u{1F4A8}',
  sweat_drops: '\u{1F4A6}',
  notes: '\u{1F3B6}',
  musical_note: '\u{1F3B5}',
  fire: '\u{1F525}',
  poop: '\u{1F4A9}',

  // Gestures & Body
  thumbsup: '\u{1F44D}',
  '+1': '\u{1F44D}',
  thumbsdown: '\u{1F44E}',
  '-1': '\u{1F44E}',
  ok_hand: '\u{1F44C}',
  punch: '\u{1F44A}',
  fist: '\u{270A}',
  v: '\u{270C}',
  wave: '\u{1F44B}',
  hand: '\u{270B}',
  raised_hand: '\u{270B}',
  open_hands: '\u{1F450}',
  point_up: '\u{261D}',
  point_down: '\u{1F447}',
  point_left: '\u{1F448}',
  point_right: '\u{1F449}',
  raised_hands: '\u{1F64C}',
  pray: '\u{1F64F}',
  point_up_2: '\u{1F446}',
  clap: '\u{1F44F}',
  muscle: '\u{1F4AA}',
  metal: '\u{1F918}',
  eyes: '\u{1F440}',
  ear: '\u{1F442}',
  nose: '\u{1F443}',
  lips: '\u{1F444}',
  tongue: '\u{1F445}',

  // Common Objects
  book: '\u{1F4D6}',
  bookmark: '\u{1F516}',
  books: '\u{1F4DA}',
  pencil: '\u{270F}',
  pencil2: '\u{270F}',
  pen: '\u{1F58A}',
  memo: '\u{1F4DD}',
  briefcase: '\u{1F4BC}',
  file_folder: '\u{1F4C1}',
  calendar: '\u{1F4C5}',
  clipboard: '\u{1F4CB}',
  pushpin: '\u{1F4CC}',
  paperclip: '\u{1F4CE}',
  link: '\u{1F517}',
  email: '\u{1F4E7}',
  envelope: '\u{2709}',
  phone: '\u{260E}',
  telephone: '\u{260E}',
  computer: '\u{1F4BB}',
  desktop_computer: '\u{1F5A5}',
  keyboard: '\u{2328}',
  bulb: '\u{1F4A1}',
  battery: '\u{1F50B}',
  mag: '\u{1F50D}',
  mag_right: '\u{1F50E}',
  lock: '\u{1F512}',
  unlock: '\u{1F513}',
  key: '\u{1F511}',
  hammer: '\u{1F528}',
  wrench: '\u{1F527}',
  gear: '\u{2699}',
  package: '\u{1F4E6}',
  gift: '\u{1F381}',
  bell: '\u{1F514}',
  trophy: '\u{1F3C6}',
  medal: '\u{1F3C5}',

  // Arrows & Symbols
  arrow_up: '\u{2B06}',
  arrow_down: '\u{2B07}',
  arrow_left: '\u{2B05}',
  arrow_right: '\u{27A1}',
  arrow_upper_left: '\u{2196}',
  arrow_upper_right: '\u{2197}',
  arrow_lower_left: '\u{2199}',
  arrow_lower_right: '\u{2198}',
  left_right_arrow: '\u{2194}',
  arrow_up_down: '\u{2195}',
  arrows_clockwise: '\u{1F503}',
  arrows_counterclockwise: '\u{1F504}',
  rewind: '\u{23EA}',
  fast_forward: '\u{23E9}',
  arrow_double_up: '\u{23EB}',
  arrow_double_down: '\u{23EC}',
  arrow_backward: '\u{25C0}',
  arrow_forward: '\u{25B6}',
  white_check_mark: '\u{2705}',
  check: '\u{2714}',
  heavy_check_mark: '\u{2714}',
  x: '\u{274C}',
  negative_squared_cross_mark: '\u{274E}',
  heavy_plus_sign: '\u{2795}',
  heavy_minus_sign: '\u{2796}',
  heavy_multiplication_x: '\u{2716}',
  heavy_division_sign: '\u{2797}',
  warning: '\u{26A0}',
  no_entry: '\u{26D4}',
  no_entry_sign: '\u{1F6AB}',
  information_source: '\u{2139}',

  // Weather & Nature
  sunny: '\u{2600}',
  cloud: '\u{2601}',
  umbrella: '\u{2614}',
  snowflake: '\u{2744}',
  zap: '\u{26A1}',
  cyclone: '\u{1F300}',
  rainbow: '\u{1F308}',
  ocean: '\u{1F30A}',
  earth_africa: '\u{1F30D}',
  earth_americas: '\u{1F30E}',
  earth_asia: '\u{1F30F}',
  sun_with_face: '\u{1F31E}',
  moon: '\u{1F319}',
  full_moon: '\u{1F315}',
  new_moon: '\u{1F311}',

  // Time
  hourglass: '\u{231B}',
  hourglass_flowing_sand: '\u{23F3}',
  watch: '\u{231A}',
  alarm_clock: '\u{23F0}',
  stopwatch: '\u{23F1}',
  timer_clock: '\u{23F2}',

  // Status indicators (commonly used in Jira/Confluence)
  rocket: '\u{1F680}',
  checkered_flag: '\u{1F3C1}',
  construction: '\u{1F6A7}',
  rotating_light: '\u{1F6A8}',
  sos: '\u{1F198}',
  red_circle: '\u{1F534}',
  orange_circle: '\u{1F7E0}',
  yellow_circle: '\u{1F7E1}',
  green_circle: '\u{1F7E2}',
  blue_circle: '\u{1F535}',
  purple_circle: '\u{1F7E3}',
  white_circle: '\u{26AA}',
  black_circle: '\u{26AB}',
};

// Reverse mapping: Unicode to shortname
const unicodeToShortname: Record<string, string> = {};
for (const [shortname, unicode] of Object.entries(emojiMap)) {
  if (!unicodeToShortname[unicode]) {
    unicodeToShortname[unicode] = shortname;
  }
}

/**
 * Get Unicode emoji from shortname
 */
export function getEmojiUnicode(shortname: string): string | undefined {
  const normalized = shortname.toLowerCase().replace(/^:|:$/g, '');
  return emojiMap[normalized];
}

/**
 * Get shortname from Unicode emoji
 */
export function getEmojiShortname(unicode: string): string | undefined {
  return unicodeToShortname[unicode];
}

/**
 * Check if a shortname is a valid emoji
 */
export function isValidEmoji(shortname: string): boolean {
  const normalized = shortname.toLowerCase().replace(/^:|:$/g, '');
  return normalized in emojiMap;
}

/**
 * Get all available emoji shortnames
 */
export function getAllEmojiShortnames(): string[] {
  return Object.keys(emojiMap);
}

/**
 * Replace emoji shortnames in text with Unicode
 */
export function replaceEmojiShortnames(text: string): string {
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortname: string) => {
    const unicode = getEmojiUnicode(shortname);
    return unicode || match;
  });
}

/**
 * Replace Unicode emojis in text with shortnames
 */
export function replaceUnicodeEmojis(text: string): string {
  let result = text;
  for (const [unicode, shortname] of Object.entries(unicodeToShortname)) {
    result = result.replaceAll(unicode, `:${shortname}:`);
  }
  return result;
}

export { emojiMap };
