import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from './Pages/Layout'

// Root route - wraps all pages with layout (sidebar, topbar, etc.)
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Home route - Dashboard with HeroPanel and AttendanceTable
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
}).lazy(() => import('./Pages/Home/index.lazy').then((d) => d.Route))

// Members route - Members management page
const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
}).lazy(() => import('./Pages/Members/index.lazy').then((d) => d.Route))

// Calendar route - Events calendar page
const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
}).lazy(() => import('./Pages/Calendar/index.lazy').then((d) => d.Route))

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
}).lazy(() => import('./Pages/Analytics/index.lazy').then((d) => d.Route))

// Database route - Admin page to view all database tables
const databaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/database',
}).lazy(() => import('./Pages/Tables/index.lazy').then((d) => d.Route))

// Route tree - explicitly defines the structure
export const routeTree = rootRoute.addChildren([
  indexRoute,
  membersRoute,
  calendarRoute,
  analyticsRoute,
  databaseRoute
])

// Export individual routes for type safety and easy access
export const routes = {
  root: rootRoute,
  home: indexRoute,
  members: membersRoute,
  calendar: calendarRoute,
  analytics: analyticsRoute
} as const
