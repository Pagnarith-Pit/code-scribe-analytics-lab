
export const hints = {
  1: `Here's a gentle nudge to get you started:

Think about the problem step by step:
1. You need to split the text into individual words
2. You need to clean each word (remove punctuation, convert to lowercase)
3. You need to count how many times each word appears
4. You need to store these counts in a dictionary

Start by creating a function called count_words() that takes a string parameter.

Try using Python's built-in string methods like .split(), .lower(), and .strip().

For removing punctuation, you might want to look at the string module or use string methods like .replace().`,

  2: `Here's a more direct approach with specific guidance:

Structure your function like this:

def count_words(text):
    # Step 1: Handle empty string
    if not text:
        return {}
    
    # Step 2: Convert to lowercase and split into words
    words = text.lower().split()
    
    # Step 3: Clean each word (remove punctuation)
    # You can use string.punctuation or manually remove common punctuation
    
    # Step 4: Count words using a dictionary
    word_count = {}
    for word in cleaned_words:
        # Update the count for each word
    
    return word_count

Key hints:
- Use import string and string.punctuation to remove punctuation
- Or use str.translate() with str.maketrans() for punctuation removal
- Use word_count.get(word, 0) + 1 to handle counting`,

  3: `Here's the complete solution with detailed explanation:

import string

def count_words(text):
    """
    Count word frequencies in a text string.
    
    Args:
        text (str): Input text to analyze
        
    Returns:
        dict: Dictionary with words as keys and counts as values
    """
    # Handle empty string case
    if not text.strip():
        return {}
    
    # Convert to lowercase for case-insensitive counting
    text = text.lower()
    
    # Remove punctuation using string.translate()
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    
    # Split into words
    words = text.split()
    
    # Count word frequencies
    word_count = {}
    for word in words:
        if word:  # Skip empty strings
            word_count[word] = word_count.get(word, 0) + 1
    
    return word_count

# Test the function
if __name__ == "__main__":
    test_cases = [
        "Hello world! Hello Python world.",
        "The quick brown fox jumps over the lazy dog",
        "",
        "Python! Python? Python."
    ]
    
    for test in test_cases:
        result = count_words(test)
        print(f"Input: '{test}'")
        print(f"Output: {result}")
        print()

Key concepts explained:
1. string.punctuation contains all common punctuation marks
2. str.maketrans('', '', string.punctuation) creates a translation table to remove punctuation
3. dict.get(key, default) safely gets a value or returns default if key doesn't exist
4. We check 'if word' to skip any empty strings that might result from splitting`
};
