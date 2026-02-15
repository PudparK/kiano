import { existsSync } from 'node:fs'
import path from 'node:path'

function publicFilePath(assetPath: string) {
  return path.join(process.cwd(), 'public', assetPath.replace(/^\//, ''))
}

function hasPublicAsset(assetPath: string) {
  return existsSync(publicFilePath(assetPath))
}

export function resolveOgImage(preferredPath: string) {
  const candidates = [preferredPath, '/og-default.png', '/graph-image.png']
  for (const candidate of candidates) {
    if (hasPublicAsset(candidate)) return candidate
  }

  console.warn(
    `[metadata] Missing OG images in public/: ${candidates.join(', ')}. Falling back to ${preferredPath}.`,
  )
  return preferredPath
}

export function warnIfPublicAssetMissing(assetPath: string, label: string) {
  if (!hasPublicAsset(assetPath)) {
    console.warn(`[metadata] Missing ${label} at public${assetPath}.`)
  }
}
