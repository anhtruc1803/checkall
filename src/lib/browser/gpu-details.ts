export interface GpuDetails {
  api: 'WebGL 2' | 'WebGL 1';
  version: string | null;
  shading: string | null;
  vendor: string | null;
  renderer: string | null;
  maxTextureSize: number | null;
  detailedVendor: string | null;
  detailedRenderer: string | null;
}
export function readGpuDetails(includeDetailed = false): GpuDetails | null {
  const canvas = document.createElement('canvas');
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let api: GpuDetails['api'] = 'WebGL 2';
  try {
    try {
      gl = canvas.getContext('webgl2');
    } catch {
      /* Try WebGL 1 when WebGL 2 is blocked. */
    }
    if (!gl) {
      api = 'WebGL 1';
      gl = canvas.getContext('webgl');
    }
    if (!gl || gl.isContextLost()) return null;
    const string = (parameter: number): string | null => {
      const value: unknown = gl!.getParameter(parameter);
      return typeof value === 'string' && value.length ? value.slice(0, 500) : null;
    };
    const size: unknown = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const debug = includeDetailed ? gl.getExtension('WEBGL_debug_renderer_info') : null;
    return {
      api,
      version: string(gl.VERSION),
      shading: string(gl.SHADING_LANGUAGE_VERSION),
      vendor: string(gl.VENDOR),
      renderer: string(gl.RENDERER),
      maxTextureSize: typeof size === 'number' && Number.isFinite(size) && size > 0 ? size : null,
      detailedVendor: debug ? string(debug.UNMASKED_VENDOR_WEBGL) : null,
      detailedRenderer: debug ? string(debug.UNMASKED_RENDERER_WEBGL) : null,
    };
  } catch {
    return null;
  } finally {
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* Browser may have already lost it. */
    }
    canvas.width = canvas.height = 0;
  }
}
