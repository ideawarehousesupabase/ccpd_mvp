import type { ComplaintInput } from "../lib/ccpd-types";

export const dummyComplaints: ComplaintInput[] = [
  {
    customer: "Alice Smith",
    text: "My food arrived completely cold and the packaging was soggy.",
    category: "Food Temperature",
    branch: "Downtown",
    source: "App",
    priority: "High",
    status: "Open",
  },
  {
    customer: "Bob Jones",
    text: "The delivery was 45 minutes late and the driver was rude.",
    category: "Late Delivery",
    branch: "Uptown",
    source: "Website",
    priority: "Medium",
    status: "In Review",
  },
  {
    customer: "Charlie Brown",
    text: "I was missing the fries and the drink from my order.",
    category: "Missing Items",
    branch: "Downtown",
    source: "Phone",
    priority: "High",
    status: "Open",
  },
  {
    customer: "Diana Prince",
    text: "The salad was missing dressing and the lettuce was wilted.",
    category: "Order Accuracy",
    branch: "Westside",
    source: "App",
    priority: "Low",
    status: "Resolved",
  },
  {
    customer: "Evan Wright",
    text: "Food was hot but the delivery box was crushed.",
    category: "Food Packaging",
    branch: "Uptown",
    source: "Website",
    priority: "Medium",
    status: "Open",
  }
];
