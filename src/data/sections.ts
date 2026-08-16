/**
 * The page's sections, in scroll order. Kept out of NavRail because exporting
 * a constant alongside a component breaks React Fast Refresh for that file —
 * and because the nav is not the only thing that needs to know the running
 * order.
 *
 * The ids are contracts: `NavRail` scrolls to them and `useEraTheme` resolves
 * `#era-<id>` the same way. Renaming one without renaming its section silently
 * disables scroll-spy and the palette driver.
 */
export const SECTIONS = [
  { id: 'hero', label: 'Main' },
  { id: 'eras', label: 'Eras' },
  { id: 'members', label: 'Members' },
  { id: 'credits', label: 'Credits' },
] as const
