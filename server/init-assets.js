const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, 'public/frames');
const audioDir = path.join(__dirname, 'public/audio');
const uploadsDir = path.join(__dirname, 'public/uploads');
const generatedDir = path.join(__dirname, 'public/generated');

// Ensure directories exist
[framesDir, audioDir, uploadsDir, generatedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Helper to run command
const runCmd = (cmd) => {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Failed to run: ${cmd}`, err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const createFrames = async () => {
  console.log('Generating frame templates using FFmpeg...');
  
  // Frame 1: Pink border (#EC4899)
  const cmd1 = `ffmpeg -y -f lavfi -i "color=c=black@0:s=1080x1920:d=1" -vf "drawbox=x=20:y=20:w=1040:h=1880:color=0xEC4899:t=30" -vframes 1 "${path.join(framesDir, 'frame_1.png')}"`;
  
  // Frame 2: Purple border (#A855F7)
  const cmd2 = `ffmpeg -y -f lavfi -i "color=c=black@0:s=1080x1920:d=1" -vf "drawbox=x=20:y=20:w=1040:h=1880:color=0xA855F7:t=30" -vframes 1 "${path.join(framesDir, 'frame_2.png')}"`;
  
  // Frame 3: Blue border (#3B82F6)
  const cmd3 = `ffmpeg -y -f lavfi -i "color=c=black@0:s=1080x1920:d=1" -vf "drawbox=x=20:y=20:w=1040:h=1880:color=0x3B82F6:t=30" -vframes 1 "${path.join(framesDir, 'frame_3.png')}"`;

  const f1 = await runCmd(cmd1);
  const f2 = await runCmd(cmd2);
  const f3 = await runCmd(cmd3);

  if (f1 && f2 && f3) {
    console.log('Frames generated successfully in public/frames.');
  } else {
    console.log('Could not generate frames via FFmpeg. Generating basic SVG/HTML mock files or fallback text files.');
    // Write simple text/base64 placeholders or log warnings
    // Fallback: If FFmpeg is missing, the server will skip overlaying or overlaying will be bypassed.
  }
};

const createAudio = async () => {
  // Create a silent audio track or copy one if FFmpeg is available
  // Generating a silent 5-second MP3 using FFmpeg
  console.log('Generating placeholder silent background music...');
  const cmdAudio = `ffmpeg -y -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 5 -c:a libmp3lame "${path.join(audioDir, 'bg_music.mp3')}"`;
  const success = await runCmd(cmdAudio);
  if (success) {
    console.log('Silent bg_music.mp3 generated in public/audio.');
  } else {
    console.log('Could not generate silent audio using FFmpeg.');
  }
};

const main = async () => {
  await createFrames();
  await createAudio();
  console.log('Asset initialization complete.');
};

main();
