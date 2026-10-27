import type { LocationInput, PlaceLotInput, WarehouseInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const WAREHOUSES_KNOWLEDGE = describePage<WarehouseInput>({
  route: "/admin/warehouses",
  title: "Warehouses",
  purpose: "The warehouses and hubs you can work in, and the shelf locations stock is put away into.",
  steps: ["Find the warehouse in the list.", "Press Locations to see and add its shelves and bins.", "If you manage warehouses, add a new one with the form below, or close and reopen one."],
  fields: {
    countryCode: { labels: ["Country"], meaning: "The market the warehouse is in." },
    code: { labels: ["Warehouse code"], meaning: "A short, unique code for the warehouse.", example: "MAN-1", mistakes: ["Use 2 to 16 letters, numbers or dashes."] },
    name: { labels: ["Name"], meaning: "The warehouse's name.", mistakes: ["Between 2 and 80 characters."] },
    addressLines: { labels: ["Address", "Address line 2"], meaning: "The warehouse's street address. The second line is optional." },
    city: { labels: ["Town or city"], meaning: "The town or city the warehouse is in." },
    postalCode: { labels: ["Postcode"], meaning: "The warehouse's postcode.", mistakes: ["Between 2 and 16 characters."] },
  },
  related: [
    { href: "/admin/stock", label: "Stock" },
    { href: "/admin/receiving", label: "Receiving" },
  ],
});

export const WAREHOUSE_LOCATIONS_KNOWLEDGE = describePage<LocationInput>({
  route: "/admin/warehouses/[id]",
  title: "Warehouse locations",
  purpose: "The shelves and bins in one warehouse where stock is put away.",
  steps: [
    "Check the list of locations and how many stock lots each one holds.",
    "Add a location with a short code and a label that says where it is.",
    "Close a location you no longer use. It can only be closed once it's empty.",
  ],
  fields: {
    code: { labels: ["Code"], meaning: "The short code printed on the shelf or bin.", example: "A-01", mistakes: ["Use letters, numbers or dashes, up to 32 characters."] },
    label: { labels: ["Label"], meaning: "Where the location is, so people can find it.", example: "Aisle A, bay 1", mistakes: ["Up to 80 characters."] },
  },
  related: [
    { href: "/admin/warehouses", label: "Warehouses" },
    { href: "/admin/stock", label: "Stock" },
  ],
});

export const STOCK_KNOWLEDGE = describePage<PlaceLotInput & Record<"warehouse", unknown>>({
  route: "/admin/stock",
  title: "Stock",
  purpose: "Put newly received lots on a shelf and move them when you need to. Every step is recorded.",
  steps: [
    "Pick the warehouse, if you work in more than one.",
    "Start with Waiting to be put away.",
    "Choose a location for each lot and press Put away, or Move for a lot that's already on a shelf.",
    "Press History to see everything that has happened to a lot.",
  ],
  fields: {
    warehouse: { labels: ["Warehouse"], meaning: "The warehouse whose stock you want to see." },
    locationId: { labels: [/^Location for /], meaning: "The shelf or bin to put the lot on. Only open locations are listed." },
  },
  related: [
    { href: "/admin/warehouses", label: "Warehouses" },
    { href: "/admin/receiving", label: "Receiving" },
  ],
});
