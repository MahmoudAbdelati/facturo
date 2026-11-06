// Shared by the server layout and the client toggle, so it can't live in a "use client" file:
// a server component importing a value from one gets a client reference, not the value.
export const SIDEBAR_COOKIE = "facturo-sidebar";
