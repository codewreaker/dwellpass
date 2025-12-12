import { createLazyRoute } from '@tanstack/react-router'
import TablesPage from './index'

export const Route = createLazyRoute('/database')({
  component: TablesPage,
})
