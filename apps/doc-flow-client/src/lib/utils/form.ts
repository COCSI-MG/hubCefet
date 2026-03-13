export function FormatFormDateToLocal(isoString: string) {
  if (!isoString) return { date: "", time: "" };
  const date = new Date(isoString);

  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  const isoLocal = localDate.toISOString();

  return {
    date: isoLocal.split("T")[0],
    time: isoLocal.split("T")[1].slice(0, 5)
  };
};
