import { createLazyRoute } from '@tanstack/react-router'
import HomePage from './index'

export const Route = createLazyRoute('/')({
  component: HomePage,
})
