import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { CamFile } from './camera';

/** The Gallerie's current list, handed to the viewer so it can swipe through it (too big for route params). */
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
