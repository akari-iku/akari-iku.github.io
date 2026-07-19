---
title: Is JSON Outdated? The Reasons Why the New LLM-Era Format "TOON" Saves Tokens
description: 'TOON vs JSON: A Token-Efficient Data Format for LLM Applications           ...'
date: '2025-11-27'
tags:
  - ai
  - json
  - toon
lang: en
pair: toon-token-format
source: dev
accent: '#E5007F'
---

<!-- generated from articles/dev/2025-11-27-is-json-outdated-the-reasons-why-the-new-llm-era-format-toon.md by scripts/import-articles.ts - do not edit -->

# TOON vs JSON: A Token-Efficient Data Format for LLM Applications

## Introduction

When working with LLMs, token consumption directly impacts both cost and performance. While JSON has been the standard data exchange format, a new format called **TOON (Token-Oriented Object Notation)** has emerged as a more token-efficient alternative.

This article explores TOON's characteristics and practical applications, with actual measurements and code examples.

## What is TOON?

TOON is a data serialization format designed specifically for LLM applications, developed and released in October 2024.

**Official Repositories:**
- Main: https://github.com/toon-format/toon
- Specification: https://github.com/toon-format/spec

### Key Features

1. **Token Efficiency**: Reduces token count by 30-60% compared to JSON
2. **Structured Validation**: Explicit array length and field definitions
3. **Human Readability**: Maintains clarity while optimizing for tokens
4. **LLM-Friendly**: Designed for seamless integration with language models

## Format Comparison

### JSON (Pretty Print)
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "role": "Admin",
      "status": "Active"
    },
    {
      "id": 2,
      "name": "Bob",
      "role": "User",
      "status": "Inactive"
    },
    {
      "id": 3,
      "name": "Charlie",
      "role": "User",
      "status": "Active"
    }
  ]
}
```

### JSON (Compact)
```json
{"users":[{"id":1,"name":"Alice","role":"Admin","status":"Active"},{"id":2,"name":"Bob","role":"User","status":"Inactive"},{"id":3,"name":"Charlie","role":"User","status":"Active"}]}
```

### TOON Format
```toon
[3,]{id,name,role,status}:
1,Alice,Admin,Active
2,Bob,User,Inactive
3,Charlie,User,Active
```

**Format Structure:**
- `[3,]` - Array length declaration
- `{id,name,role,status}` - Field definitions
- Following lines - CSV-style data rows

## Actual Token Count Measurements

I measured the actual token counts using the [Format Tokenization Exploration tool](https://www.curiouslychase.com/playground/format-tokenization-exploration):

**3-user sample data:**
- Pretty JSON: **98 tokens**
- JSON (compact): **51 tokens**
- YAML: **63 tokens**
- TOON: **39 tokens**
- CSV: **29 tokens**

**Token reduction vs Pretty JSON:** 60.2% (39 vs 98 tokens)
**Token reduction vs Compact JSON:** 23.5% (39 vs 51 tokens)

*Note: These measurements are approximate and may vary depending on the tokenizer used (e.g., GPT-4, Claude). Token counts are also influenced by data structure and content.*

## TOON vs CSV

From the measurements above, you might notice that **CSV is actually more token-efficient than TOON** (29 vs 39 tokens for the sample data).

So why use TOON over CSV?

### TOON's Advantages

1. **Explicit Structure Definition**: `[3,]{id,name,role,status}` clearly defines array length and field names
2. **Built-in Validation**: LLMs can verify data completeness through array length
3. **Self-Documenting**: Field definitions make the data structure explicit
4. **Error Detection**: Missing or extra rows can be detected through length mismatch

### When to Use Each Format

**Use CSV when:**
- Maximum token efficiency is critical
- Data structure is well-known and stable
- Simple tabular data without complex nesting

**Use TOON when:**
- Structure validation is important
- Self-documenting format is valuable
- Working with dynamic or varying data structures
- Need explicit field definitions for LLM parsing

According to the official TOON benchmarks, TOON typically uses 5-10% more tokens than CSV in large datasets, but provides the added benefits of structure validation and explicit field definitions.

## Understanding LLM Performance Claims

The official TOON repository claims improved LLM task performance:
- TOON: 73.9% accuracy
- JSON: 69.7% accuracy

**Important Note:** As of November 2024, these benchmarks come from the official TOON project. There are no peer-reviewed academic papers or third-party validation studies yet, as TOON was only released in October 2024.

I searched for academic research on format efficiency for LLMs but found no published papers specifically comparing TOON, JSON, and CSV for LLM understanding. The current evidence consists of:
- Official project benchmarks
- Developer community feedback
- Anecdotal usage reports

**Take these claims with appropriate skepticism** until independent research validates the performance improvements.

## Python Implementation

### Generating TOON Format

```python
def dict_list_to_toon(data_list, fields=None):
    """Convert list of dictionaries to TOON format"""
    if not data_list:
        return "[0,]{}:"
    
    if fields is None:
        fields = list(data_list[0].keys())
    
    length = len(data_list)
    header = f"[{length},]{{{','.join(fields)}}}:"
    
    rows = []
    for item in data_list:
        row = ','.join(str(item.get(field, '')) for field in fields)
        rows.append(row)
    
    return header + '\n' + '\n'.join(rows)

