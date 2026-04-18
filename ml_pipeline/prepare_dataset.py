#!/usr/bin/env python3
"""
Prepare Mal-API-2019 Dataset
Merges API sequences and labels into a single CSV file
"""

import pandas as pd
from pathlib import Path

def prepare_malapi_dataset():
    """Merge API sequences and labels into CSV format"""

    print("\n" + "="*70)
    print("MAL-API-2019 DATASET PREPARATION")
    print("="*70)

    # Paths
    data_dir = Path(__file__).parent / 'data'
    api_file = data_dir / 'archive' / 'mal-api-2019' / '1000_calls.txt'
    labels_file = data_dir / 'archive' / 'labels.txt'
    output_file = data_dir / 'raw' / 'malapi2019.csv'

    # Check if files exist
    if not api_file.exists():
        print(f"\n❌ ERROR: API sequences file not found at {api_file}")
        return False

    if not labels_file.exists():
        print(f"\n❌ ERROR: Labels file not found at {labels_file}")
        return False

    print(f"\n[OK] Found API sequences: {api_file.name}")
    print(f"[OK] Found labels: {labels_file.name}")

    # Read API sequences
    print("\n📖 Reading API sequences...")
    with open(api_file, 'r', encoding='utf-8') as f:
        api_sequences = [line.strip() for line in f if line.strip()]

    print(f"✓ Loaded {len(api_sequences)} API sequences")

    # Read labels
    print("\n📖 Reading labels...")
    with open(labels_file, 'r', encoding='utf-8') as f:
        labels = [line.strip() for line in f if line.strip()]

    print(f"✓ Loaded {len(labels)} labels")

    # Verify counts match
    if len(api_sequences) != len(labels):
        print(f"\n❌ ERROR: Mismatch in counts!")
        print(f"   API sequences: {len(api_sequences)}")
        print(f"   Labels: {len(labels)}")
        return False

    print(f"✓ Counts match: {len(api_sequences)} samples")

    # Create DataFrame
    print("\n🔨 Creating DataFrame...")
    df = pd.DataFrame({
        'api_calls': api_sequences,
        'family': labels
    })

    # Display statistics
    print("\n📊 Dataset Statistics:")
    print(f"   Total samples: {len(df)}")
    print(f"   Unique families: {df['family'].nunique()}")
    print("\n   Family distribution:")
    family_counts = df['family'].value_counts()
    for family, count in family_counts.items():
        percentage = count/len(df)*100
        print(f"      {family:.<20} {count:>6} samples ({percentage:>5.1f}%)")

    # Check for empty sequences
    empty_count = (df['api_calls'].str.len() == 0).sum()
    if empty_count > 0:
        print(f"\n⚠️  Found {empty_count} empty API sequences - removing...")
        df = df[df['api_calls'].str.len() > 0].reset_index(drop=True)
        print(f"✓ Remaining samples: {len(df)}")

    # Save to CSV
    print(f"\n💾 Saving to {output_file.name}...")
    df.to_csv(output_file, index=False)

    # Verify saved file
    file_size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"✓ Saved successfully!")
    print(f"   File size: {file_size_mb:.2f} MB")
    print(f"   Location: {output_file}")

    # Display sample
    print("\n📋 Sample data (first 3 rows):")
    print("="*70)
    for idx, row in df.head(3).iterrows():
        api_preview = row['api_calls'][:100] + "..." if len(row['api_calls']) > 100 else row['api_calls']
        print(f"\nRow {idx + 1}:")
        print(f"  Family: {row['family']}")
        print(f"  APIs: {api_preview}")

    print("\n" + "="*70)
    print("✅ DATASET PREPARATION COMPLETE!")
    print("="*70)
    print("\n📌 Next steps:")
    print("   1. Train models: python src/train.py")
    print()

    return True


if __name__ == "__main__":
    prepare_malapi_dataset()
