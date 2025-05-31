
// Content filtering utility for detecting inappropriate content
const INAPPROPRIATE_KEYWORDS = [
  // Hate speech and slurs
  'hate', 'nazi', 'terrorist', 'kill yourself', 'die', 'murder',
  // Sexual content (basic keywords)
  'porn', 'nude', 'naked', 'sex', 'sexual', 'xxx', 'explicit',
  // Abusive language
  'fuck you', 'bitch', 'asshole', 'piece of shit', 'retard', 'faggot',
  // Harassment terms
  'stalk', 'harass', 'threaten', 'doxx', 'expose',
  // Spam indicators
  'click here', 'buy now', 'free money', 'make money fast'
];

export const containsInappropriateContent = (text: string): boolean => {
  if (!text) return false;
  
  const lowercaseText = text.toLowerCase();
  
  return INAPPROPRIATE_KEYWORDS.some(keyword => 
    lowercaseText.includes(keyword.toLowerCase())
  );
};

export const getContentWarningMessage = (): string => {
  return "Your content contains language that violates our community guidelines. Please revise your post to ensure it follows our terms of respectful behavior.";
};
