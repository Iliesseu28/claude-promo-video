# App Store app previews

From Apple's page "App preview specifications"
(<https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications>), read on
27 September 2026. **Read it again before each upload**: Apple adds screen sizes.

## Common rules

| Rule | Value |
| --- | --- |
| Length | 15 to 30 seconds |
| File size | 500 MB at most |
| Frame rate | 30 fps at most |
| Video | H.264 High Profile Level 4.0, 10 to 12 Mb/s VBR target, progressive; or ProRes 422 HQ only (`.mov`) |
| Audio | a stereo track is required: AAC 256 kb/s, 44.1 or 48 kHz; every track enabled |
| Files | `.mov`, `.m4v`, `.mp4` (H.264) |
| Count | up to 3 previews per localization (and per device size) |
| Poster frame | 5 seconds by default; set another frame in App Store Connect |

`scripts/render.sh` meets all of these for a Mac preview (1920 x 1080, 30 fps, H.264 High 4.0, AAC 256 kb/s 48 kHz
stereo). Its constant-quality encode sits under 10 Mb/s; if an upload is refused for its bit rate, encode again
with `-b:v 10M -maxrate 12M -bufsize 24M` instead of `-crf 15` (about 37 MB instead of 11.5 MB for 29 s).

## Sizes by platform

| Platform | Portrait | Landscape |
| --- | --- | --- |
| Mac | none | 1920 x 1080 |
| iPhone 6.9", 6.5", 6.3", 6.1" (every current iPhone) | 886 x 1920 | 1920 x 886 |
| iPhone 5.5" | 1080 x 1920 | 1920 x 1080 |
| iPad 13", 11", 10.5" | 1200 x 1600 | 1600 x 1200 |
| Apple TV | none | 1920 x 1080 |
| Apple Vision Pro | none | 3840 x 2160 |

## Guideline 2.3.4: the preview shows the app

App Review Guideline 2.3.4 asks previews to use video screen captures of the app itself; narration and video or
text overlays are allowed to explain what the video alone does not make clear. In practice: no device frame, no
hands, nothing the app does not show. Two risks to weigh before sending a promo video as a preview:

1. **Redrawn system scenery** (desktop, context menu, widget gallery, menu bar): the operating system draws it,
   not the app. A reviewer may see it as content outside the app.
2. **Numbers that change faster than in the app** (SimplyBar: a reading every 0.5 s in the video, every 2 s at
   best in the app). For a preview, use the app's real pace.

Safe fallback if Apple refuses: a preview made only of the app's own windows or screens, at its real pace. The
promo video itself stays fine for a README, a website or social posts.

## Upload

In App Store Connect: the version, then the localization, then the preview slot of the device size; drop the
file, then choose the poster frame. With the open-source `asc` command line (App Store Connect API):

```sh
# 1. the version and its localization (the localization id is not the locale code)
asc versions list --app "$APP_ID" --platform MAC_OS --latest
asc localizations list --version "$VERSION_ID" --output json --locale "en-US"      # data[].id

# 2. upload (a file or a folder); --skip-existing skips a file already sent (same MD5); try --dry-run first
asc video-previews upload --version-localization "$LOC_ID" --path out/promo.mp4 --device-type DESKTOP --skip-existing

# 3. the poster frame: HH:MM:SS:FF (frames) or HH:MM:SS.mmm; 24.2 s at 30 fps = 00:00:24:06
asc video-previews list --version-localization "$LOC_ID"
asc video-previews set-poster-frame --id "$PREVIEW_ID" --time-code "00:00:24:06"
```

Device types accepted by `asc` 5.4.0 (checked on 27 September 2026): `DESKTOP`, `IPHONE_69`, `IPHONE_67`,
`IPHONE_65`, `IPAD_PRO_3GEN_129`. `--replace --confirm` deletes the previews of that size before uploading.
