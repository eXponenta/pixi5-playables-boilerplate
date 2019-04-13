// @ts-ignore
export * from '@pixi/constants';
// @ts-ignore
export * from '@pixi/math';
// @ts-ignore
export * from '@pixi/runner';
// @ts-ignore
export * from '@pixi/settings';
// @ts-ignore
export * from '@pixi/ticker';
// @ts-ignore
import * as utils from '@pixi/utils';
export { utils };
// @ts-ignore
export * from '@pixi/display';
// @ts-ignore
export * from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
// @ts-ignore
export * from '@pixi/loaders';
// @ts-ignore
export * from '@pixi/sprite';
//@ts-ignore
export * from '@pixi/core'
// Renderer plugins
// @ts-ignore
import { Renderer } from '@pixi/core';
// @ts-ignore
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);