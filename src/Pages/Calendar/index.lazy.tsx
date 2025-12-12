import { createLazyRoute } from '@tanstack/react-router'
import CalendarPage from './index'

export const Route = createLazyRoute('/calendar')({
  component: CalendarPage,
})