# Example usage
users = [
    {"id": 1, "name": "Alice", "role": "Admin", "status": "Active"},
    {"id": 2, "name": "Bob", "role": "User", "status": "Inactive"},
    {"id": 3, "name": "Charlie", "role": "User", "status": "Active"}
]

toon_output = dict_list_to_toon(users)
print(toon_output)
```

**Output:**
```toon
[3,]{id,name,role,status}:
1,Alice,Admin,Active
2,Bob,User,Inactive
3,Charlie,User,Active
```

### Parsing TOON Format

```python
import re

def parse_toon(toon_string):
    """Parse TOON format string to list of dictionaries"""
    lines = toon_string.strip().split('\n')
    header = lines[0]
    
    # Parse header: [length,]{field1,field2,...}:
    match = re.match(r'\[(\d+),\]\{([^}]+)\}:', header)
    if not match:
        raise ValueError("Invalid TOON format")
    
    expected_length = int(match.group(1))
    fields = [f.strip() for f in match.group(2).split(',')]
    
    # Parse data rows
    data_rows = lines[1:]
    if len(data_rows) != expected_length:
        raise ValueError(f"Expected {expected_length} rows, got {len(data_rows)}")
    
    result = []
    for row in data_rows:
        values = row.split(',')
        if len(values) != len(fields):
            raise ValueError(f"Field count mismatch: expected {len(fields)}, got {len(values)}")
        result.append(dict(zip(fields, values)))
    
    return result

# Example usage
toon_data = """[3,]{id,name,role,status}:
1,Alice,Admin,Active
2,Bob,User,Inactive
3,Charlie,User,Active"""

parsed_data = parse_toon(toon_data)
print(parsed_data)
```

## Use Cases

### 1. API Responses
Reduce token consumption in LLM-powered API services:

```python
# Traditional JSON response
json_response = {
    "products": [
        {"id": 1, "name": "Product A", "price": 100},
        {"id": 2, "name": "Product B", "price": 200}
    ]
}

# TOON response (more efficient)
toon_response = """[2,]{id,name,price}:
1,Product A,100
2,Product B,200"""
```

### 2. Prompt Engineering
Optimize prompts with large datasets:

```python
prompt = f"""
Analyze the following user data:

{toon_output}

Identify users with 'Active' status.
"""
```

### 3. Database Export
Export database query results in token-efficient format:

```python
import sqlite3

def export_to_toon(db_path, query):
    """Export SQL query results to TOON format"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute(query)
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    
    length = len(rows)
    header = f"[{length},]{{{','.join(columns)}}}:"
    
    data_rows = [','.join(map(str, row)) for row in rows]
    
    conn.close()
    return header + '\n' + '\n'.join(data_rows)
```

## Considerations and Limitations

### When TOON May Not Be Ideal

1. **Nested Structures**: TOON works best with flat, tabular data
2. **Complex Objects**: Deeply nested JSON structures don't translate well
3. **Mixed Data Types**: TOON assumes consistent field structure
4. **Maximum Token Efficiency**: Pure CSV is more efficient for token count alone

### Token Count Variability

Token counts depend on:
- **Tokenizer type** (GPT-4, Claude, Llama, etc.)
- **Data content** (numbers, text, special characters)
- **Data structure** (field names, nesting depth)

Always test with your specific use case and model.

## Conclusion

TOON offers a middle ground between CSV's token efficiency and JSON's structure:

**Strengths:**
- 30-60% token reduction vs pretty-printed JSON
- 23.5% token reduction vs compact JSON
- Explicit structure with validation
- Human-readable format

**Trade-offs:**
- About 5-10% more tokens than pure CSV (official benchmark)
- Limited nesting capability
- Performance claims need independent validation

For LLM applications where token efficiency matters and you need structured data with validation, TOON is worth considering. However, evaluate based on your specific requirements:
- Need maximum efficiency? → Use CSV
- Need structure + reasonable efficiency? → Use TOON
- Need complex nesting? → Stick with JSON

As always, **measure with your actual data and use case** before making the switch.

---

**References:**
- TOON Official Repository: https://github.com/toon-format/toon
- TOON Specification: https://github.com/toon-format/spec
- Format Tokenization Tool: https://www.curiouslychase.com/playground/format-tokenization-exploration

*Note: TOON is a relatively new format (October 2024). Claims about LLM performance improvements are based on official benchmarks and have not yet been independently verified by academic research.*
