
/**
 * Check if the dream content naturally contains characters/people
 */
export const dreamContainsCharacters = (dreamContent: string): boolean => {
  const characterKeywords = [
    'person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'children',
    'friend', 'family', 'mother', 'father', 'sister', 'brother', 'parent',
    'stranger', 'crowd', 'group', 'someone', 'everybody', 'anyone',
    'he', 'she', 'they', 'him', 'her', 'them', 'his', 'hers', 'their',
    'character', 'figure', 'individual', 'human', 'being'
  ];
  
  const lowerContent = dreamContent.toLowerCase();
  return characterKeywords.some(keyword => lowerContent.includes(keyword));
};
