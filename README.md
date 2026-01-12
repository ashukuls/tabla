# Layakari Polyrhythm Trainer

A web-based tabla polyrhythm training application with synchronized audio and visual feedback.

## Features

- **Polyrhythm Engine**: Train any polyrhythm defined as N bols over D beats
- **Three-Layer Audio System**:
  - Beat: Low-frequency thump sound on every main beat
  - Bol: Mid-frequency bell-like pluck on every bol
  - Laghu: Quiet tick on every grid block
- **Individual Volume Controls**: Mix beat, bol, and laghu sounds independently
- **Dynamic Visual Grid**:
  - Blue borders mark the start of each beat
  - Alternating background colors group bols
  - Teal dots indicate bol positions
  - Purple dots show beat+bol coincidences
  - Yellow highlight shows current playback position
- **Responsive Design**: Works on desktop and mobile devices
- **Mobile-Friendly Audio**: Advanced audio unlock mechanism for iOS and strict mobile browsers
  - **⚠️ iPhone users**: You MUST turn off silent mode (flip the switch on the left side - no orange showing) for audio to work

## Publishing to GitHub Pages

1. **Create a new repository** on GitHub (or use an existing one)

2. **Add and commit the files**:
   ```bash
   git add index.html README.md
   git commit -m "Add Layakari Polyrhythm Trainer"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings**
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select **main** branch
   - Click **Save**

4. **Access your app**:
   - Your app will be available at: `https://ashukuls.github.io/tabla/`
   - It may take a few minutes for the site to go live

## Usage

1. **Set Parameters**:
   - **Bols (N)**: Number of tabla bols in the pattern
   - **Beats (D)**: Number of beats in the pattern
   - **Tempo**: Speed in beats per minute (BPM)

2. **Adjust Volume Mix**:
   - Use the three sliders to balance Beat, Bol, and Laghu sounds
   - This helps focus on different aspects of the rhythm

3. **Play**:
   - Click "Play" to start the rhythm
   - Watch the yellow highlight move across the grid in sync with the audio
   - Click "Stop" to pause

4. **Update Pattern**:
   - Change N, D, or tempo values
   - Click "Update Pattern" to regenerate the grid

## Examples

- **4 bols over 3 beats** (4:3): Classic polyrhythm
- **5 bols over 4 beats** (5:4): More complex pattern
- **3 bols over 2 beats** (3:2): Simple hemiola

## Technical Details

- Built with vanilla JavaScript and Web Audio API
- Styled with Tailwind CSS
- Uses high-precision scheduling for drift-free playback
- Single HTML file for easy deployment
