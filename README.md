# Tabla Practice Tools

Web-based tabla rhythm practice tools with synchronized audio and visual feedback.

## Apps

### Layakari Polyrhythm Trainer (`layakari.html`)

Train polyrhythms defined as N bols over D beats.

- **Three-Layer Audio**: Beat, Bol, and Laghu sounds with independent volume controls
- **Visual Grid**: Blue borders for beats, alternating colors for bols, yellow highlight for current position
- **Examples**: 4:3, 5:4, 3:2 polyrhythms

### Taal Metronome (`taal-metronome.html`)

Practice with custom bol patterns using tabla notation.

- **Bol-based Notation**: Capitals mark subdivisions (TiRKiT = 4 subdivs), dash (-) = silent
- **Preset Patterns**: Teentaal Theka, Bedam Tihai, Jhaptaal Kayda
- **Variable Subdivisions**: Each beat can have different subdivisions

## Live Site

https://ashukuls.github.io/tabla/

## Local Development

```bash
./serve.sh
```

Then open http://localhost:8888/

## Technical Details

- Built with vanilla JavaScript and Web Audio API
- Styled with Tailwind CSS
- High-precision scheduling for drift-free playback
- Mobile-friendly with iOS audio unlock

**iPhone users**: Turn OFF silent mode for audio to work.
