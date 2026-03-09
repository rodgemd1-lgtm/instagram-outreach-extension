# Media Lab Recruiting Content Research

Date: 2026-03-08

## Core conclusion

For a high school football recruit, the media stack should optimize for coach clarity before aesthetics:

- best rep first
- immediate player identification
- clear pre-snap context
- readable contact/finish
- short social cuts that still preserve technique
- natural-looking image optimization, not heavy stylization

Five-star style execution is not random volume. It is disciplined packaging: verified measurables, clean film, regular distribution, and media that looks intentional every time it appears on a coach's timeline.

## Source-backed guidance

### NCSA football recruiting video guide

Source: https://www.ncsasports.org/football/recruiting-video

Applied takeaways:

- Open with the strongest plays.
- Keep the core reel concise.
- Make player identification obvious before the snap.
- Prioritize game film over hype editing.

### NCSA how-to-get-recruited guide

Source: https://www.ncsasports.org/football/how-to-get-recruited

Applied takeaways:

- Recruiting progress compounds when film, measurables, camp exposure, and communication all stay current together.
- Social content should support the recruiting profile, not replace it.

### ARRI lighting handbook

Source: https://www.arri.com/en/learn-help/lighting/lighting-handbook

Applied takeaways:

- Preserve readable faces, jerseys, and body shape.
- Favor clean subject separation over dramatic grading.
- Avoid crushed shadows and blown highlights that hide technique.

### Adobe composition guidance

Source: https://www.adobe.com/creativecloud/photography/technique/rule-of-thirds.html

Applied takeaways:

- Subject clarity matters more than clever framing.
- Safe negative space helps when media gets reframed for X and website crops.
- Action images need an instant focal point.

### Adobe natural-light guidance

Source: https://www.adobe.com/creativecloud/photography/technique/golden-hour

Applied takeaways:

- Natural directional light produces better skin, helmet, and jersey detail.
- Subtle brightness/saturation correction is useful; heavy color treatment is not.

### CapCut workflow reality

Source: https://www.capcut.com/

Applied takeaways:

- CapCut is fine as a finishing tool.
- There is no dependable project-import workflow for third-party automation.
- Practical output is a rendered reel plus a shot list and manifest for manual finishing.

### X chunked media upload

Source: https://developer.x.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/chunked-media-upload

Applied takeaways:

- Real media posting to X requires upload before tweet creation.
- Video publishing needs INIT/APPEND/FINALIZE chunking.
- Draft generation can be automated now; full native media publish should be implemented as a follow-up integration.

## Operational standards used in the app

### Image analyzer

- Score technical quality, lighting balance, composition, recruiting value, and X crop safety.
- Boost finish-oriented action frames and profile-safe images.
- Apply only slight optimization: auto-rotate, resize, mild brightness/saturation lift, sharpening, JPEG export.

### Video analyzer

- Score thumbnail clarity, duration fitness, recruiting value, and trim readiness.
- Bias toward defensive finishes, impact reps, and prior premium cuts.
- Generate short trim windows suitable for reel sequencing and X clips.

### Post analyzer

- Use the existing recruiting voice and psychology stack.
- Avoid desperation language.
- Favor coach-facing specificity: hands, hips, finish, get-off, leverage, communication.
- Build drafts around real selected media, not abstract content buckets.

### Reel builder

- Export a quick-turn FFmpeg reel for immediate use.
- Export a CapCut shot list and manifest for manual polish.
- Keep the first wave of reel clips centered on wins at contact and clear finish reps.

## Remaining technical gap

The app now produces real ranked media, optimized photos, a reel package, and X-ready drafts from Jacob's actual library. The remaining major publishing gap is native X media upload for image/video attachments. That should be the next integration if full push-button social publishing is required.
