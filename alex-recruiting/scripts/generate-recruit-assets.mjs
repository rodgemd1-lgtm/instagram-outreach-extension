#!/usr/bin/env node
/**
 * Generate recruit page visual assets using fal.ai
 * - Nano Banana Pro for images
 * - Kling 3.0 for image-to-video
 *
 * Usage: FAL_KEY=xxx node scripts/generate-recruit-assets.mjs
 */

import { fal } from "@fal-ai/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

const OUTPUT_DIR = join(process.cwd(), "public", "recruit", "generated");

// ─── Image Prompts ──────────────────────────────────────────────

const IMAGE_ASSETS = [
  {
    id: "hero-action",
    filename: "hero-action.png",
    prompt: `Photorealistic sports photography of a massive 6'4" 285-pound high school football offensive lineman wearing a crimson red jersey number 79, executing a devastating pancake block during a Friday night football game. Shot from turf level at 15 degrees upward angle with a Canon EOS R3 and 70-200mm f/2.0 lens at 1/1600s ISO 6400. The lineman is positioned slightly right of center, driving through his opponent with violent hand placement and churning legs. Frozen turf particles and rubber pellets spray from the impact. Dramatic stadium lights create a bright halo rim light on the helmet and shoulder pads from behind. Breath vapor visible in cold night air. The face is completely obscured by the helmet facemask and deep shadow. Background is a bokeh blur of stadium lights, scoreboard glow, and distant crowd silhouettes. Color palette: deep blacks, crimson red jersey pops, warm tungsten stadium light highlights. Friday night lights atmosphere. ESPN-quality sports action photography.`,
    aspect_ratio: "16:9",
    resolution: "2K",
  },
  {
    id: "film-section-bg",
    filename: "film-bg.png",
    prompt: `Photorealistic cinematic photograph of a suburban Wisconsin high school football stadium at dusk during pre-game warmups. Shot from press box elevation with a Sony A1 and 24-70mm f/2.8 at 1/250s ISO 3200. The field is lit by warm tungsten stadium lights cutting through a low ground fog that hugs the 50-yard line. Empty aluminum bleachers reflect blue-hour ambient light. A few scattered players in dark warm-up gear are small figures on the field, barely visible through the fog. The sky transitions from deep navy blue at the top to a warm amber glow at the horizon. Intentionally desaturated and low-contrast for use as a background with dark overlay. Cool blue shadows in the stands, warm tungsten highlights on the field. Atmospheric, moody, cinematic. No text or graphics.`,
    aspect_ratio: "16:9",
    resolution: "1K",
  },
  {
    id: "training-weight-room",
    filename: "training-deadlift.png",
    prompt: `Photorealistic sports photography of a 285-pound teenage athlete performing a 405-pound conventional deadlift at the top of the pull in an industrial training facility. Shot from a low three-quarter angle with a Nikon Z9 and 35mm f/1.4 lens at 1/800s ISO 5000. Single dramatic overhead light source creates chiaroscuro lighting — the lifter is sculpted by harsh directional light from above while the surrounding gym fades into deep shadow. Chalk dust particles float in the light beam. The athlete wears a plain black t-shirt and red shorts, face obscured by downward angle and shadow. Four 45-pound plates clearly visible on each side of a deadlift bar with knurled grip. Rubber gym floor, iron plates, no machines visible — raw, stripped-down strength training environment. A thin red LED accent strip runs along the baseboards, casting a subtle crimson glow. Solitary, focused, disciplined atmosphere. No other people in frame.`,
    aspect_ratio: "16:9",
    resolution: "2K",
  },
  {
    id: "character-team-unity",
    filename: "character-huddle.png",
    prompt: `Photorealistic sports photography shot from inside a tight sideline team huddle during a high school football game at night. Shot with a Canon EOS R5 and 16mm f/2.0 lens at 1/500s ISO 8000. The camera is at shoulder height, looking slightly upward through a circle of 8-10 players in crimson red football jerseys. Helmets are off, held at sides. Arms are interlocked around shoulders. The players are backlit by stadium lights creating dramatic rim lighting on their shoulder pads and the edges of their jerseys. Faces are in deep shadow, only jaw lines and helmet straps visible. Warm breath vapor rises from the group into the cold night air. The red jerseys are the dominant color against the black night sky and dark sideline. Shallow depth of field — the closest players are sharp, the far side of the huddle falls into soft focus. Intimate, unified, team-first atmosphere. Friday night lights energy.`,
    aspect_ratio: "16:9",
    resolution: "1K",
  },
  {
    id: "athleticism-discus",
    filename: "fit-discus.png",
    prompt: `Photorealistic sports photography of a muscular 285-pound teenage athlete in a red track and field singlet releasing a discus throw at a high school spring track meet. Shot from ground level with a Sony A9 III and 400mm f/2.8 lens at 1/2000s ISO 3200. The athlete is captured at the moment of release — full hip rotation, extended arm, the discus a frozen blur leaving the hand. The athlete's build is clearly that of a football lineman — thick legs, broad shoulders, powerful frame — but the movement shows explosive rotational athleticism. Overcast daylight creates soft, even lighting with no harsh shadows. The track surface and throwing circle are visible at ground level. Background is a shallow depth-of-field blur of green grass, chain-link fence, and distant bleachers. The red singlet is the dominant color element. Face is obscured by motion blur and the angle of the throw. Athletic power and multi-sport versatility.`,
    aspect_ratio: "16:9",
    resolution: "1K",
  },
];

