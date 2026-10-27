import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as VideoThumbnails from 'expo-video-thumbnails';
import type { CamFile } from './camera';

// Cameras without a thumbnail endpoint (V4): grab a frame from the video itself, one at a time
// since each one reads part of the file over the camera's WiFi. Kept for the session once extracted.
// A failure is forgotten so the next Galerie visit retries (the camera refuses files while busy), and an
// extraction that never answers stops holding up the others after THUMB_TIMEOUT_MS.
const THUMB_TIMEOUT_MS = 20_000;
const thumbs = new Map<string, Promise<string>>();
const done = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();
export function videoThumb(url: string) {
  let p = thumbs.get(url);
  if (!p) {
    const timeout = () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), THUMB_TIMEOUT_MS));
    p = queue.then(() => Promise.race([VideoThumbnails.getThumbnailAsync(url, { time: 1000, quality: 0.5 }), timeout()])).then(
      (t) => { done.set(url, t.uri); return t.uri; },
      (e) => { thumbs.delete(url); throw e; },
    );
    queue = p.catch(() => {});
    thumbs.set(url, p);
  }
  return p;
}
/** The thumbnail URL if there is one, or the extracted frame once ready. */
export const cachedThumb = (f: CamFile) => f.thumb || done.get(f.url) || '';

/** The Galerie's current list, handed to the viewer so it can swipe through it (too big for route params). */
export const browsing: { files: CamFile[] } = { files: [] };

export const DENIED_MSG = 'Accès à Photos refusé. Autorisez-le dans Réglages > Caméra Casque.';

/** Add-only access is enough to save. */
export const photosAllowed = async () => (await MediaLibrary.requestPermissionsAsync(true)).granted;

async function download(name: string, url: string) {
  const dest = new File(new Directory(Paths.cache), name);
  if (dest.exists) dest.delete();
  return File.downloadFileAsync(url, dest);
}

/** Downloads a camera file and adds it to Photos. Call photosAllowed() first. */
export async function saveToPhotos(name: string, url: string) {
  const f = await download(name, url);
  try {
    await MediaLibrary.Asset.create(f.uri);
  } finally {
    f.delete();
  }
}

/** Downloads a camera file and opens the system share sheet. One file: expo-sharing shares a single URL. */
export async function share(name: string, url: string) {
  const f = await download(name, url);
  try {
    await Sharing.shareAsync(f.uri);
  } finally {
    f.delete();
  }
}
