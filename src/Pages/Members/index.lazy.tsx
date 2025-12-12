import { createLazyRoute } from '@tanstack/react-router'
import MembersPage from './index'

export const Route = createLazyRoute('/members')({
  component: MembersPage,
})