// ─── Generate Images ────────────────────────────────────────────

async function generateImage(asset) {
  console.log(`[IMG] Generating ${asset.id}...`);
  const start = Date.now();

  try {
    const result = await fal.subscribe("fal-ai/nano-banana-pro", {
      input: {
        prompt: asset.prompt,
        aspect_ratio: asset.aspect_ratio,
        resolution: asset.resolution || "1K",
        num_images: 1,
        output_format: "png",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          console.log(`  [${asset.id}] Queued...`);
        }
        if (update.status === "IN_PROGRESS") {
          console.log(`  [${asset.id}] Generating...`);
        }
      },
    });

    const imageUrl = result.data.images[0].url;
    console.log(`  [${asset.id}] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
    console.log(`  [${asset.id}] URL: ${imageUrl}`);

    // Download to public/recruit/generated/
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const outPath = join(OUTPUT_DIR, asset.filename);
    await writeFile(outPath, buffer);
    console.log(`  [${asset.id}] Saved: ${outPath}`);

    return { id: asset.id, url: imageUrl, path: outPath, success: true };
  } catch (err) {
    console.error(`  [${asset.id}] FAILED:`, err.message);
    return { id: asset.id, success: false, error: err.message };
  }
}

// ─── Generate Video from Hero Image ─────────────────────────────

async function generateVideo(heroImageUrl) {
  console.log(`[VID] Generating hero video from image...`);
  const start = Date.now();

  try {
    const result = await fal.subscribe(
      "fal-ai/kling-video/v3/standard/image-to-video",
      {
        input: {
          start_image_url: heroImageUrl,
          prompt:
            "Slow-motion 240fps footage of the football lineman explosively firing off the line of scrimmage. Turf particles spray from his cleats. Stadium lights create dramatic lens flares and rim lighting on the helmet. Breath vapor trails behind. The camera holds steady at turf level as the massive player drives forward with violent first-step explosion. Cinematic, ESPN broadcast quality slow motion. Dark background, dramatic backlighting.",
          duration: "5",
          aspect_ratio: "16:9",
          negative_prompt:
            "face visible, blurry, low quality, cartoon, anime, text, watermark",
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_QUEUE") {
            console.log(`  [hero-video] Queued...`);
          }
          if (update.status === "IN_PROGRESS") {
            const msgs = update.logs?.map((l) => l.message).filter(Boolean);
            if (msgs?.length) msgs.forEach((m) => console.log(`  [hero-video] ${m}`));
            else console.log(`  [hero-video] Generating...`);
          }
        },
      }
    );

    const videoUrl = result.data.video.url;
    console.log(
      `  [hero-video] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`
    );
    console.log(`  [hero-video] URL: ${videoUrl}`);

    // Download
    const response = await fetch(videoUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const outPath = join(OUTPUT_DIR, "hero-video.mp4");
    await writeFile(outPath, buffer);
    console.log(`  [hero-video] Saved: ${outPath}`);

    return { id: "hero-video", url: videoUrl, path: outPath, success: true };
  } catch (err) {
    console.error(`  [hero-video] FAILED:`, err.message);
    return { id: "hero-video", success: false, error: err.message };
  }
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("=== Recruit Page Asset Generation ===\n");

  // Ensure output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Step 1: Generate hero image first (needed for video)
  const heroResult = await generateImage(IMAGE_ASSETS[0]);

  // Step 2: Generate remaining images in parallel
  const otherImages = IMAGE_ASSETS.slice(1);
  const parallelResults = await Promise.all(
    otherImages.map((asset) => generateImage(asset))
  );

  // Step 3: Generate video from hero image (if hero succeeded)
  let videoResult = null;
  if (heroResult.success) {
    videoResult = await generateVideo(heroResult.url);
  } else {
    console.log("\n[VID] Skipping video — hero image failed.");
  }

  // Summary
  console.log("\n=== Results ===");
  const allResults = [heroResult, ...parallelResults];
  if (videoResult) allResults.push(videoResult);

  for (const r of allResults) {
    console.log(`  ${r.success ? "OK" : "FAIL"} ${r.id}${r.path ? ` → ${r.path}` : ""}${r.error ? ` (${r.error})` : ""}`);
  }

  const successCount = allResults.filter((r) => r.success).length;
  console.log(`\n${successCount}/${allResults.length} assets generated.`);
}

main().catch(console.error);
