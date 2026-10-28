/**
 * Project ZIP and Video Downloader Service
 * Uses fetch + Blob URL creation to guarantee non-empty binary downloads
 * across iframe environments and browser security policies.
 */

export async function downloadProjectZip(): Promise<{ success: boolean; bytes: number; message: string }> {
  try {
    const response = await fetch('/crop_rotation_optimizer_project.zip', {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} when fetching zip file.`);
    }

    const blob = await response.blob();
    if (blob.size < 50000) {
      throw new Error(`Downloaded zip archive is unusually small (${blob.size} bytes).`);
    }

    const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = 'crop_rotation_optimizer_project.zip';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    return {
      success: true,
      bytes: blob.size,
      message: `Successfully downloaded crop_rotation_optimizer_project.zip (${(blob.size / 1024).toFixed(1)} KB, 49 files).`
    };
  } catch (err: any) {
    // Direct fallback
    const directLink = document.createElement('a');
    directLink.href = '/crop_rotation_optimizer_project.zip';
    directLink.download = 'crop_rotation_optimizer_project.zip';
    directLink.target = '_blank';
    document.body.appendChild(directLink);
    directLink.click();
    document.body.removeChild(directLink);

    return {
      success: false,
      bytes: 0,
      message: err.message || 'Direct fallback download triggered.'
    };
  }
}
