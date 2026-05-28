
import re

def strip_comments(text):
    text = re.sub(r'//.*', '', text)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    return text

def strip_strings(text):
    # Remove single quoted strings
    text = re.sub(r"'.*?'", '""', text)
    # Remove double quoted strings
    text = re.sub(r'".*?"', '""', text)
    # Remove backtick strings
    text = re.sub(r'`.*?`', '""', text, flags=re.DOTALL)
    return text

content = open('src/app/(public)/[slug]/invitation-page.tsx').read()
content = strip_comments(content)
content = strip_strings(content)

stack = []
for i, char in enumerate(content):
    if char == '{':
        stack.append(i)
    elif char == '}':
        if stack:
            stack.pop()
        else:
            print(f'Extra closing brace at index {i}')

if stack:
    print(f'Unclosed brace at index {stack[0]}')
    lines = content[:stack[0]].split('\n')
    print(f'Line number: {len(lines)}')
else:
    print('All braces balanced.')
