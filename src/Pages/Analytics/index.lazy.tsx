import { createLazyRoute } from '@tanstack/react-router'
import Analytics from './index'

export const Route = createLazyRoute('/analytics')({
  component: Analytics,
})
