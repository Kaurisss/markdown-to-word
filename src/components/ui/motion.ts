import { type Transition, type Variants } from "framer-motion"
import { useReducedMotion as useFramerReducedMotion } from "framer-motion"

/**
 * 全局统一 transition 配置。
 * 后续各 variants 默认引用此对象，保持全项目动效节奏一致。
 */
export const motionTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
}

/**
 * 淡入 + 缩放（弹窗、菜单类）。
 */
export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/**
 * 淡入 + 垂直滑动（搜索框、浮层类）。
 */
export const fadeSlideY: Variants = {
  initial: { opacity: 0, y: -8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/**
 * 淡入 + 水平滑动（Ribbon tab 内容类）。
 */
export const fadeSlideX: Variants = {
  initial: { opacity: 0, x: -12 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

/**
 * 淡入 + 从下往上滑动（设置面板内容切换类）。
 */
export const fadeSlideYUp: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

/**
 * 包裹 framer-motion 的 useReducedMotion。
 * 动画组件可通过此 hook 在用户启用「减少动态效果」时关闭或降级动效。
 *
 * 用法：
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * const variants = prefersReducedMotion ? { ... } : fadeScale
 * ```
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion()
}