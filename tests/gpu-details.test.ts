import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { readGpuDetails } from '@/lib/browser/gpu-details';
const loseContext = vi.fn();
const gl = {
  VERSION: 1,
  SHADING_LANGUAGE_VERSION: 2,
  VENDOR: 3,
  RENDERER: 4,
  MAX_TEXTURE_SIZE: 5,
  isContextLost: vi.fn(() => false),
  getParameter: vi.fn<(parameter: number) => unknown>(),
  getExtension: vi.fn<(name: string) => unknown>(),
};
beforeEach(() => {
  vi.resetAllMocks();
  gl.isContextLost.mockReturnValue(false);
  gl.getParameter.mockImplementation(
    (parameter) =>
      ({
        1: 'WebGL test',
        2: 'GLSL test',
        3: 'Masked vendor',
        4: 'Masked renderer',
        5: 4096,
        7: 'Driver vendor',
        8: 'Driver renderer',
      })[parameter as 1],
  );
  gl.getExtension.mockImplementation((name) =>
    name === 'WEBGL_lose_context'
      ? { loseContext }
      : name === 'WEBGL_debug_renderer_info'
        ? { UNMASKED_VENDOR_WEBGL: 7, UNMASKED_RENDERER_WEBGL: 8 }
        : null,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    gl as unknown as WebGLRenderingContext,
  );
});
afterEach(() => vi.restoreAllMocks());
it('reads masked context information and releases the context without querying detailed identity', () => {
  expect(readGpuDetails()).toMatchObject({
    api: 'WebGL 2',
    vendor: 'Masked vendor',
    renderer: 'Masked renderer',
    detailedRenderer: null,
    maxTextureSize: 4096,
  });
  expect(gl.getExtension).not.toHaveBeenCalledWith('WEBGL_debug_renderer_info');
  expect(gl.getParameter).not.toHaveBeenCalledWith(7);
  expect(loseContext).toHaveBeenCalledOnce();
});
it('queries driver strings only after explicit opt-in', () => {
  expect(readGpuDetails(true)?.detailedRenderer).toBe('Driver renderer');
  expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_debug_renderer_info');
  expect(loseContext).toHaveBeenCalledOnce();
});
it('falls back to WebGL 1 when WebGL 2 cannot be created', () => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
  expect(readGpuDetails()?.api).toBe('WebGL 1');
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenNthCalledWith(2, 'webgl');
});
it.each(['lost', 'read-error', 'missing'] as const)(
  'returns no fabricated data on %s',
  (reason) => {
    if (reason === 'lost') gl.isContextLost.mockReturnValue(true);
    if (reason === 'read-error')
      gl.getParameter.mockImplementation(() => {
        throw Error('blocked');
      });
    if (reason === 'missing')
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(readGpuDetails()).toBeNull();
    if (reason !== 'missing') expect(loseContext).toHaveBeenCalledOnce();
  },
);
it('does not substitute a texture limit or unmasked identity when the browser omits it', () => {
  gl.getParameter.mockReturnValue(undefined);
  gl.getExtension.mockReturnValue(null);
  expect(readGpuDetails(true)).toMatchObject({
    maxTextureSize: null,
    vendor: null,
    detailedRenderer: null,
  });
});
