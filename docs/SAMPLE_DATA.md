# Sample Compositions

Seed data for the database. Use the structured format for Firebase storage.

## Sample Compositions JSON

```json
[
  {
    "meta": {
      "title": "Teentaal Theka",
      "taal": "Teentaal",
      "tempo": 60,
      "description": "The basic theka for Teentaal, the most common 16-beat cycle.",
      "author": "Traditional",
      "tags": ["theka", "beginner", "teentaal"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Dhin"] }, { "bols": ["Dhin"] }, { "bols": ["Dha"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Dhin"] }, { "bols": ["Dhin"] }, { "bols": ["Dha"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Tin"] }, { "bols": ["Tin"] }, { "bols": ["Ta"] }] },
      { "beats": [{ "bols": ["Ta"] }, { "bols": ["Dhin"] }, { "bols": ["Dhin"] }, { "bols": ["Dha"] }] }
    ]
  },
  {
    "meta": {
      "title": "Jhaptaal Theka",
      "taal": "Jhaptaal",
      "tempo": 50,
      "description": "The basic theka for Jhaptaal, a 10-beat cycle (2+3+2+3).",
      "author": "Traditional",
      "tags": ["theka", "beginner", "jhaptaal"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Dhin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Tin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Dhin"] }, { "bols": ["Na"] }] }
    ]
  },
  {
    "meta": {
      "title": "Rupak Theka",
      "taal": "Rupak",
      "tempo": 55,
      "description": "7-beat cycle with khaali on sam. Divided 3+2+2.",
      "author": "Traditional",
      "tags": ["theka", "beginner", "rupak"]
    },
    "rows": [
      { "beats": [{ "bols": ["Tin"] }, { "bols": ["Tin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }] }
    ]
  },
  {
    "meta": {
      "title": "Ektaal Theka",
      "taal": "Ektaal",
      "tempo": 45,
      "description": "12-beat cycle commonly used in dhrupad and khayal.",
      "author": "Traditional",
      "tags": ["theka", "beginner", "ektaal"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Dhin"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ge"] }] },
      { "beats": [{ "bols": ["Ti"] }, { "bols": ["Ra"] }] },
      { "beats": [{ "bols": ["Ke"] }, { "bols": ["Ta"] }] },
      { "beats": [{ "bols": ["Tun"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Ka"] }, { "bols": ["Ta"] }] }
    ]
  },
  {
    "meta": {
      "title": "Dadra Theka",
      "taal": "Dadra",
      "tempo": 80,
      "description": "Light 6-beat cycle for semi-classical music.",
      "author": "Traditional",
      "tags": ["theka", "beginner", "dadra", "light"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Dhin"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Tin"] }, { "bols": ["Na"] }] }
    ]
  },
  {
    "meta": {
      "title": "Keherwa Theka",
      "taal": "Keherwa",
      "tempo": 90,
      "description": "8-beat cycle popular in folk and light classical.",
      "author": "Traditional",
      "tags": ["theka", "beginner", "keherwa", "folk"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ge"] }, { "bols": ["Na"] }, { "bols": ["Ti"] }] },
      { "beats": [{ "bols": ["Na"] }, { "bols": ["Ke"] }, { "bols": ["Dhin"] }, { "bols": ["Na"] }] }
    ]
  },
  {
    "meta": {
      "title": "Teentaal Kayda 1",
      "taal": "Teentaal",
      "tempo": 60,
      "description": "Basic kayda (compositional theme) for Teentaal.",
      "author": "Traditional",
      "tags": ["kayda", "intermediate", "teentaal"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Dha"] }, { "bols": ["Ge"] }] },
      { "beats": [{ "bols": ["Na"] }, { "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Dha"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Dha"] }, { "bols": ["Ge"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }, { "bols": ["Ge"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Ta"] }, { "bols": ["Ti"] }, { "bols": ["Ta"] }, { "bols": ["Ke"] }] },
      { "beats": [{ "bols": ["Na"] }, { "bols": ["Ta"] }, { "bols": ["Ti"] }, { "bols": ["Ta"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Dha"] }, { "bols": ["Ge"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }, { "bols": ["Ge"] }, { "bols": ["Na"] }] }
    ]
  },
  {
    "meta": {
      "title": "Simple Tukda",
      "taal": "Teentaal",
      "tempo": 70,
      "description": "A simple tukda (fixed composition) ending with tihai.",
      "author": "Traditional",
      "tags": ["tukda", "beginner", "teentaal", "tihai"]
    },
    "rows": [
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Ti"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Dha"] }, { "bols": ["Ge"] }, { "bols": ["Na"] }] },
      { "beats": [{ "bols": ["Dha"] }, { "bols": ["Ti"] }, { "bols": ["Dha"] }, { "bols": ["Ge"] }] },
      { "beats": [{ "bols": ["Dhin"] }, { "bols": ["Na"] }, { "bols": ["Ge"] }, { "bols": ["Na"] }] }
    ]
  }
]
```

## Seeding Script

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getDb } from './firebase/config';

const SAMPLE_COMPOSITIONS = [...]; // From above

async function seedDatabase() {
  const db = getDb();
  const timestamp = new Date().toISOString();

  for (const comp of SAMPLE_COMPOSITIONS) {
    await addDoc(collection(db, 'compositions'), {
      ...comp,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    console.log('Added:', comp.meta.title);
  }
}
```
