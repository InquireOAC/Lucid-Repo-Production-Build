
// Content filtering utility for detecting inappropriate content
const INAPPROPRIATE_KEYWORDS = [
  // Hate speech and discriminatory slurs
  'hate', 'nazi', 'terrorist', 'kill yourself', 'die', 'murder', 'genocide', 'suicide',
  // Sexual content (basic keywords)
  'porn', 'nude', 'naked', 'sex', 'sexual', 'xxx', 'explicit', 'nsfw', 'erotic',
  // Abusive language and harassment
  'fuck you', 'bitch', 'asshole', 'piece of shit', 'retard', 'faggot', 'cunt', 'whore', 'slut',
  // Harassment and doxxing terms
  'stalk', 'harass', 'threaten', 'doxx', 'expose', 'kill', 'rape', 'assault',
  // Spam indicators
  'click here', 'buy now', 'free money', 'make money fast', 'earn money online', 'get rich quick',
  // Drug and illegal activity references
  'buy drugs', 'sell drugs', 'cocaine', 'heroin', 'meth', 'illegal', 'weapon sales',
  // Violence and threats
  'bomb', 'violence', 'attack', 'hurt', 'harm', 'weapon', 'gun', 'knife'
];

// Enhanced pattern matching for more sophisticated detection
const INAPPROPRIATE_PATTERNS = [
  /\b(f+u+c+k+|s+h+i+t+|d+a+m+n+)\b/gi, // Obfuscated profanity
  /\b(\w*)\s*(kill|murder|die|hurt)\s*(\w*)\b/gi, // Threats with spacing
  /\b(buy|sell|get)\s*(free|cheap|now)\b/gi, // Spam patterns
  /(https?:\/\/[^\s]+)/gi, // URLs (potential spam or phishing)
];

export const containsInappropriateContent = (text: string): boolean => {
  if (!text) return false;
  
  const lowercaseText = text.toLowerCase().trim();
  
  // Remove excessive whitespace and normalize
  const normalizedText = lowercaseText.replace(/\s+/g, ' ');
  
  // Check against keyword list
  const hasInappropriateKeywords = INAPPROPRIATE_KEYWORDS.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
  
  // Check against pattern list
  const hasInappropriatePatterns = INAPPROPRIATE_PATTERNS.some(pattern => 
    pattern.test(normalizedText)
  );
  
  // Additional checks for repeated characters (spam-like behavior)
  const hasExcessiveRepeatedChars = /(.)\1{10,}/.test(normalizedText);
  
  // Check for excessive caps (potential shouting/spam)
  const originalText = text.trim();
  const capsRatio = originalText.length > 10 ? 
    (originalText.match(/[A-Z]/g) || []).length / originalText.length : 0;
  const hasExcessiveCaps = capsRatio > 0.7;
  
  return hasInappropriateKeywords || hasInappropriatePatterns || 
         hasExcessiveRepeatedChars || hasExcessiveCaps;
};

export const getContentWarningMessage = (): string => {
  return "Your content contains language that violates our community guidelines. Please revise your post to ensure it follows our terms of respectful behavior.";
};

// Additional function for content severity scoring (for potential future use)
export const getContentSeverityScore = (text: string): number => {
  if (!text) return 0;
  
  const lowercaseText = text.toLowerCase();
  let severityScore = 0;
  
  // High severity keywords
  const highSeverityWords = ['kill', 'murder', 'terrorist', 'nazi', 'suicide', 'rape'];
  highSeverityWords.forEach(word => {
    if (lowercaseText.includes(word)) severityScore += 10;
  });
  
  // Medium severity keywords  
  const mediumSeverityWords = ['hate', 'threaten', 'harass', 'expose'];
  mediumSeverityWords.forEach(word => {
    if (lowercaseText.includes(word)) severityScore += 5;
  });
  
  // Low severity keywords
  const lowSeverityWords = ['spam', 'buy now', 'click here'];
  lowSeverityWords.forEach(word => {
    if (lowercaseText.includes(word)) severityScore += 2;
  });
  
  return Math.min(severityScore, 100); // Cap at 100
};
