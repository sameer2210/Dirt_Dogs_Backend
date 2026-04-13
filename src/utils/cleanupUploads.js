import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const uploadsDir = path.join(process.cwd(), 'uploads');

const normalizeFilename = filename => {
  return filename.replace(/^\d+-/, '');
};

const log = message => console.log(`[cleanupUploads] ${message}`);

export const cleanupUploads = ({ dryRun = false } = {}) => {
  if (!fs.existsSync(uploadsDir) || !fs.lstatSync(uploadsDir).isDirectory()) {
    log(`Uploads folder not found at ${uploadsDir}`);
    return { removed: [], kept: [] };
  }

  const files = fs.readdirSync(uploadsDir).filter(item => {
    const fullPath = path.join(uploadsDir, item);
    return fs.lstatSync(fullPath).isFile();
  });

  const groups = new Map();
  for (const file of files) {
    const key = normalizeFilename(file);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(file);
  }

  const removed = [];
  const kept = [];

  for (const [key, groupFiles] of groups.entries()) {
    if (groupFiles.length <= 1) {
      kept.push(groupFiles[0]);
      continue;
    }

    const sorted = groupFiles
      .map(file => {
        const fullPath = path.join(uploadsDir, file);
        const { mtimeMs } = fs.statSync(fullPath);
        return { file, fullPath, mtimeMs };
      })
      .sort((a, b) => a.mtimeMs - b.mtimeMs);

    const keep = sorted.pop();
    kept.push(keep.file);

    for (const duplicate of sorted) {
      removed.push(duplicate.file);
      if (!dryRun && fs.existsSync(duplicate.fullPath)) {
        fs.unlinkSync(duplicate.fullPath);
      }
    }
  }

  if (removed.length === 0) {
    log('No duplicate files found.');
  } else if (dryRun) {
    log(`Dry run: would remove ${removed.length} duplicate file(s): ${removed.join(', ')}`);
  } else {
    log(`Removed ${removed.length} duplicate file(s): ${removed.join(', ')}`);
  }

  return { removed, kept };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dryRun = process.argv.includes('--dry-run');
  cleanupUploads({ dryRun });
}
