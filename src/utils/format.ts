const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const date = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export const formatDateTime = (value: string) => dateTime.format(new Date(value));
export const formatDate = (value: string) => date.format(new Date(value));
export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
