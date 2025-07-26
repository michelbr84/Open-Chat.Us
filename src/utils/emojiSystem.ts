/**
 * Enhanced Emoji System for Open-Chat.Us
 * Supports emoji autocomplete with :emoji_name: syntax
 */

export interface EmojiData {
  emoji: string;
  name: string;
  aliases: string[];
  category: string;
  keywords: string[];
}

// Comprehensive emoji database organized by categories
export const EMOJI_DATABASE: Record<string, EmojiData[]> = {
  'smileys': [
    { emoji: '😀', name: 'grinning', aliases: ['grinning'], category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
    { emoji: '😃', name: 'smiley', aliases: ['smiley'], category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
    { emoji: '😄', name: 'smile', aliases: ['smile'], category: 'smileys', keywords: ['happy', 'joy', 'laugh'] },
    { emoji: '😁', name: 'grin', aliases: ['grin'], category: 'smileys', keywords: ['happy', 'smile'] },
    { emoji: '😆', name: 'laughing', aliases: ['laughing', 'satisfied'], category: 'smileys', keywords: ['happy', 'laugh', 'joy'] },
    { emoji: '😅', name: 'sweat_smile', aliases: ['sweat_smile'], category: 'smileys', keywords: ['happy', 'sweat', 'nervous'] },
    { emoji: '🤣', name: 'rofl', aliases: ['rofl', 'rolling_on_floor_laughing'], category: 'smileys', keywords: ['laugh', 'lol', 'funny'] },
    { emoji: '😂', name: 'joy', aliases: ['joy'], category: 'smileys', keywords: ['happy', 'laugh', 'tears'] },
    { emoji: '🙂', name: 'slightly_smiling_face', aliases: ['slightly_smiling_face'], category: 'smileys', keywords: ['smile', 'happy'] },
    { emoji: '🙃', name: 'upside_down_face', aliases: ['upside_down_face'], category: 'smileys', keywords: ['silly', 'sarcasm'] },
    { emoji: '😉', name: 'wink', aliases: ['wink'], category: 'smileys', keywords: ['flirt', 'wink'] },
    { emoji: '😊', name: 'blush', aliases: ['blush'], category: 'smileys', keywords: ['happy', 'blush', 'pleased'] },
    { emoji: '😇', name: 'innocent', aliases: ['innocent'], category: 'smileys', keywords: ['angel', 'halo'] },
    { emoji: '🥰', name: 'smiling_face_with_hearts', aliases: ['smiling_face_with_hearts'], category: 'smileys', keywords: ['love', 'hearts', 'happy'] },
    { emoji: '😍', name: 'heart_eyes', aliases: ['heart_eyes'], category: 'smileys', keywords: ['love', 'heart', 'adore'] },
    { emoji: '🤩', name: 'star_struck', aliases: ['star_struck'], category: 'smileys', keywords: ['star', 'amazed'] },
    { emoji: '😘', name: 'kissing_heart', aliases: ['kissing_heart'], category: 'smileys', keywords: ['kiss', 'love', 'heart'] },
    { emoji: '😗', name: 'kissing', aliases: ['kissing'], category: 'smileys', keywords: ['kiss'] },
    { emoji: '☺️', name: 'relaxed', aliases: ['relaxed'], category: 'smileys', keywords: ['happy', 'calm'] },
    { emoji: '😚', name: 'kissing_closed_eyes', aliases: ['kissing_closed_eyes'], category: 'smileys', keywords: ['kiss', 'closed_eyes'] },
    { emoji: '😙', name: 'kissing_smiling_eyes', aliases: ['kissing_smiling_eyes'], category: 'smileys', keywords: ['kiss', 'smile'] },
    { emoji: '😋', name: 'yum', aliases: ['yum'], category: 'smileys', keywords: ['tongue', 'taste', 'delicious'] },
    { emoji: '😛', name: 'stuck_out_tongue', aliases: ['stuck_out_tongue'], category: 'smileys', keywords: ['tongue', 'playful'] },
    { emoji: '😜', name: 'stuck_out_tongue_winking_eye', aliases: ['stuck_out_tongue_winking_eye'], category: 'smileys', keywords: ['tongue', 'wink', 'playful'] },
    { emoji: '🤪', name: 'zany_face', aliases: ['zany_face'], category: 'smileys', keywords: ['crazy', 'silly'] },
    { emoji: '😝', name: 'stuck_out_tongue_closed_eyes', aliases: ['stuck_out_tongue_closed_eyes'], category: 'smileys', keywords: ['tongue', 'playful'] },
    { emoji: '🤑', name: 'money_mouth_face', aliases: ['money_mouth_face'], category: 'smileys', keywords: ['money', 'rich'] },
    { emoji: '🤗', name: 'hugs', aliases: ['hugs'], category: 'smileys', keywords: ['hug', 'embrace'] },
    { emoji: '🤭', name: 'hand_over_mouth', aliases: ['hand_over_mouth'], category: 'smileys', keywords: ['quiet', 'secret'] },
    { emoji: '🤫', name: 'shushing_face', aliases: ['shushing_face'], category: 'smileys', keywords: ['quiet', 'silence'] },
    { emoji: '🤔', name: 'thinking', aliases: ['thinking'], category: 'smileys', keywords: ['think', 'consider'] },
    { emoji: '🤐', name: 'zipper_mouth_face', aliases: ['zipper_mouth_face'], category: 'smileys', keywords: ['quiet', 'silence'] },
    { emoji: '🤨', name: 'raised_eyebrow', aliases: ['raised_eyebrow'], category: 'smileys', keywords: ['suspicious', 'questioning'] },
    { emoji: '😐', name: 'neutral_face', aliases: ['neutral_face'], category: 'smileys', keywords: ['neutral', 'meh'] },
    { emoji: '😑', name: 'expressionless', aliases: ['expressionless'], category: 'smileys', keywords: ['blank', 'neutral'] },
    { emoji: '😶', name: 'no_mouth', aliases: ['no_mouth'], category: 'smileys', keywords: ['quiet', 'silence'] },
    { emoji: '😏', name: 'smirk', aliases: ['smirk'], category: 'smileys', keywords: ['smug', 'confident'] },
    { emoji: '😒', name: 'unamused', aliases: ['unamused'], category: 'smileys', keywords: ['annoyed', 'unimpressed'] },
    { emoji: '🙄', name: 'roll_eyes', aliases: ['roll_eyes'], category: 'smileys', keywords: ['annoyed', 'eye_roll'] },
    { emoji: '😬', name: 'grimacing', aliases: ['grimacing'], category: 'smileys', keywords: ['awkward', 'uncomfortable'] },
    { emoji: '🤥', name: 'lying_face', aliases: ['lying_face'], category: 'smileys', keywords: ['lie', 'pinocchio'] },
    { emoji: '😔', name: 'pensive', aliases: ['pensive'], category: 'smileys', keywords: ['sad', 'thoughtful'] },
    { emoji: '😪', name: 'sleepy', aliases: ['sleepy'], category: 'smileys', keywords: ['tired', 'sleep'] },
    { emoji: '🤤', name: 'drooling_face', aliases: ['drooling_face'], category: 'smileys', keywords: ['drool', 'hungry'] },
    { emoji: '😴', name: 'sleeping', aliases: ['sleeping'], category: 'smileys', keywords: ['sleep', 'zzz'] },
  ],
  'negative': [
    { emoji: '😷', name: 'mask', aliases: ['mask'], category: 'negative', keywords: ['sick', 'ill', 'health'] },
    { emoji: '🤒', name: 'face_with_thermometer', aliases: ['face_with_thermometer'], category: 'negative', keywords: ['sick', 'fever'] },
    { emoji: '🤕', name: 'face_with_head_bandage', aliases: ['face_with_head_bandage'], category: 'negative', keywords: ['hurt', 'injured'] },
    { emoji: '🤢', name: 'nauseated_face', aliases: ['nauseated_face'], category: 'negative', keywords: ['sick', 'nausea'] },
    { emoji: '🤮', name: 'vomiting_face', aliases: ['vomiting_face'], category: 'negative', keywords: ['sick', 'vomit'] },
    { emoji: '🤧', name: 'sneezing_face', aliases: ['sneezing_face'], category: 'negative', keywords: ['sick', 'sneeze'] },
    { emoji: '🥵', name: 'hot_face', aliases: ['hot_face'], category: 'negative', keywords: ['hot', 'heat'] },
    { emoji: '🥶', name: 'cold_face', aliases: ['cold_face'], category: 'negative', keywords: ['cold', 'freeze'] },
    { emoji: '😵', name: 'dizzy_face', aliases: ['dizzy_face'], category: 'negative', keywords: ['dizzy', 'confused'] },
    { emoji: '🤯', name: 'exploding_head', aliases: ['exploding_head'], category: 'negative', keywords: ['mind_blown', 'shocked'] },
    { emoji: '😕', name: 'confused', aliases: ['confused'], category: 'negative', keywords: ['confused', 'unsure'] },
    { emoji: '😟', name: 'worried', aliases: ['worried'], category: 'negative', keywords: ['worried', 'concerned'] },
    { emoji: '🙁', name: 'slightly_frowning_face', aliases: ['slightly_frowning_face'], category: 'negative', keywords: ['sad', 'frown'] },
    { emoji: '☹️', name: 'frowning_face', aliases: ['frowning_face'], category: 'negative', keywords: ['sad', 'frown'] },
    { emoji: '😮', name: 'open_mouth', aliases: ['open_mouth'], category: 'negative', keywords: ['surprised', 'shocked'] },
    { emoji: '😯', name: 'hushed', aliases: ['hushed'], category: 'negative', keywords: ['surprised', 'quiet'] },
    { emoji: '😲', name: 'astonished', aliases: ['astonished'], category: 'negative', keywords: ['shocked', 'amazed'] },
    { emoji: '😳', name: 'flushed', aliases: ['flushed'], category: 'negative', keywords: ['embarrassed', 'surprised'] },
    { emoji: '🥺', name: 'pleading_face', aliases: ['pleading_face'], category: 'negative', keywords: ['pleading', 'sad'] },
    { emoji: '😦', name: 'frowning', aliases: ['frowning'], category: 'negative', keywords: ['sad', 'disappointed'] },
    { emoji: '😧', name: 'anguished', aliases: ['anguished'], category: 'negative', keywords: ['sad', 'pain'] },
    { emoji: '😨', name: 'fearful', aliases: ['fearful'], category: 'negative', keywords: ['scared', 'fear'] },
    { emoji: '😰', name: 'cold_sweat', aliases: ['cold_sweat'], category: 'negative', keywords: ['nervous', 'sweat'] },
    { emoji: '😥', name: 'disappointed_relieved', aliases: ['disappointed_relieved'], category: 'negative', keywords: ['sad', 'disappointed'] },
    { emoji: '😢', name: 'cry', aliases: ['cry'], category: 'negative', keywords: ['sad', 'tears'] },
    { emoji: '😭', name: 'sob', aliases: ['sob'], category: 'negative', keywords: ['sad', 'cry', 'tears'] },
    { emoji: '😱', name: 'scream', aliases: ['scream'], category: 'negative', keywords: ['scared', 'shock'] },
    { emoji: '😖', name: 'confounded', aliases: ['confounded'], category: 'negative', keywords: ['frustrated', 'angry'] },
    { emoji: '😣', name: 'persevere', aliases: ['persevere'], category: 'negative', keywords: ['struggling', 'persevere'] },
    { emoji: '😞', name: 'disappointed', aliases: ['disappointed'], category: 'negative', keywords: ['sad', 'disappointed'] },
    { emoji: '😓', name: 'sweat', aliases: ['sweat'], category: 'negative', keywords: ['tired', 'sweat'] },
    { emoji: '😩', name: 'weary', aliases: ['weary'], category: 'negative', keywords: ['tired', 'exhausted'] },
    { emoji: '😫', name: 'tired_face', aliases: ['tired_face'], category: 'negative', keywords: ['tired', 'exhausted'] },
    { emoji: '🥱', name: 'yawning_face', aliases: ['yawning_face'], category: 'negative', keywords: ['tired', 'bored'] },
    { emoji: '😤', name: 'triumph', aliases: ['triumph'], category: 'negative', keywords: ['frustrated', 'angry'] },
    { emoji: '😡', name: 'rage', aliases: ['rage'], category: 'negative', keywords: ['angry', 'mad'] },
    { emoji: '😠', name: 'angry', aliases: ['angry'], category: 'negative', keywords: ['angry', 'mad'] },
    { emoji: '🤬', name: 'swearing', aliases: ['swearing'], category: 'negative', keywords: ['angry', 'curse'] },
  ],
  'hands': [
    { emoji: '👍', name: 'thumbsup', aliases: ['thumbsup', '+1'], category: 'hands', keywords: ['good', 'approve', 'like'] },
    { emoji: '👎', name: 'thumbsdown', aliases: ['thumbsdown', '-1'], category: 'hands', keywords: ['bad', 'disapprove', 'dislike'] },
    { emoji: '👌', name: 'ok_hand', aliases: ['ok_hand'], category: 'hands', keywords: ['ok', 'perfect'] },
    { emoji: '✌️', name: 'v', aliases: ['v'], category: 'hands', keywords: ['peace', 'victory'] },
    { emoji: '🤞', name: 'crossed_fingers', aliases: ['crossed_fingers'], category: 'hands', keywords: ['luck', 'hope'] },
    { emoji: '🤟', name: 'love_you_gesture', aliases: ['love_you_gesture'], category: 'hands', keywords: ['love', 'rock'] },
    { emoji: '🤘', name: 'metal', aliases: ['metal'], category: 'hands', keywords: ['rock', 'metal'] },
    { emoji: '🤙', name: 'call_me_hand', aliases: ['call_me_hand'], category: 'hands', keywords: ['call', 'phone'] },
    { emoji: '👈', name: 'point_left', aliases: ['point_left'], category: 'hands', keywords: ['point', 'left'] },
    { emoji: '👉', name: 'point_right', aliases: ['point_right'], category: 'hands', keywords: ['point', 'right'] },
    { emoji: '👆', name: 'point_up_2', aliases: ['point_up_2'], category: 'hands', keywords: ['point', 'up'] },
    { emoji: '🖕', name: 'middle_finger', aliases: ['middle_finger'], category: 'hands', keywords: ['rude', 'offensive'] },
    { emoji: '👇', name: 'point_down', aliases: ['point_down'], category: 'hands', keywords: ['point', 'down'] },
    { emoji: '☝️', name: 'point_up', aliases: ['point_up'], category: 'hands', keywords: ['point', 'up'] },
    { emoji: '👏', name: 'clap', aliases: ['clap'], category: 'hands', keywords: ['applause', 'clap'] },
    { emoji: '🙌', name: 'raised_hands', aliases: ['raised_hands'], category: 'hands', keywords: ['celebrate', 'praise'] },
    { emoji: '👐', name: 'open_hands', aliases: ['open_hands'], category: 'hands', keywords: ['open', 'hug'] },
    { emoji: '🤲', name: 'palms_up_together', aliases: ['palms_up_together'], category: 'hands', keywords: ['pray', 'please'] },
    { emoji: '🤝', name: 'handshake', aliases: ['handshake'], category: 'hands', keywords: ['deal', 'agree'] },
    { emoji: '🙏', name: 'pray', aliases: ['pray'], category: 'hands', keywords: ['pray', 'thanks'] },
    { emoji: '✍️', name: 'writing_hand', aliases: ['writing_hand'], category: 'hands', keywords: ['write', 'sign'] },
    { emoji: '💅', name: 'nail_care', aliases: ['nail_care'], category: 'hands', keywords: ['nails', 'beauty'] },
    { emoji: '🤳', name: 'selfie', aliases: ['selfie'], category: 'hands', keywords: ['selfie', 'photo'] },
    { emoji: '💪', name: 'muscle', aliases: ['muscle'], category: 'hands', keywords: ['strong', 'flex'] },
  ],
  'hearts': [
    { emoji: '❤️', name: 'heart', aliases: ['heart'], category: 'hearts', keywords: ['love', 'heart'] },
    { emoji: '🧡', name: 'orange_heart', aliases: ['orange_heart'], category: 'hearts', keywords: ['love', 'orange'] },
    { emoji: '💛', name: 'yellow_heart', aliases: ['yellow_heart'], category: 'hearts', keywords: ['love', 'yellow'] },
    { emoji: '💚', name: 'green_heart', aliases: ['green_heart'], category: 'hearts', keywords: ['love', 'green'] },
    { emoji: '💙', name: 'blue_heart', aliases: ['blue_heart'], category: 'hearts', keywords: ['love', 'blue'] },
    { emoji: '💜', name: 'purple_heart', aliases: ['purple_heart'], category: 'hearts', keywords: ['love', 'purple'] },
    { emoji: '🖤', name: 'black_heart', aliases: ['black_heart'], category: 'hearts', keywords: ['love', 'black'] },
    { emoji: '🤍', name: 'white_heart', aliases: ['white_heart'], category: 'hearts', keywords: ['love', 'white'] },
    { emoji: '🤎', name: 'brown_heart', aliases: ['brown_heart'], category: 'hearts', keywords: ['love', 'brown'] },
    { emoji: '💔', name: 'broken_heart', aliases: ['broken_heart'], category: 'hearts', keywords: ['sad', 'heartbreak'] },
    { emoji: '❣️', name: 'heavy_heart_exclamation', aliases: ['heavy_heart_exclamation'], category: 'hearts', keywords: ['love', 'exclamation'] },
    { emoji: '💕', name: 'two_hearts', aliases: ['two_hearts'], category: 'hearts', keywords: ['love', 'hearts'] },
    { emoji: '💞', name: 'revolving_hearts', aliases: ['revolving_hearts'], category: 'hearts', keywords: ['love', 'revolving'] },
    { emoji: '💓', name: 'heartbeat', aliases: ['heartbeat'], category: 'hearts', keywords: ['love', 'beat'] },
    { emoji: '💗', name: 'heartpulse', aliases: ['heartpulse'], category: 'hearts', keywords: ['love', 'pulse'] },
    { emoji: '💖', name: 'sparkling_heart', aliases: ['sparkling_heart'], category: 'hearts', keywords: ['love', 'sparkle'] },
    { emoji: '💘', name: 'cupid', aliases: ['cupid'], category: 'hearts', keywords: ['love', 'cupid'] },
    { emoji: '💝', name: 'gift_heart', aliases: ['gift_heart'], category: 'hearts', keywords: ['love', 'gift'] },
    { emoji: '💟', name: 'heart_decoration', aliases: ['heart_decoration'], category: 'hearts', keywords: ['love', 'decoration'] },
  ],
  'objects': [
    { emoji: '🔥', name: 'fire', aliases: ['fire'], category: 'objects', keywords: ['hot', 'flame'] },
    { emoji: '⭐', name: 'star', aliases: ['star'], category: 'objects', keywords: ['star', 'favorite'] },
    { emoji: '🌟', name: 'star2', aliases: ['star2'], category: 'objects', keywords: ['star', 'sparkle'] },
    { emoji: '✨', name: 'sparkles', aliases: ['sparkles'], category: 'objects', keywords: ['sparkle', 'magic'] },
    { emoji: '⚡', name: 'zap', aliases: ['zap'], category: 'objects', keywords: ['lightning', 'electric'] },
    { emoji: '💎', name: 'gem', aliases: ['gem'], category: 'objects', keywords: ['diamond', 'precious'] },
    { emoji: '💯', name: '100', aliases: ['100'], category: 'objects', keywords: ['perfect', 'hundred'] },
    { emoji: '🎉', name: 'tada', aliases: ['tada'], category: 'objects', keywords: ['celebrate', 'party'] },
    { emoji: '🎊', name: 'confetti_ball', aliases: ['confetti_ball'], category: 'objects', keywords: ['celebrate', 'party'] },
    { emoji: '🎈', name: 'balloon', aliases: ['balloon'], category: 'objects', keywords: ['party', 'celebrate'] },
    { emoji: '🎁', name: 'gift', aliases: ['gift'], category: 'objects', keywords: ['present', 'gift'] },
    { emoji: '🏆', name: 'trophy', aliases: ['trophy'], category: 'objects', keywords: ['win', 'award'] },
    { emoji: '🥇', name: 'first_place_medal', aliases: ['first_place_medal'], category: 'objects', keywords: ['gold', 'first'] },
    { emoji: '🥈', name: 'second_place_medal', aliases: ['second_place_medal'], category: 'objects', keywords: ['silver', 'second'] },
    { emoji: '🥉', name: 'third_place_medal', aliases: ['third_place_medal'], category: 'objects', keywords: ['bronze', 'third'] },
    { emoji: '🎯', name: 'dart', aliases: ['dart'], category: 'objects', keywords: ['target', 'bullseye'] },
    { emoji: '🎪', name: 'circus_tent', aliases: ['circus_tent'], category: 'objects', keywords: ['circus', 'fun'] },
  ],
};

// Flatten all emojis for search
export const ALL_EMOJIS: EmojiData[] = Object.values(EMOJI_DATABASE).flat();

// Common emoji shortcuts for quick access
export const COMMON_EMOJIS = [
  '❤️', '👍', '👎', '😂', '😢', '😮', '😡', '🎉', '🔥', '💯',
  '👏', '✨', '💪', '🙌', '👌', '🤝', '💝', '🌟', '⚡', '💎'
];

/**
 * Search emojis by name or keyword
 */
export function searchEmojis(query: string, limit: number = 10): EmojiData[] {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: EmojiData[] = [];
  
  for (const emoji of ALL_EMOJIS) {
    // Exact name match (highest priority)
    if (emoji.name === lowerQuery || emoji.aliases.includes(lowerQuery)) {
      results.unshift(emoji);
      continue;
    }
    
    // Name starts with query
    if (emoji.name.startsWith(lowerQuery) || emoji.aliases.some(alias => alias.startsWith(lowerQuery))) {
      results.push(emoji);
      continue;
    }
    
    // Keyword match
    if (emoji.keywords.some(keyword => keyword.includes(lowerQuery))) {
      results.push(emoji);
      continue;
    }
    
    // Name contains query
    if (emoji.name.includes(lowerQuery) || emoji.aliases.some(alias => alias.includes(lowerQuery))) {
      results.push(emoji);
    }
  }
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((emoji, index, self) => 
    self.findIndex(e => e.emoji === emoji.emoji) === index
  );
  
  return uniqueResults.slice(0, limit);
}

/**
 * Find and replace :emoji_name: patterns in text
 */
export function parseEmojiShortcodes(text: string): { content: string; hasEmojis: boolean } {
  const emojiPattern = /:([a-zA-Z0-9_+-]+):/g;
  let hasEmojis = false;
  
  const processedText = text.replace(emojiPattern, (match, name) => {
    const emoji = ALL_EMOJIS.find(e => 
      e.name === name || e.aliases.includes(name)
    );
    
    if (emoji) {
      hasEmojis = true;
      return emoji.emoji;
    }
    
    return match; // Return original if no match found
  });
  
  return { content: processedText, hasEmojis };
}

/**
 * Get emoji by name
 */
export function getEmojiByName(name: string): EmojiData | undefined {
  return ALL_EMOJIS.find(emoji => 
    emoji.name === name || emoji.aliases.includes(name)
  );
}

/**
 * Extract emoji shortcodes from text
 */
export function extractEmojiShortcodes(text: string): string[] {
  const emojiPattern = /:([a-zA-Z0-9_+-]+):/g;
  const matches = [];
  let match;
  
  while ((match = emojiPattern.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Check if text contains emoji shortcodes
 */
export function hasEmojiShortcodes(text: string): boolean {
  return /:([a-zA-Z0-9_+-]+):/.test(text);
}